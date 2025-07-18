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
exports.verifyTransfer = exports.handlePaystackWebhook = exports.finalizeTransfer = exports.initiateTransfer = exports.verifyPayment = exports.initiatePayment = void 0;
const Models_1 = require("../models/Models");
const modules_1 = require("../utils/modules");
const configSetup_1 = __importDefault(require("../config/configSetup"));
const axios_1 = __importDefault(require("axios"));
const enum_1 = require("../utils/enum");
const notification_1 = require("../services/notification");
const body_1 = require("../validation/body");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const chat_1 = require("../chat");
const events_1 = require("../utils/events");
const messages_1 = require("../utils/messages");
const gmail_1 = require("../services/gmail");
const initiatePayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, email, role } = req.user;
    try {
        const result = body_1.initPaymentSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                status: false,
                message: 'Validation error',
                errors: result.error.flatten().fieldErrors,
            });
        }
        const { amount, description, jobId, productTransactionId } = result.data;
        // Initiate payment with Paystack API
        const paystackResponseInit = yield axios_1.default.post("https://api.paystack.co/transaction/initialize", {
            email: email,
            amount: amount * 100,
        }, {
            headers: {
                Authorization: `Bearer ${configSetup_1.default.PAYSTACK_SECRET_KEY}`,
            },
        });
        const data = paystackResponseInit.data.data;
        const transaction = yield Models_1.Transaction.create({
            userId: id,
            amount: amount,
            reference: data.reference,
            status: enum_1.TransactionStatus.PENDING,
            //channel: data.channel,
            currency: data.currency,
            timestamp: new Date(),
            description: description,
            jobId: description.toString().includes('job') ? jobId : null,
            productTransactionId: description.toString().includes('product') ? productTransactionId : null,
            type: enum_1.TransactionType.CREDIT,
        });
        return (0, modules_1.successResponse)(res, 'success', data);
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
        return (0, modules_1.handleResponse)(res, 200, true, "Payment sucessfully verified", { result: paystackResponse.data });
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, 'error', error);
    }
});
exports.verifyPayment = verifyPayment;
const initiateTransfer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const result = body_1.withdrawSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            status: false,
            message: 'Validation error',
            errors: result.error.flatten().fieldErrors,
        });
    }
    const { amount, recipientCode, pin, reason } = result.data;
    const wallet = yield Models_1.Wallet.findOne({ where: { userId: id } });
    if (!wallet) {
        return (0, modules_1.errorResponse)(res, 'error', 'Wallet not found');
    }
    if (!wallet.pin) {
        return (0, modules_1.handleResponse)(res, 403, false, 'Pin not set. Please set your pin to continue');
    }
    if (!bcryptjs_1.default.compareSync(pin, wallet.pin)) {
        return (0, modules_1.handleResponse)(res, 403, false, 'Invalid PIN');
    }
    if (amount > wallet.currentBalance) {
        return (0, modules_1.handleResponse)(res, 403, false, 'Insufficient balance');
    }
    const reference = (0, modules_1.randomId)(12);
    const transfer = yield Models_1.Transfer.create({
        userId: id,
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
const finalizeTransfer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { transferCode, otp } = req.body;
    const response = yield axios_1.default.post('https://api.paystack.co/transfer/finalize_transfer', {
        transfer_code: transferCode,
        otp: otp
    }, {
        headers: {
            Authorization: `Bearer ${configSetup_1.default.PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json'
        }
    });
    return (0, modules_1.successResponse)(res, 'success', response.data.data);
});
exports.finalizeTransfer = finalizeTransfer;
const handlePaystackWebhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    const payload = req.body;
    console.log("webhook called");
    console.log(payload.event);
    try {
        if (payload.event.includes('transfer')) {
            const transfer = yield Models_1.Transfer.findOne({
                where: { reference: payload.data.reference }
            });
            if (!transfer) {
                return res.status(200).send('Transfer not found');
            }
            const user = yield Models_1.User.findOne({
                where: { id: transfer.userId },
                include: [Models_1.OnlineUser, Models_1.Wallet]
            });
            if (!user) {
                return res.status(200).send('User not found');
            }
            switch (payload.event) {
                case 'transfer.success':
                    transfer.status = enum_1.TransferStatus.SUCCESS;
                    yield transfer.save();
                    user.wallet.previousBalance = user.wallet.currentBalance;
                    user.wallet.currentBalance -= transfer.amount;
                    yield user.wallet.save();
                    (0, notification_1.sendPushNotification)(user.fcmToken, `Transfer Success`, `Your transfer of ${transfer.amount} was successful`, {});
                    break;
                case 'transfer.failed':
                    transfer.status = enum_1.TransferStatus.FAILED;
                    yield transfer.save();
                    (0, notification_1.sendPushNotification)(user.fcmToken, `Transfer Failed`, `Your transfer of ${transfer.amount} failed`, {});
                    break;
                case 'transfer.reversed':
                    (0, notification_1.sendPushNotification)(user.fcmToken, `Transfer Reversed`, `Your transfer of ${transfer.amount} has been reversed`, {});
                    break;
                default:
                    break;
            }
            return (0, modules_1.handleResponse)(res, 200, true, 'Handled');
        }
        else if (payload.event.includes('charge.success')) {
            const { reference, status, channel, paid_at } = payload.data;
            const transaction = yield Models_1.Transaction.findOne({
                where: { reference: reference },
                include: [
                    {
                        model: Models_1.User,
                        as: 'user',
                        include: [Models_1.OnlineUser, Models_1.Wallet]
                    }
                ]
            });
            if (!transaction) {
                return res.status(200).send('Transaction not found');
            }
            if (transaction.status === enum_1.TransactionStatus.SUCCESS) {
                return res.status(200).send('Transaction already processed');
            }
            transaction.status = status;
            transaction.channel = channel;
            transaction.timestamp = new Date(paid_at);
            yield transaction.save();
            if (transaction.jobId && transaction.description.includes('job')) {
                const job = yield Models_1.Job.findByPk(transaction.jobId, {
                    include: [
                        {
                            model: Models_1.User,
                            as: 'professional',
                            include: [Models_1.Profile]
                        },
                        {
                            model: Models_1.User,
                            as: 'client',
                            include: [Models_1.Profile]
                        }
                    ]
                });
                if (job) {
                    job.status = enum_1.JobStatus.ONGOING;
                    job.payStatus = enum_1.PayStatus.PAID;
                    job.paymentRef = reference;
                    yield job.save();
                    (0, notification_1.sendPushNotification)(transaction.user.fcmToken, `Job Payment`, `Job titled: ${job === null || job === void 0 ? void 0 : job.title} has been paid by ${(_b = (_a = job === null || job === void 0 ? void 0 : job.client) === null || _a === void 0 ? void 0 : _a.profile) === null || _b === void 0 ? void 0 : _b.firstName} ${(_d = (_c = job === null || job === void 0 ? void 0 : job.client) === null || _c === void 0 ? void 0 : _c.profile) === null || _d === void 0 ? void 0 : _d.lastName}}`, {});
                    const email = (0, messages_1.jobPaymentEmail)(job === null || job === void 0 ? void 0 : job.toJSON());
                    const msgStat = yield (0, gmail_1.sendEmail)(job.dataValues.professional.email, email.title, email.body, job.dataValues.professional.profile.firstName + ' ' + job.dataValues.professional.profile.lastName);
                }
            }
            else if (transaction.productTransactionId && transaction.description.includes('product')) {
                const productTransaction = yield Models_1.ProductTransaction.findByPk(transaction.productTransactionId, {
                    include: [
                        {
                            model: Models_1.User,
                            as: 'buyer',
                            include: [Models_1.Profile]
                        },
                        {
                            model: Models_1.User,
                            as: 'seller',
                            include: [Models_1.Profile]
                        },
                        {
                            model: Models_1.Product
                        }
                    ]
                });
                if (productTransaction) {
                    productTransaction.status = enum_1.ProductTransactionStatus.ORDERED;
                    yield productTransaction.save();
                    productTransaction.product.quantity -= productTransaction.quantity;
                    yield productTransaction.product.save();
                    //send notification to buyer
                    (0, notification_1.sendPushNotification)(transaction.user.fcmToken, `Product Payment`, `${productTransaction === null || productTransaction === void 0 ? void 0 : productTransaction.quantity} of your product: ${productTransaction === null || productTransaction === void 0 ? void 0 : productTransaction.product.name} has been paid by ${productTransaction === null || productTransaction === void 0 ? void 0 : productTransaction.buyer.profile.firstName} ${productTransaction === null || productTransaction === void 0 ? void 0 : productTransaction.buyer.profile.lastName}`, {});
                    //send email to buyer
                    const email = (0, messages_1.productPaymentEmail)(productTransaction);
                    const msgStat = yield (0, gmail_1.sendEmail)(productTransaction.seller.email, email.title, email.body, productTransaction.seller.profile.firstName + ' ' + productTransaction.seller.profile.lastName);
                }
            }
            else {
                if (transaction.user.wallet) {
                    let prevAmount = Number(transaction.user.wallet.currentBalance);
                    let newAmount = Number(transaction.amount);
                    transaction.user.wallet.previousBalance = prevAmount;
                    transaction.user.wallet.currentBalance = prevAmount + newAmount;
                    yield transaction.user.wallet.save();
                }
            }
            (0, notification_1.sendPushNotification)(transaction.user.fcmToken, `Payment Success`, `Your Payment of ${transaction.amount} was successful`, {});
            const io = (0, chat_1.getIO)();
            if ((_e = transaction.user.onlineUser) === null || _e === void 0 ? void 0 : _e.isOnline) {
                io.to((_f = transaction.user.onlineUser) === null || _f === void 0 ? void 0 : _f.socketId).emit(events_1.Emit.PAYMENT_SUCCESS, {
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
            return (0, modules_1.handleResponse)(res, 200, true, 'Handled');
        }
        else {
            return (0, modules_1.handleResponse)(res, 400, false, 'Invalid event type');
        }
    }
    catch (error) {
        console.error('Webhook error:', error);
        return res.status(500).send('Internal server error');
    }
});
exports.handlePaystackWebhook = handlePaystackWebhook;
const verifyTransfer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { ref } = req.params;
    try {
        const response = yield axios_1.default.get(`https://api.paystack.co/transfer/verify/${ref}`, {
            headers: {
                'Authorization': `Bearer ${configSetup_1.default.PAYSTACK_SECRET_KEY}`
            }
        });
        return (0, modules_1.successResponse)(res, 'success', response.data.data);
    }
    catch (error) {
        console.log(error);
        return (0, modules_1.errorResponse)(res, 'error', error.response.data.message);
    }
});
exports.verifyTransfer = verifyTransfer;
