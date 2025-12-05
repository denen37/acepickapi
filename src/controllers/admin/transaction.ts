import { Request, Response } from "express";
import { Transaction } from "../../models/Models";
import { TransactionStatus, TransactionType } from "../../utils/enum";
import { errorResponse, successResponse } from "../../utils/modules";
import { getTransactionSchema } from "../../validation/query";

export const transactionStat = async (req: Request, res: Response) => {
    try {
        const totalTransactions = await Transaction.count();
        const successfulTransactions = await Transaction.count({
            where: {
                status: TransactionStatus.SUCCESS
            }
        });

        const failedTransactions = await Transaction.count({
            where: {
                status: TransactionStatus.FAILED
            }
        });

        const pendingTransactions = await Transaction.count({
            where: {
                status: TransactionStatus.PENDING
            }
        });

        const inboundAmount = await Transaction.sum('amount', {
            where: {
                type: TransactionType.CREDIT,
                status: TransactionStatus.SUCCESS
            }
        });

        const outboundAmount = await Transaction.sum('amount', {
            where: {
                type: TransactionType.DEBIT,
                status: TransactionStatus.SUCCESS
            }
        });

        return successResponse(res, 'success', {
            totalTransactions,
            successfulTransactions,
            failedTransactions,
            pendingTransactions,
            inboundAmount,
            outboundAmount
        })
    } catch (error) {
        console.log(error);
        return errorResponse(res, "error", 'Internal Server Error');
    }
}

export const getAllTransactions = async (req: Request, res: Response) => {
    try {
        const result = getTransactionSchema.safeParse(req.query);
        if (!result.success) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid request data',
                errors: result.error.flatten()
            });
        }

        const { status, page, limit } = result.data;

        const transactions = await Transaction.findAll({
            where: status && status !== 'all' ? { status } : {},
            offset: (page - 1) * limit,
            limit: limit,
            order: [['createdAt', 'DESC']]
        });

        return successResponse(res, 'success', { transactions });
    } catch (error) {
        console.log(error);
        return errorResponse(res, "error", 'Internal Server Error');
    }
}