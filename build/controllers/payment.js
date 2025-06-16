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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initiateTransfer = exports.verifyPayment = exports.initiatePayment = void 0;
const Models_1 = require("../models/Models");
const modules_1 = require("../utils/modules");
const configSetup_1 = __importDefault(require("../config/configSetup"));
const axios_1 = __importDefault(require("axios"));
const enum_1 = require("../utils/enum");
const uuid_1 = require("uuid");
const initiatePayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, email, role } = req.user;
    const { amount } = req.body;
    try {
        if (!id || !email || !role) {
            return (0, modules_1.handleResponse)(res, 403, false, "Unauthorized user");
        }
        // Initiate payment with Paystack API
        const paystackResponseInit = yield axios_1.default.post("https://api.paystack.co/transaction/initialize", {
            email: email,
            amount: amount * 100,
        }, {
            headers: {
                Authorization: `Bearer ${configSetup_1.default.PAYSTACK_SECRET_KEY}`,
            },
        });
        return (0, modules_1.successResponse)(res, 'success', paystackResponseInit.data.data);
    }
    catch (error) {
        return (0, modules_1.handleResponse)(res, 500, false, 'An error occurred while initiating payment');
    }
});
exports.initiatePayment = initiatePayment;
const verifyPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const { ref } = req.params;
    try {
        const paystackResponse = yield axios_1.default.get(`https://api.paystack.co/transaction/verify/${ref}`, {
            headers: {
                Authorization: `Bearer ${configSetup_1.default.PAYSTACK_SECRET_KEY}`,
            },
        });
        const { data } = paystackResponse.data;
        if (data.status === enum_1.TransactionStatus.SUCCESS) {
            const [transaction, created] = yield Models_1.Transaction.findOrCreate({
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
                    type: enum_1.TransactionType.CREDIT,
                }
            });
            if (created) {
                const wallet = yield Models_1.Wallet.findOne({ where: { userId: id } });
                if (wallet) {
                    let prevAmount = Number(wallet.currentBalance);
                    let newAmount = Number(transaction.amount);
                    wallet.previousBalance = prevAmount;
                    wallet.currentBalance = prevAmount + newAmount;
                    yield wallet.save();
                }
            }
            return (0, modules_1.handleResponse)(res, 200, true, "Payment sucessfully verified", { result: paystackResponse.data });
        }
        return (0, modules_1.handleResponse)(res, 200, true, "Payment sucessfully verified", { result: paystackResponse.data });
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, 'error', error);
    }
});
exports.verifyPayment = verifyPayment;
const initiateTransfer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { amount, recipientCode, reason = "Withdrawal" } = req.body;
    const reference = (0, uuid_1.v4)();
    const transfer = yield Models_1.Transfer.create({
        userId: req.user.id,
        amount,
        recipientCode,
        reference,
        reason,
        timestamp: new Date(),
    });
    const response = yield axios_1.default.post('https://api.paystack.co/transfer', {
        source: 'balance',
        amount: amount * 100,
        recipient: recipientCode,
        reference: reference,
        reason: reason,
    }, {
        headers: {
            Authorization: `Bearer ${configSetup_1.default.PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
        },
    });
    return (0, modules_1.successResponse)(res, 'success', response.data.data);
});
exports.initiateTransfer = initiateTransfer;
