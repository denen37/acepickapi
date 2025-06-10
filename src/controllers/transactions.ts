import { Request, Response } from "express";
import { Transaction } from "../models/Transaction";
import { successResponse, errorResponse } from '../utils/modules'

export const getAllTransactions = async (req: Request, res: Response) => {
    const { id, role } = req.user;

    try {
        const transactions = await Transaction.findAll({ where: { userId: id } })

        return successResponse(res, 'success', transactions)
    } catch (error) {
        return errorResponse(res, 'error', error)
    }
}

export const getTransactionById = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const transaction = await Transaction.findOne({ where: { id } })

        if (!transaction) {
            return errorResponse(res, 'error', 'Transaction not found')
        }

        return successResponse(res, 'success', transaction)
    } catch (error) {
        return errorResponse(res, 'error', error)
    }

}

