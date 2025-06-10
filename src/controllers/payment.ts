import { Request, Response } from "express";
import { Transfer, Transaction, Wallet } from "../models/Models";
import { errorResponse, handleResponse, successResponse } from "../utils/modules";
import config from "../config/configSetup"
import axios from 'axios'
import { TransactionStatus, TransactionType } from "../enum";
import { v4 as uuidv4 } from 'uuid';



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

    const paystackResponse = await axios.get(
        `https://api.paystack.co/transaction/verify/${ref}`,
        {
            headers: {
                Authorization: `Bearer ${config.PAYSTACK_SECRET_KEY}`,
            },
        }
    );

    const { data } = paystackResponse.data;

    const transaction = await Transaction.create({
        userId: id,
        amount: data.amount / 100,
        reference: data.reference,
        status: data.status,
        channel: data.channel,
        currency: data.currency,
        timestamp: data.paid_at,
        description: 'Wallet topup',
        type: TransactionType.CREDIT,
    })

    if (data.status === TransactionStatus.SUCCESS) {
        const wallet = await Wallet.findOne({ where: { userId: id } })

        if (wallet) {
            let prevAmount = Number(wallet.currentBalance);
            let newAmount = Number(transaction.amount);

            wallet.previousBalance = prevAmount;
            wallet.currentBalance = prevAmount + newAmount;

            await wallet.save()
        }

        return successResponse(res, 'success', { transaction, wallet });
    }

    return successResponse(res, 'success', transaction);
}


export const initiateTransfer = async (req: Request, res: Response) => {
    const { amount, recipientCode, reason = "Withdrawal" } = req.body;
    const reference = uuidv4();

    const transfer = await Transfer.create({
        userId: req.user.id,
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
