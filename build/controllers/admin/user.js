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
exports.emailUser = exports.toggleSuspension = exports.getAllUsers = void 0;
const User_1 = require("../../models/User");
const enum_1 = require("../../utils/enum");
const Profile_1 = require("../../models/Profile");
const modules_1 = require("../../utils/modules");
const messages_1 = require("../../utils/messages");
const gmail_1 = require("../../services/gmail");
const zod_1 = require("zod");
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const { role } = req.params;
    const result = zod_1.z.object({
        role: zod_1.z.nativeEnum(enum_1.UserRole),
    }).safeParse(req.params);
    if (!result.success) {
        return res.status(400).json({
            error: "Invalid role",
            details: result.error.flatten().fieldErrors,
        });
    }
    // const modifiedRole = role.slice(0, -1);
    try {
        const clients = yield User_1.User.findAll({
            where: {
                role: role,
            },
            attributes: { exclude: ['password'] },
            include: [
                {
                    model: Profile_1.Profile,
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        return (0, modules_1.successResponse)(res, 'success', clients);
    }
    catch (error) {
        console.log(error);
        return (0, modules_1.errorResponse)(res, 'error', 'Internal server error');
    }
});
exports.getAllUsers = getAllUsers;
const toggleSuspension = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const { userId } = req.params;
    try {
        const user = yield User_1.User.findByPk(userId, { include: [Profile_1.Profile] });
        if (!user) {
            return (0, modules_1.handleResponse)(res, 404, false, 'User not found');
        }
        if (user.status === enum_1.UserStatus.ACTIVE) {
            user.status = enum_1.UserStatus.SUSPENDED;
            yield user.save();
            //send email to user
            const email = (0, messages_1.suspendUserEmail)(user);
            const response = yield (0, gmail_1.sendEmail)(user.email, email.title, email.body, user.profile.firstName);
            return (0, modules_1.successResponse)(res, 'success', 'User suspended successfully');
        }
        else {
            user.status = enum_1.UserStatus.ACTIVE;
            yield user.save();
            const email = (0, messages_1.reactivateUserEmail)(user);
            const response = yield (0, gmail_1.sendEmail)(user.email, email.title, email.body, user.profile.firstName);
            return (0, modules_1.successResponse)(res, 'success', 'User reactivated successfully');
        }
    }
    catch (error) {
        console.log(error);
        return (0, modules_1.errorResponse)(res, 'error', 'Internal server error');
    }
});
exports.toggleSuspension = toggleSuspension;
const emailUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, title, body } = req.body;
    try {
        const user = yield User_1.User.findByPk(userId, { include: [Profile_1.Profile] });
        if (!user) {
            return (0, modules_1.handleResponse)(res, 404, false, 'User not found');
        }
        const { success, error } = yield (0, gmail_1.sendEmail)(user.email, title, body, user.profile.firstName);
        if (success) {
            return (0, modules_1.handleResponse)(res, 200, true, 'Email sent successfully');
        }
        throw error;
    }
    catch (error) {
        console.log(error);
        return (0, modules_1.errorResponse)(res, 'error', 'An error ocurred');
    }
});
exports.emailUser = emailUser;
