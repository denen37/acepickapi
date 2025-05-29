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
exports.testNotification = exports.sendEmailTest = exports.sendSMSTest = void 0;
const notification_1 = require("../services/notification");
const sms_1 = require("../services/sms");
const modules_1 = require("../utils/modules");
const messages_1 = require("../utils/messages");
const gmail_1 = require("../services/gmail");
const sendSMSTest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { phone } = req.body;
    // try {
    const status = yield (0, sms_1.sendSMS)(phone, '123456');
    return (0, modules_1.successResponse)(res, 'OTP sent successfully', { smsSendStatus: status });
    // } catch (error) {
    //     return errorResponse(res, 'error', error);
    // }
});
exports.sendSMSTest = sendSMSTest;
const sendEmailTest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    // try {
    const verifyEmailMsg = (0, messages_1.sendOTPEmail)('123456');
    const messageId = yield (0, gmail_1.sendEmail)(email, verifyEmailMsg.title, verifyEmailMsg.body, 'User');
    let emailSendStatus = Boolean(messageId);
    return (0, modules_1.successResponse)(res, 'OTP sent successfully', { emailSendStatus });
    // } catch (error) {
    //     return errorResponse(res, 'error', error);
});
exports.sendEmailTest = sendEmailTest;
const testNotification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token, title, message, data } = req.body;
        if (!title || !message || !token) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }
        const response = yield (0, notification_1.sendPushNotification)(token, title, message, data);
        return (0, modules_1.successResponse)(res, 'Notification sent successfully', { response });
    }
    catch (error) {
        console.log(error);
        return (0, modules_1.errorResponse)(res, 'Error sending notification', error);
    }
});
exports.testNotification = testNotification;
