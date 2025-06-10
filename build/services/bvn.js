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
exports.verifyTransaction = exports.verifyBvn = void 0;
const axios = require("axios");
const configSetup_1 = __importDefault(require("../config/configSetup"));
const verifyBvn = (bvn) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios.post(`https://api.verified.africa/sfx-verify/v3/id-service`, {
            "searchParameter": `${bvn}`,
            "verificationType": `BVN-FULL-DETAILS`
        }, {
            headers: {
                // 'Content-Type': ['application/json', 'application/json'],
                "userId": "1697240975456",
                "apiKey": "5yWB46Erlhdvb8vPGaPr",
            }
        });
        if (response.status <= 300) {
            return {
                status: true,
                message: response.data,
            };
        }
        else {
            return {
                status: false,
                message: response.data,
            };
        }
    }
    catch (e) {
        return {
            status: false,
            message: { verificationStatus: "NOT VERIFIED", description: "Error processing bvn" },
        };
    }
});
exports.verifyBvn = verifyBvn;
const verifyTransaction = (reference) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
            "Authorization": `Bearer ${configSetup_1.default.PAYSTACK_SECRET_KEY},`
            // "accept": "application/json",
            // 'Content-Type': ['application/json', 'application/json']
        }
    });
    if (response.status <= 300) {
        return {
            status: true,
            message: response.data,
        };
    }
    else {
        return {
            status: false,
            message: response.data,
        };
    }
});
exports.verifyTransaction = verifyTransaction;
