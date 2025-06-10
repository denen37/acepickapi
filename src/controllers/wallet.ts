import { Request, Response } from "express"
import bcrypt from "bcryptjs"
import { errorResponse, handleResponse, successResponse } from "../utils/modules";
import { JobStatus, PayStatus, TransactionType } from "../enum";
import { v4 as uuidv4 } from 'uuid';
import { paymentSchema, pinSchema } from "../validation/body";
import { Job, Wallet, Transaction, User, Profile } from "../models/Models";
import { randomUUID } from "crypto";
import { jobPaymentEmail } from "../utils/messages";
import { sendEmail } from "../services/gmail";
import { sendPushNotification } from "../services/notification";
import z from "zod";

export const createWallet = async (req: Request, res: Response) => {
    const { id } = req.user;
    const { currency = 'NGN' } = req.body;

    try {
        const wallet = await Wallet.create({
            userId: id,
            currency: currency,
            currentBalance: 0,
            previousBalance: 0
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
            attributes: {
                exclude: ['pin']
            },
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

    // Usage example
    const result = paymentSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({ errors: result.error.format() });
    }

    const { amount, pin, reason, jobId } = result.data;


    const job = await Job.findByPk(jobId, {
        include: [
            {
                model: User,
                as: 'client',
                include: [Profile]
            },
            {
                model: User,
                as: 'professional',
                include: [Profile]
            }
        ]
    });


    if (!job) {
        return handleResponse(res, 404, false, 'Job not found');
    }

    if (job.payStatus === PayStatus.PAID) {
        return handleResponse(res, 400, false, 'Job has already been paid for')
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

        //console.log('prevBalance', prevBalance, typeof prevBalance, 'amount', amount, typeof amount);

        if (prevBalance < amount) {
            return handleResponse(res, 400, false, 'Insufficient balance')
        }

        let currBalance = prevBalance - amount;

        await wallet.update({
            currentBalance: currBalance,
            previousBalance: prevBalance
        });

        await wallet.save();


        job.payStatus = PayStatus.PAID;

        job.paymentRef = randomUUID();

        job.status = JobStatus.ONGOING;

        await job.save();

        job.client.profile.totalJobsOngoing = Number(job.client.profile.totalJobsOngoing || 0) + 1;

        job.professional.profile.totalJobsOngoing = Number(job.professional.profile.totalJobsOngoing || 0) + 1;

        await job.client.profile.save();

        await job.professional.profile.save();


        const transaction = await Transaction.create({
            userId: id,
            jobId: jobId || null,
            amount: amount,
            reference: job.paymentRef,
            status: 'success',
            channel: 'wallet',
            timestamp: Date.now(),
            description: reason || 'Wallet payment',
            type: TransactionType.DEBIT,
        })

        const emailTosend = jobPaymentEmail(job);

        const msgStat = await sendEmail(
            job.dataValues.professional.email,
            emailTosend.title,
            emailTosend.body,
            job.dataValues.professional.profile.firstName + ' ' + job.dataValues.professional.profile.lastName
            //'User'
        )

        //Send notification to the client
        if (job.dataValues.professional.fcmToken) {
            await sendPushNotification(
                job.dataValues.professional.fcmToken,
                'Job Payment',
                `Your Job: ${job.dataValues.title} has been paid}`,
                {}
            );
        }


        return successResponse(res, 'success', transaction)

    } catch (error: any) {
        return errorResponse(res, 'error', error.message)
    }
}

export const setPin = async (req: Request, res: Response) => {
    const { id, role } = req.user;


    const pinSchema = z.object({
        pin: z.string().regex(/^\d{4}$/, 'PIN must be exactly 4 digits'),
    })

    const result = pinSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({ errors: result.error.format() });
    }


    const { pin } = result.data;


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


    // Usage example
    const result = pinSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({ errors: result.error.format() });
    }

    const { newPin, newPinconfirm } = result.data;

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

