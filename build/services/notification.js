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
exports.sendPushNotification = sendPushNotification;
const axios_1 = __importDefault(require("axios"));
function sendPushNotification(expoPushToken, title, message, data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.post('https://exp.host/--/api/v2/push/send', {
                to: expoPushToken,
                sound: 'default',
                title: title,
                body: message,
                data: data,
            }, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            });
            if (response.status <= 300) {
                console.log(response.data);
                return {
                    status: true,
                    message: response.data,
                };
            }
            else {
                console.log(response.data);
                return {
                    status: false,
                    message: response.data,
                };
            }
        }
        catch (error) {
            console.error('Error sending notification:', error.response ? error.response.data : error.message);
        }
    });
}
