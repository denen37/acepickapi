"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllTransactions = exports.transactionStat = void 0;
const Models_1 = require("../../models/Models");
const enum_1 = require("../../utils/enum");
const modules_1 = require("../../utils/modules");
const query_1 = require("../../validation/query");
const transactionStat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalTransactions = yield Models_1.Transaction.count();
        const successfulTransactions = yield Models_1.Transaction.count({
            where: {
                status: enum_1.TransactionStatus.SUCCESS
            }
        });
        const failedTransactions = yield Models_1.Transaction.count({
            where: {
                status: enum_1.TransactionStatus.FAILED
            }
        });
        const pendingTransactions = yield Models_1.Transaction.count({
            where: {
                status: enum_1.TransactionStatus.PENDING
            }
        });
        const inboundAmount = yield Models_1.Transaction.sum('amount', {
            where: {
                type: enum_1.TransactionType.CREDIT,
                status: enum_1.TransactionStatus.SUCCESS
            }
        });
        const outboundAmount = yield Models_1.Transaction.sum('amount', {
            where: {
                type: enum_1.TransactionType.DEBIT,
                status: enum_1.TransactionStatus.SUCCESS
            }
        });
        return (0, modules_1.successResponse)(res, 'success', {
            totalTransactions,
            successfulTransactions,
            failedTransactions,
            pendingTransactions,
            inboundAmount,
            outboundAmount
        });
    }
    catch (error) {
        console.log(error);
        return (0, modules_1.errorResponse)(res, "error", 'Internal Server Error');
    }
});
exports.transactionStat = transactionStat;
const getAllTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = query_1.getTransactionSchema.safeParse(req.query);
        if (!result.success) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid request data',
                errors: result.error.flatten()
            });
        }
        const { status, page, limit } = result.data;
        const transactions = yield Models_1.Transaction.findAll({
            where: status && status !== 'all' ? { status } : {},
            offset: (page - 1) * limit,
            limit: limit,
            order: [['createdAt', 'DESC']]
        });
        return (0, modules_1.successResponse)(res, 'success', { transactions });
    }
    catch (error) {
        console.log(error);
        return (0, modules_1.errorResponse)(res, "error", 'Internal Server Error');
    }
});
exports.getAllTransactions = getAllTransactions;
