import { Request, Response } from "express"
import { Transaction } from "../models/Transaction";
import { Wallet } from "../models/Wallet";
import bcrypt from "bcryptjs"
import { errorResponse, handleResponse, successResponse } from "../utils/modules";
import { TransactionType } from "../enum";
import { v4 as uuidv4 } from 'uuid';

export const createWallet = async (req: Request, res: Response) => {
    const { id } = req.user;
    const { currency = 'NGN' } = req.body;

    try {
        const wallet = await Wallet.create({
            userId: id,
            currency: currency,
            balance: 0,
        });

        return successResponse(res, "success", wallet);
    } catch (error: any) {
        return errorResponse(res, 'error', error.message);
    }
}

export const viewWallet = async (req: Request, res: Response) => {
    const { id } = req.user;

    try {
        const wallet = await Wallet.findOne({
            where: { userId: id },
            attributes: ["balance", "currency", "userId"],
        });

        if (!wallet) {
            return handleResponse(res, 404, false, "Wallet not found");
        }

        return successResponse(res, "success", wallet);
    } catch (error) {
        return errorResponse(res, "An error occurred", error);
    }
}

export const debitWallet = async (req: Request, res: Response) => {
    const { id, role } = req.user;

    const { amount, pin, reason, jobId } = req.body;

    if (!amount) {
        return handleResponse(res, 400, false, 'Amount is required')
    }

    try {
        const wallet = await Wallet.findOne({ where: { userId: id } });

        if (!wallet) {
            return handleResponse(res, 404, false, 'Wallet not found')
        }

        if (!wallet.pin) {
            return handleResponse(res, 400, false, 'Pin not set')
        }

        const match = await bcrypt.compare(pin, wallet.pin);

        if (!match) {
            return handleResponse(res, 400, false, 'Incorrect pin')
        }

        let prevBalance = Number(wallet.currentBalance);

        console.log('prevBalance', prevBalance, typeof prevBalance, 'amount', amount, typeof amount);

        if (prevBalance < amount) {
            return handleResponse(res, 400, false, 'Insufficient balance')
        }

        let currBalance = prevBalance - amount;

        await wallet.update({
            currentBalance: currBalance,
            previousBalance: prevBalance
        });

        await wallet.save();

        const transaction = await Transaction.create({
            userId: id,
            jobId: jobId || null,
            amount: amount,
            reference: uuidv4(),
            status: 'success',
            channel: 'wallet',
            timestamp: Date.now(),
            description: reason || 'Wallet payment',
            type: TransactionType.DEBIT,
        })

        return successResponse(res, 'success', transaction)

    } catch (error: any) {
        return errorResponse(res, 'error', error.message)
    }
}

export const setPin = async (req: Request, res: Response) => {
    const { id, role } = req.user;

    const { pin } = req.body;

    if (!pin || pin.length < 5) {
        return handleResponse(res, 400, false, 'Pin must be at least 5 characters')
    }

    try {
        const wallet = await Wallet.findOne({ where: { userId: id } });

        if (!wallet) {
            return handleResponse(res, 404, false, 'Wallet not found')
        }

        // Hash pin
        const hashedPin = await bcrypt.hash(pin, 10);

        await wallet.update({ pin: hashedPin });

        await wallet.save();

        return successResponse(res, 'success', 'Pin set successfully')

    } catch (error) {
        return errorResponse(res, 'error', 'An error occurred')
    }
}


export const resetPin = async (req: Request, res: Response) => {
    const { id, role } = req.user;

    const { newPin, newPinconfirm } = req.body;

    if (newPin !== newPinconfirm) {
        return handleResponse(res, 400, false, 'New pin and confirm pin do not match')
    }

    try {
        const wallet = await Wallet.findOne({ where: { userId: id } });

        if (!wallet) {
            return handleResponse(res, 404, false, 'Wallet not found')
        }

        // Hash pin
        const hashedPin = await bcrypt.hash(newPin, 10);

        wallet.pin = hashedPin;

        await wallet.save();

        return successResponse(res, 'success', 'Pin reset successfully')
    } catch (error) {
        return errorResponse(res, 'error', error)
    }
}

export const creditWallet = async (req: Request, res: Response) => {
    try {
        const { id } = req.user;
        const { amount, userId } = req.body;

        const wallet = await Wallet.findOne({ where: { userId: userId ? userId : id } });

        if (!wallet) {
            return handleResponse(res, 404, false, 'Wallet not found')
        }

        wallet.previousBalance = Number(wallet.currentBalance);

        wallet.currentBalance = Number(wallet.currentBalance) + Number(amount);

        await wallet.save();

        return successResponse(res, 'success', { balance: wallet.currentBalance })
    } catch (error) {
        return errorResponse(res, 'error', error)
    }
}

