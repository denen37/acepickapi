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
exports.sendExpoNotification = void 0;
const axios = require("axios");
const sendExpoNotification = (token, body) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield axios.post(
    // `https://exp.host/--/api/v2/push/send?useFcmV1=true`,
    `https://api.expo.dev/v2/push/send?useFcmV1=true`, {
        "to": token,
        "sound": "default",
        "body": body,
    }, {
        headers: {
            "accept": "application/json",
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
});
exports.sendExpoNotification = sendExpoNotification;
