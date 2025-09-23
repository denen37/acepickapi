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
exports.creditWallet = exports.forgotPin = exports.resetPin = exports.setPin = exports.debitWalletForProductOrder = exports.debitWallet = exports.viewWallet = exports.createWallet = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const modules_1 = require("../utils/modules");
const enum_1 = require("../utils/enum");
const body_1 = require("../validation/body");
const Models_1 = require("../models/Models");
const messages_1 = require("../utils/messages");
const gmail_1 = require("../services/gmail");
const notification_1 = require("../services/notification");
const zod_1 = __importDefault(require("zod"));
const createWallet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const { currency = 'NGN' } = req.body;
    try {
        const wallet = yield Models_1.Wallet.create({
            userId: id,
            currency: currency,
            currentBalance: 0,
            previousBalance: 0
        });
        wallet.setDataValue('isActive', wallet.pin !== null);
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
        const wallet = yield Models_1.Wallet.findOne({
            where: { userId: id },
            attributes: {
                exclude: ['pin']
            },
        });
        if (!wallet) {
            return (0, modules_1.handleResponse)(res, 404, false, "Wallet not found");
        }
        wallet.setDataValue('isActive', wallet.pin !== null);
        return (0, modules_1.successResponse)(res, "success", wallet);
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, "An error occurred", error);
    }
});
exports.viewWallet = viewWallet;
const debitWallet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, role } = req.user;
    // Usage example
    const result = body_1.paymentSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ errors: result.error.format() });
    }
    const { amount, pin, reason, jobId } = result.data;
    const job = yield Models_1.Job.findByPk(jobId, {
        include: [
            {
                model: Models_1.User,
                as: 'client',
                include: [Models_1.Profile]
            },
            {
                model: Models_1.User,
                as: 'professional',
                include: [Models_1.Profile]
            }
        ]
    });
    if (!job) {
        return (0, modules_1.handleResponse)(res, 404, false, 'Job not found');
    }
    if (job.payStatus === enum_1.PayStatus.PAID) {
        return (0, modules_1.handleResponse)(res, 400, false, 'Job has already been paid for');
    }
    try {
        const wallet = yield Models_1.Wallet.findOne({ where: { userId: id } });
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
        //console.log('prevBalance', prevBalance, typeof prevBalance, 'amount', amount, typeof amount);
        if (prevBalance < amount) {
            return (0, modules_1.handleResponse)(res, 400, false, 'Insufficient balance');
        }
        let currBalance = prevBalance - amount;
        yield wallet.update({
            currentBalance: currBalance,
            previousBalance: prevBalance
        });
        yield wallet.save();
        job.payStatus = enum_1.PayStatus.PAID;
        job.paymentRef = (0, modules_1.randomId)(12);
        job.status = enum_1.JobStatus.ONGOING;
        yield job.save();
        job.client.profile.totalJobsOngoing = Number(job.client.profile.totalJobsOngoing || 0) + 1;
        job.professional.profile.totalJobsOngoing = Number(job.professional.profile.totalJobsOngoing || 0) + 1;
        yield job.client.profile.save();
        yield job.professional.profile.save();
        const transaction = yield Models_1.Transaction.create({
            userId: id,
            jobId: jobId || null,
            amount: amount,
            reference: job.paymentRef,
            status: 'success',
            channel: 'wallet',
            timestamp: Date.now(),
            description: reason || 'Wallet payment',
            type: enum_1.TransactionType.DEBIT,
        });
        const emailTosend = (0, messages_1.jobPaymentEmail)(job);
        const msgStat = yield (0, gmail_1.sendEmail)(job.dataValues.professional.email, emailTosend.title, emailTosend.body, job.dataValues.professional.profile.firstName + ' ' + job.dataValues.professional.profile.lastName
        //'User'
        );
        //Send notification to the client
        if (job.dataValues.professional.fcmToken) {
            yield (0, notification_1.sendPushNotification)(job.dataValues.professional.fcmToken, 'Job Payment', `Your Job: ${job.dataValues.title} has been paid}`, {});
        }
        return (0, modules_1.successResponse)(res, 'success', transaction);
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, 'error', error.message);
    }
});
exports.debitWallet = debitWallet;
const debitWalletForProductOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, role } = req.user;
    // Usage example
    const result = body_1.productPaymentSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ errors: result.error.format() });
    }
    const { amount, pin, reason, productTransactionId } = result.data;
    const productTransaction = yield Models_1.ProductTransaction.findByPk(productTransactionId, {
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
            },
            {
                model: Models_1.Order,
            }
        ]
    });
    if (!productTransaction) {
        return (0, modules_1.handleResponse)(res, 404, false, 'Product transaction not found');
    }
    try {
        const wallet = yield Models_1.Wallet.findOne({ where: { userId: id } });
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
        //console.log('prevBalance', prevBalance, typeof prevBalance, 'amount', amount, typeof amount);
        if (prevBalance < amount) {
            return (0, modules_1.handleResponse)(res, 400, false, 'Insufficient balance');
        }
        let desc;
        let isProductOrder = false;
        if (productTransaction.order && productTransaction.orderMethod !== enum_1.OrderMethod.SELF_PICKUP) {
            const productAndOrderCost = Number(productTransaction.order.cost) + Number(productTransaction.price);
            if (amount < productAndOrderCost) {
                return (0, modules_1.handleResponse)(res, 404, false, 'Insufficient amount for order and product');
            }
            desc = 'product_order wallet payment';
            isProductOrder = true;
        }
        else {
            if (amount < productTransaction.price) {
                return (0, modules_1.handleResponse)(res, 404, false, 'Insufficient amount for product');
            }
            desc = 'product wallet payment';
        }
        let currBalance = prevBalance - amount;
        yield wallet.update({
            currentBalance: currBalance,
            previousBalance: prevBalance
        });
        yield wallet.save();
        if (isProductOrder) {
            productTransaction.status = enum_1.ProductTransactionStatus.ORDERED;
            productTransaction.order.status = enum_1.OrderStatus.PAID;
            yield productTransaction.save();
            yield productTransaction.order.save();
        }
        else {
            productTransaction.status = enum_1.ProductTransactionStatus.ORDERED;
            yield productTransaction.save();
        }
        const transaction = yield Models_1.Transaction.create({
            userId: id,
            jobId: null,
            amount: amount,
            reference: (0, modules_1.randomId)(12),
            status: 'success',
            channel: 'wallet',
            timestamp: Date.now(),
            productTransactionId,
            description: desc,
            type: enum_1.TransactionType.DEBIT,
        });
        const email = (0, messages_1.productPaymentEmail)(productTransaction);
        const msgStat = yield (0, gmail_1.sendEmail)(productTransaction.seller.email, email.title, email.body, productTransaction.seller.profile.firstName + ' ' + productTransaction.seller.profile.lastName);
        //Send notification to the client
        (0, notification_1.sendPushNotification)(productTransaction.seller.fcmToken, `Product Payment`, `${productTransaction === null || productTransaction === void 0 ? void 0 : productTransaction.quantity} of your product: ${productTransaction === null || productTransaction === void 0 ? void 0 : productTransaction.product.name} has been paid by ${productTransaction === null || productTransaction === void 0 ? void 0 : productTransaction.buyer.profile.firstName} ${productTransaction === null || productTransaction === void 0 ? void 0 : productTransaction.buyer.profile.lastName}`, {});
        return (0, modules_1.successResponse)(res, 'success', transaction);
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, 'error', error.message);
    }
});
exports.debitWalletForProductOrder = debitWalletForProductOrder;
// export const debitWalletForProductOrder = async (req: Request, res: Response) => {
//     const { id, role } = req.user;
//     // Usage example
//     const result = productPaymentSchema.safeParse(req.body);
//     if (!result.success) {
//         return res.status(400).json({ errors: result.error.format() });
//     }
//     const { amount, pin, reason, productTransactionId } = result.data;
//     const productTransaction = await ProductTransaction.findByPk(productTransactionId, {
//         include: [
//             {
//                 model: User,
//                 as: 'buyer',
//                 include: [Profile]
//             },
//             {
//                 model: User,
//                 as: 'seller',
//                 include: [Profile]
//             },
//             {
//                 model: Product
//             }
//         ]
//     });
//     if (!productTransaction) {
//         return handleResponse(res, 404, false, 'Product transaction not found');
//     }
//     try {
//         const wallet = await Wallet.findOne({ where: { userId: id } });
//         if (!wallet) {
//             return handleResponse(res, 404, false, 'Wallet not found')
//         }
//         if (!wallet.pin) {
//             return handleResponse(res, 400, false, 'Pin not set')
//         }
//         const match = await bcrypt.compare(pin, wallet.pin);
//         if (!match) {
//             return handleResponse(res, 400, false, 'Incorrect pin')
//         }
//         let prevBalance = Number(wallet.currentBalance);
//         //console.log('prevBalance', prevBalance, typeof prevBalance, 'amount', amount, typeof amount);
//         if (prevBalance < amount) {
//             return handleResponse(res, 400, false, 'Insufficient balance')
//         }
//         let currBalance = prevBalance - amount;
//         await wallet.update({
//             currentBalance: currBalance,
//             previousBalance: prevBalance
//         });
//         await wallet.save();
//         const transaction = await Transaction.create({
//             userId: id,
//             jobId: null,
//             amount: amount,
//             reference: randomId(12),
//             status: 'success',
//             channel: 'wallet',
//             timestamp: Date.now(),
//             productTransactionId,
//             description: reason || 'Wallet payment',
//             type: TransactionType.DEBIT,
//         })
//         const email = productPaymentEmail(productTransaction);
//         const msgStat = await sendEmail(
//             productTransaction.seller.email,
//             email.title,
//             email.body,
//             productTransaction.seller.profile.firstName + ' ' + productTransaction.seller.profile.lastName,
//         )
//         //Send notification to the client
//         sendPushNotification(
//             productTransaction.seller.fcmToken,
//             `Product Payment`,
//             `${productTransaction?.quantity} of your product: ${productTransaction?.product.name} has been paid by ${productTransaction?.buyer.profile.firstName} ${productTransaction?.buyer.profile.lastName}`,
//             {}
//         );
//         return successResponse(res, 'success', transaction)
//     } catch (error: any) {
//         return errorResponse(res, 'error', error.message)
//     }
// }
const setPin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, role } = req.user;
    const pinSchema = zod_1.default.object({
        pin: zod_1.default.string().regex(/^\d{4}$/, 'PIN must be exactly 4 digits'),
    });
    const result = pinSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ errors: result.error.format() });
    }
    const { pin } = result.data;
    try {
        const wallet = yield Models_1.Wallet.findOne({ where: { userId: id } });
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
    // Usage example
    const result = body_1.pinResetSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ errors: result.error.format() });
    }
    const { newPin, oldPin } = result.data;
    try {
        const wallet = yield Models_1.Wallet.findOne({ where: { userId: id } });
        if (!wallet) {
            return (0, modules_1.handleResponse)(res, 404, false, 'Wallet not found');
        }
        // Check if old pin matches
        if (!wallet.pin) {
            return (0, modules_1.handleResponse)(res, 400, false, 'Pin not set');
        }
        const isMatch = yield bcryptjs_1.default.compare(oldPin, wallet.pin);
        if (!isMatch) {
            return (0, modules_1.handleResponse)(res, 400, false, 'Old pin does not match');
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
const forgotPin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, role } = req.user;
    try {
        const result = body_1.pinForgotSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ errors: result.error.format() });
        }
        const { newPin, newPinConfirm } = result.data;
        const wallet = yield Models_1.Wallet.findOne({ where: { userId: id } });
        if (!wallet) {
            return (0, modules_1.handleResponse)(res, 404, false, 'Wallet not found');
        }
        // Check if old pin matches
        if (!wallet.pin) {
            return (0, modules_1.handleResponse)(res, 400, false, 'Pin not set');
        }
        const hashedPin = yield bcryptjs_1.default.hash(newPin, 10);
        wallet.pin = hashedPin;
        yield wallet.save();
        return (0, modules_1.successResponse)(res, 'success', 'Pin reset successfully');
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, 'error', error);
    }
});
exports.forgotPin = forgotPin;
const creditWallet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.user;
        const { amount, userId } = req.body;
        const wallet = yield Models_1.Wallet.findOne({ where: { userId: userId ? userId : id } });
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
