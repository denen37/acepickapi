import { Request, Response } from "express";
import { Account } from "../models/Models";
import config from "../config/configSetup";
import axios from "axios";
import { errorResponse, handleResponse, successResponse } from "../utils/modules";
import { bankDetailsSchema, resolveBankSchema } from "../validation/body";

export const getBanks = async (req: Request, res: Response) => {
    try {
        const response = await axios.get("https://api.paystack.co/bank?currency=NGN", {
            headers: {
                Authorization: `Bearer ${config.PAYSTACK_SECRET_KEY}`
            }
        })

        return successResponse(res, "success", response.data.data)
    } catch (error: any) {
        return errorResponse(res, "error", error.message)
    }
}


export const addAccount = async (req: Request, res: Response) => {
    const { id } = req.user;

    const result = bankDetailsSchema.safeParse(req.body);


    if (!result.success) {
        return res.status(400).json({ errors: result.error.format() });
    }

    const { accountName, bank, bankCode, accountNumber } = result.data;

    const response = await axios.post(
        'https://api.paystack.co/transferrecipient',
        {
            type: 'nuban',
            name: accountName,
            account_number: accountNumber,
            bank_code: bankCode,
            currency: 'NGN',
        },
        {
            headers: {
                Authorization: `Bearer ${config.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
        }
    );

    const { data } = response.data;

    const account = await Account.create({
        userId: id,
        name: accountName,
        bank: bank,
        number: accountNumber,
        recipientCode: data.recipient_code,
        currency: data.currency,
    })

    return successResponse(res, 'success', account);
}


export const getAccounts = async (req: Request, res: Response) => {
    try {
        const { id } = req.user;

        const accounts = await Account.findAll({ where: { userId: id } });

        return successResponse(res, 'success', accounts);
    } catch (error: any) {
        return errorResponse(res, 'error', error.message);
    }
}

export const resolveAccount = async (req: Request, res: Response) => {
    const result = resolveBankSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            status: false,
            message: 'Validation error',
            errors: result.error.flatten().fieldErrors,
        });
    }


    const { accountNumber, bankCode } = result.data;

    const response = await axios.get(
        ` https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
        {
            headers: {
                Authorization: `Bearer ${config.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
        }
    );

    return successResponse(res, 'success', response.data);
}


export const updateAccount = async (req: Request, res: Response) => {
    const recipientCode = req.params.recipientCode;

    const { name } = req.body;

    try {
        const account = await Account.findOne({ where: { recipientCode } });

        if (!account) {
            return handleResponse(res, 404, false, 'Account not found')
        }

        const response = await axios.put(`https://api.paystack.co/transferrecipient/${recipientCode}`, { name }, {
            headers: {
                Authorization: `Bearer ${config.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.data.status) {
            account.name = name

            await account.save();

            return successResponse(res, 'success', account);
        }
    } catch (error) {
        return errorResponse(res, 'error', error);
    }
}


export const deleteAccount = async (req: Request, res: Response) => {
    const { id } = req.user;

    const { recipientCode } = req.params;

    const account = await Account.findOne({ where: { userId: id, recipientCode } });

    try {
        if (!account) {
            return handleResponse(res, 404, false, 'Account not found');
        }

        let response = await axios.delete(`https://api.paystack.co/transferrecipient/${recipientCode}`, {
            headers: {
                Authorization: `Bearer ${config.PAYSTACK_SECRET_KEY}`
            }
        })

        if (response.data.status) {
            await account.destroy();

            return successResponse(res, 'success', response.data);
        }

    } catch (error) {
        return errorResponse(res, 'error', error);
    }
}