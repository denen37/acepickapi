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
exports.reactivateUser = exports.suspendUser = exports.deactivateUser = void 0;
const Models_1 = require("../../models/Models");
const modules_1 = require("../../utils/modules");
const enum_1 = require("../../utils/enum");
const messages_1 = require("../../utils/messages");
const gmail_1 = require("../../services/gmail");
const deactivateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const user = yield Models_1.User.findByPk(userId);
        if (!user) {
            return (0, modules_1.handleResponse)(res, 404, false, 'User not found');
        }
        if (user.status !== enum_1.UserStatus.ACTIVE) {
            return (0, modules_1.handleResponse)(res, 400, false, 'Only active users can be deactivated');
        }
        user.status = enum_1.UserStatus.INACTIVE;
        yield user.save();
        //send email to user notifying them of deactivation
        const emailMsg = (0, messages_1.deactivatedUserEmail)(user);
        const { messageId, success } = yield (0, gmail_1.sendEmail)(user.email, emailMsg.title, emailMsg.body, 'User');
        return (0, modules_1.successResponse)(res, 'success', { response: 'User deactivated successfully', emailSent: success, messageId });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.deactivateUser = deactivateUser;
const suspendUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const user = yield Models_1.User.findByPk(userId);
        if (!user) {
            return (0, modules_1.handleResponse)(res, 404, false, 'User not found');
        }
        if (user.status !== enum_1.UserStatus.ACTIVE) {
            return (0, modules_1.handleResponse)(res, 400, false, 'Only active users can be suspended');
        }
        user.status = enum_1.UserStatus.SUSPENDED;
        yield user.save();
        //send email to user notifying them of suspension
        const emailMsg = (0, messages_1.suspendedUserEmail)(user);
        const { messageId, success } = yield (0, gmail_1.sendEmail)(user.email, emailMsg.title, emailMsg.body, 'User');
        return (0, modules_1.successResponse)(res, 'success', { response: 'User suspended successfully', emailSent: success, messageId });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.suspendUser = suspendUser;
const reactivateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const user = yield Models_1.User.findByPk(userId);
        if (!user) {
            return (0, modules_1.handleResponse)(res, 404, false, 'User not found');
        }
        if (user.status === enum_1.UserStatus.ACTIVE) {
            return (0, modules_1.handleResponse)(res, 400, false, 'User is already active');
        }
        user.status = enum_1.UserStatus.ACTIVE;
        yield user.save();
        //send email to user notifying them of reactivation
        const emailMsg = (0, messages_1.reactivatedUserEmail)(user);
        const { messageId, success } = yield (0, gmail_1.sendEmail)(user.email, emailMsg.title, emailMsg.body, 'User');
        return (0, modules_1.successResponse)(res, 'success', { response: 'User suspended successfully', emailSent: success, messageId });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.reactivateUser = reactivateUser;
