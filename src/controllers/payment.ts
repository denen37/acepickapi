import { Request, Response } from "express";
import { Transfer, Transaction, Wallet, User, OnlineUser, Job, Profile, ProductTransaction, Product, Order } from "../models/Models";
import { randomId, errorResponse, handleResponse, successResponse } from "../utils/modules";
import config from "../config/configSetup"
import axios from 'axios'
import { JobStatus, OrderStatus, PayStatus, ProductStatus, ProductTransactionStatus, TransactionDescription, TransactionStatus, TransactionType, TransferStatus } from "../utils/enum";
import { v4 as uuidv4 } from 'uuid';
import { where } from "sequelize";
import { sendPushNotification } from "../services/notification";
import { initPaymentSchema, withdrawSchema } from "../validation/body";
import bcrypt from 'bcryptjs';
import { getIO } from "../chat";
import { Emit } from "../utils/events";
import { jobPaymentEmail, productPaymentEmail } from "../utils/messages";
import { sendEmail } from "../services/gmail";



export const initiatePayment = async (req: Request, res: Response) => {
    const { id, email, role } = req.user

    try {
        const result = initPaymentSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                status: false,
                message: 'Validation error',
                errors: result.error.flatten().fieldErrors,
            });
        }

        const { amount, description, jobId, productTransactionId } = result.data;

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

        const data = paystackResponseInit.data.data;


        const transaction = await Transaction.create({
            userId: id,
            amount: amount,
            reference: data.reference,
            status: TransactionStatus.PENDING,
            //channel: data.channel,
            currency: data.currency,
            timestamp: new Date(),
            description: description.toLowerCase(),
            jobId: description.toString().includes('job') ? jobId : null,
            productTransactionId: description.toString().includes('product') ? productTransactionId : null,
            type: TransactionType.CREDIT,
        })


        return successResponse(res, 'success', data)
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


            // if (created) {
            //     const wallet = await Wallet.findOne({ where: { userId: id } })

            //     if (wallet) {
            //         let prevAmount = Number(wallet.currentBalance);
            //         let newAmount = Number(transaction.amount);

            //         wallet.previousBalance = prevAmount;
            //         wallet.currentBalance = prevAmount + newAmount;

            //         await wallet.save()
            //     }
            // }

            // return handleResponse(res, 200, true, "Payment sucessfully verified", { result: paystackResponse.data })
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
    console.log(payload.event);

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

            return handleResponse(res, 200, true, 'Handled')
        } else if (payload.event.includes('charge.success')) {
            const { reference, status, channel, paid_at } = payload.data;

            const transaction = await Transaction.findOne({
                where: { reference: reference },
                include: [
                    {
                        model: User,
                        as: 'user',
                        include: [OnlineUser, Wallet]
                    }
                ]
            })

            if (!transaction) {
                return res.status(200).send('Transaction not found');
            }

            if (transaction.status === TransactionStatus.SUCCESS) {
                return res.status(200).send('Transaction already processed');
            }

            transaction.status = status;
            transaction.channel = channel;
            transaction.timestamp = new Date(paid_at);

            await transaction.save();

            if (transaction.jobId
                && (transaction.description === TransactionDescription.JOB_PAYMENT)) {
                const job = await Job.findByPk(transaction.jobId, {
                    include: [
                        {
                            model: User,
                            as: 'professional',
                            include: [Profile]
                        },
                        {
                            model: User,
                            as: 'client',
                            include: [Profile]
                        }
                    ]
                });

                if (job) {
                    job.status = JobStatus.ONGOING;
                    job.payStatus = PayStatus.PAID;
                    job.paymentRef = reference;

                    await job.save();

                    sendPushNotification(
                        transaction.user.fcmToken,
                        `Job Payment`,
                        `Job titled: ${job?.title} has been paid by ${job?.client?.profile?.firstName} ${job?.client?.profile?.lastName}}`,
                        {}
                    );

                    const email = jobPaymentEmail(job?.toJSON())

                    const msgStat = await sendEmail(
                        job.dataValues.professional.email,
                        email.title,
                        email.body,
                        job.dataValues.professional.profile.firstName + ' ' + job.dataValues.professional.profile.lastName
                    )
                }
            }

            if (transaction.productTransactionId
                && (transaction.description === TransactionDescription.PRODUCT_PAYMENT
                    || transaction.description === TransactionDescription.PRODUCT_ORDER_PAYMENT)) {
                const productTransaction = await ProductTransaction.findByPk(transaction.productTransactionId, {
                    include: [
                        {
                            model: User,
                            as: 'buyer',
                            include: [Profile]
                        },
                        {
                            model: User,
                            as: 'seller',
                            include: [Profile]
                        },
                        {
                            model: Product
                        }
                    ]
                });

                if (productTransaction) {
                    productTransaction.status = ProductTransactionStatus.ORDERED;
                    await productTransaction.save();

                    productTransaction.product.quantity -= productTransaction.quantity;
                    await productTransaction.product.save();
                    //send notification to buyer

                    sendPushNotification(
                        transaction.user.fcmToken,
                        `Product Payment`,
                        `${productTransaction?.quantity} of your product: ${productTransaction?.product.name} has been paid by ${productTransaction?.buyer.profile.firstName} ${productTransaction?.buyer.profile.lastName}`,
                        {}
                    );

                    //send email to buyer
                    const email = productPaymentEmail(productTransaction);

                    const msgStat = await sendEmail(
                        productTransaction.seller.email,
                        email.title,
                        email.body,
                        productTransaction.seller.profile.firstName + ' ' + productTransaction.seller.profile.lastName,
                    )
                }

            }

            if (transaction.description === TransactionDescription.PRODUCT_ORDER_PAYMENT) {
                const order = await Order.findOne({
                    where: {
                        productTransactionId: transaction.productTransactionId,
                        status: OrderStatus.PENDING,
                    }
                })


                if (order) {
                    order.status = OrderStatus.PAID;
                    await order.save();
                }
            }

            if (transaction.description === TransactionDescription.WALLET_TOPUP) {
                if (transaction.user.wallet) {
                    let prevAmount = Number(transaction.user.wallet.currentBalance);
                    let newAmount = Number(transaction.amount);

                    transaction.user.wallet.previousBalance = prevAmount;
                    transaction.user.wallet.currentBalance = prevAmount + newAmount;

                    await transaction.user.wallet.save()
                }
            }

            sendPushNotification(
                transaction.user.fcmToken,
                `Payment Success`,
                `Your Payment of ${transaction.amount} was successful`,
                {}
            );

            const io = getIO();

            if (transaction.user.onlineUser?.isOnline) {
                io.to(transaction.user.onlineUser?.socketId).emit(Emit.PAYMENT_SUCCESS, {
                    text: 'Payment Success', data: {
                        id: transaction.id,
                        status: transaction.status,
                        channel: transaction.channel,
                        amount: transaction.amount,
                        reference: transaction.reference,
                        timeStamp: transaction.timestamp,
                        type: transaction.type,
                        createdAt: transaction.createdAt,
                        updatedAt: transaction.updatedAt,
                    }
                });
            }

            return handleResponse(res, 200, true, 'Handled');
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


