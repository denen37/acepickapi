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
exports.creditWallet = exports.resetPin = exports.setPin = exports.debitWallet = exports.viewWallet = exports.createWallet = void 0;
const Transaction_1 = require("../models/Transaction");
const Wallet_1 = require("../models/Wallet");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const modules_1 = require("../utils/modules");
const enum_1 = require("../enum");
const uuid_1 = require("uuid");
const createWallet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const { currency = 'NGN' } = req.body;
    try {
        const wallet = yield Wallet_1.Wallet.create({
            userId: id,
            currency: currency,
            balance: 0,
        });
        return (0, modules_1.successResponse)(res, "success", wallet);
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, 'error', error.message);
    }
});
exports.createWallet = createWallet;
const viewWallet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    try {
        const wallet = yield Wallet_1.Wallet.findOne({
            where: { userId: id },
            attributes: ["balance", "currency", "userId"],
        });
        if (!wallet) {
            return (0, modules_1.handleResponse)(res, 404, false, "Wallet not found");
        }
        return (0, modules_1.successResponse)(res, "success", wallet);
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, "An error occurred", error);
    }
});
exports.viewWallet = viewWallet;
const debitWallet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, role } = req.user;
    const { amount, pin, reason, jobId } = req.body;
    if (!amount) {
        return (0, modules_1.handleResponse)(res, 400, false, 'Amount is required');
    }
    try {
        const wallet = yield Wallet_1.Wallet.findOne({ where: { userId: id } });
        if (!wallet) {
            return (0, modules_1.handleResponse)(res, 404, false, 'Wallet not found');
        }
        if (!wallet.pin) {
            return (0, modules_1.handleResponse)(res, 400, false, 'Pin not set');
        }
        const match = yield bcryptjs_1.default.compare(pin, wallet.pin);
        if (!match) {
            return (0, modules_1.handleResponse)(res, 400, false, 'Incorrect pin');
        }
        let prevBalance = Number(wallet.currentBalance);
        console.log('prevBalance', prevBalance, typeof prevBalance, 'amount', amount, typeof amount);
        if (prevBalance < amount) {
            return (0, modules_1.handleResponse)(res, 400, false, 'Insufficient balance');
        }
        let currBalance = prevBalance - amount;
        yield wallet.update({
            currentBalance: currBalance,
            previousBalance: prevBalance
        });
        yield wallet.save();
        const transaction = yield Transaction_1.Transaction.create({
            userId: id,
            jobId: jobId || null,
            amount: amount,
            reference: (0, uuid_1.v4)(),
            status: 'success',
            channel: 'wallet',
            timestamp: Date.now(),
            description: reason || 'Wallet payment',
            type: enum_1.TransactionType.DEBIT,
        });
        return (0, modules_1.successResponse)(res, 'success', transaction);
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, 'error', error.message);
    }
});
exports.debitWallet = debitWallet;
const setPin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, role } = req.user;
    const { pin } = req.body;
    if (!pin || pin.length < 5) {
        return (0, modules_1.handleResponse)(res, 400, false, 'Pin must be at least 5 characters');
    }
    try {
        const wallet = yield Wallet_1.Wallet.findOne({ where: { userId: id } });
        if (!wallet) {
            return (0, modules_1.handleResponse)(res, 404, false, 'Wallet not found');
        }
        // Hash pin
        const hashedPin = yield bcryptjs_1.default.hash(pin, 10);
        yield wallet.update({ pin: hashedPin });
        yield wallet.save();
        return (0, modules_1.successResponse)(res, 'success', 'Pin set successfully');
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, 'error', 'An error occurred');
    }
});
exports.setPin = setPin;
const resetPin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, role } = req.user;
    const { newPin, newPinconfirm } = req.body;
    if (newPin !== newPinconfirm) {
        return (0, modules_1.handleResponse)(res, 400, false, 'New pin and confirm pin do not match');
    }
    try {
        const wallet = yield Wallet_1.Wallet.findOne({ where: { userId: id } });
        if (!wallet) {
            return (0, modules_1.handleResponse)(res, 404, false, 'Wallet not found');
        }
        // Hash pin
        const hashedPin = yield bcryptjs_1.default.hash(newPin, 10);
        wallet.pin = hashedPin;
        yield wallet.save();
        return (0, modules_1.successResponse)(res, 'success', 'Pin reset successfully');
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, 'error', error);
    }
});
exports.resetPin = resetPin;
const creditWallet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.user;
        const { amount, userId } = req.body;
        const wallet = yield Wallet_1.Wallet.findOne({ where: { userId: userId ? userId : id } });
        if (!wallet) {
            return (0, modules_1.handleResponse)(res, 404, false, 'Wallet not found');
        }
        wallet.previousBalance = Number(wallet.currentBalance);
        wallet.currentBalance = Number(wallet.currentBalance) + Number(amount);
        yield wallet.save();
        return (0, modules_1.successResponse)(res, 'success', { balance: wallet.currentBalance });
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, 'error', error);
    }
});
exports.creditWallet = creditWallet;
