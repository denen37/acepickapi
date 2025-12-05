"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.testRedis = exports.testNotification = exports.sendEmailTest = exports.sendSMSTest = void 0;
exports.findPersonsNearby = findPersonsNearby;
const notification_1 = require("../services/notification");
const sms_1 = require("../services/sms");
const modules_1 = require("../utils/modules");
const messages_1 = require("../utils/messages");
const gmail_1 = require("../services/gmail");
const Location_1 = require("../models/Location");
const sequelize_1 = __importStar(require("sequelize"));
const redis_1 = __importDefault(require("../config/redis"));
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
    return (0, modules_1.successResponse)(res, 'OTP sent successfully', { emailSendStatus, messsageId: messageId });
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
function findPersonsNearby(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { lat, lng, radiusInKm } = req.body;
        const distanceQuery = `
    6371 * acos(
      cos(radians(:lat)) * cos(radians("latitude")) *
      cos(radians("longitude") - radians(:lng)) +
      sin(radians(:lat)) * sin(radians("latitude"))
    )
  `;
        const location = yield Location_1.Location.findAll({
            attributes: {
                include: [
                    [sequelize_1.default.literal(distanceQuery), 'distance']
                ]
            },
            where: sequelize_1.default.where(sequelize_1.default.literal(distanceQuery), { [sequelize_1.Op.lte]: radiusInKm }),
            replacements: { lat, lng },
            order: sequelize_1.default.literal('distance ASC'),
        });
        return (0, modules_1.successResponse)(res, 'Persons found nearby', { location });
    });
}
const testRedis = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield redis_1.default.set("testKey", "Redis is working!");
        const value = yield redis_1.default.get("testKey");
        return (0, modules_1.successResponse)(res, 'success', { status: "ok", message: value });
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, 'error', error);
    }
});
exports.testRedis = testRedis;
