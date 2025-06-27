import { Request, Response } from "express";
import { Transfer, Transaction, Wallet, User, OnlineUser } from "../models/Models";
import { randomId, errorResponse, handleResponse, successResponse } from "../utils/modules";
import config from "../config/configSetup"
import axios from 'axios'
import { TransactionStatus, TransactionType, TransferStatus } from "../utils/enum";
import { v4 as uuidv4 } from 'uuid';
import { where } from "sequelize";
import { sendPushNotification } from "../services/notification";
import { withdrawSchema } from "../validation/body";
import bcrypt from 'bcryptjs';



export const initiatePayment = async (req: Request, res: Response) => {
    const { id, email, role } = req.user
    const { amount } = req.body

    try {
        if (!id || !email || !role) {
            return handleResponse(res, 403, false, "Unauthorized user")
        }


        // Initiate payment with Paystack API
        const paystackResponseInit = await axios.post(
            "https://api.paystack.co/transaction/initialize",
            {
                email: email,
                amount: amount * 100,
            },
            {
                headers: {
                    Authorization: `Bearer ${config.PAYSTACK_SECRET_KEY}`,
                },
            }
        );

        return successResponse(res, 'success', paystackResponseInit.data.data)
    } catch (error) {
        return handleResponse(res, 500, false, 'An error occurred while initiating payment')
    }
}

export const verifyPayment = async (req: Request, res: Response) => {
    const { id } = req.user
    const { ref } = req.params

    try {

        const paystackResponse = await axios.get(
            `https://api.paystack.co/transaction/verify/${ref}`,
            {
                headers: {
                    Authorization: `Bearer ${config.PAYSTACK_SECRET_KEY}`,
                },
            }
        );

        const { data } = paystackResponse.data;

        if (data.status === TransactionStatus.SUCCESS) {
            const [transaction, created] = await Transaction.findOrCreate({
                where: { reference: ref },
                defaults: {
                    userId: id,
                    amount: data.amount / 100,
                    reference: data.reference,
                    status: data.status,
                    channel: data.channel,
                    currency: data.currency,
                    timestamp: new Date(),
                    description: 'Wallet topup',
                    type: TransactionType.CREDIT,
                }
            })

            if (created) {
                const wallet = await Wallet.findOne({ where: { userId: id } })

                if (wallet) {
                    let prevAmount = Number(wallet.currentBalance);
                    let newAmount = Number(transaction.amount);

                    wallet.previousBalance = prevAmount;
                    wallet.currentBalance = prevAmount + newAmount;

                    await wallet.save()
                }
            }

            return handleResponse(res, 200, true, "Payment sucessfully verified", { result: paystackResponse.data })
        }

        return handleResponse(res, 200, true, "Payment sucessfully verified", { result: paystackResponse.data })
    } catch (error) {
        return errorResponse(res, 'error', error);
    }
}


export const initiateTransfer = async (req: Request, res: Response) => {
    const { id } = req.user;

    const result = withdrawSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            status: false,
            message: 'Validation error',
            errors: result.error.flatten().fieldErrors,
        });
    }

    const { amount, recipientCode, pin, reason } = result.data;

    const wallet = await Wallet.findOne({ where: { userId: id } });

    if (!wallet) {
        return errorResponse(res, 'error', 'Wallet not found');
    }

    if (!wallet.pin) {
        return handleResponse(res, 403, false, 'Pin not set. Please set your pin to continue');
    }

    if (!bcrypt.compareSync(pin, wallet.pin)) {
        return handleResponse(res, 403, false, 'Invalid PIN');
    }

    if (amount > wallet.currentBalance) {
        return handleResponse(res, 403, false, 'Insufficient balance');
    }

    const reference = randomId(12);

    const transfer = await Transfer.create({
        userId: id,
        amount,
        recipientCode,
        reference,
        reason,
        timestamp: new Date(),
    })

    const response = await axios.post(
        'https://api.paystack.co/transfer',
        {
            source: 'balance',
            amount: amount * 100,
            recipient: recipientCode,
            reference: reference,
            reason: reason,
        },
        {
            headers: {
                Authorization: `Bearer ${config.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
        }
    );

    return successResponse(res, 'success', response.data.data);
}

export const finalizeTransfer = async (req: Request, res: Response) => {


    const { transferCode, otp } = req.body;

    const response = await axios.post('https://api.paystack.co/transfer/finalize_transfer', {
        transfer_code: transferCode,
        otp: otp
    }, {
        headers: {
            Authorization: `Bearer ${config.PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json'
        }
    })

    return successResponse(res, 'success', response.data.data);
}

export const handlePaystackWebhook = async (req: Request, res: Response) => {
    const payload = req.body;
    console.log("webhook called");

    try {
        if (payload.event.includes('transfer')) {
            const transfer = await Transfer.findOne({
                where: { reference: payload.data.reference }
            });

            if (!transfer) {
                return res.status(200).send('Transfer not found');
            }

            const user = await User.findOne({
                where: { id: transfer.userId },
                include: [OnlineUser, Wallet]
            });

            if (!user) {
                return res.status(200).send('User not found');
            }

            switch (payload.event) {
                case 'transfer.success':
                    transfer.status = TransferStatus.SUCCESS;
                    await transfer.save();

                    user.wallet.previousBalance = user.wallet.currentBalance;
                    user.wallet.currentBalance -= transfer.amount;
                    await user.wallet.save();

                    sendPushNotification(
                        user.fcmToken,
                        `Transfer Success`,
                        `Your transfer of ${transfer.amount} was successful`,
                        {}
                    );
                    break;

                case 'transfer.failed':
                    transfer.status = TransferStatus.FAILED;
                    await transfer.save();

                    sendPushNotification(
                        user.fcmToken,
                        `Transfer Failed`,
                        `Your transfer of ${transfer.amount} failed`,
                        {}
                    );
                    break;

                case 'transfer.reversed':
                    sendPushNotification(
                        user.fcmToken,
                        `Transfer Reversed`,
                        `Your transfer of ${transfer.amount} has been reversed`,
                        {}
                    );
                    break;

                default:
                    break;
            }

            return handleResponse(res, 200, false, 'Handled')
        } else {
            return handleResponse(res, 400, false, 'Invalid event type')
        }
    } catch (error) {
        console.error('Webhook error:', error);
        return res.status(500).send('Internal server error');
    }
}

export const verifyTransfer = async (req: Request, res: Response) => {
    const { ref } = req.params

    try {
        const response = await axios.get(`https://api.paystack.co/transfer/verify/${ref}`, {
            headers: {
                'Authorization': `Bearer ${config.PAYSTACK_SECRET_KEY}`
            }
        })

        return successResponse(res, 'success', response.data.data);
    } catch (error: any) {
        console.log(error);
        return errorResponse(res, 'error', error.response.data.message);
    }
}

