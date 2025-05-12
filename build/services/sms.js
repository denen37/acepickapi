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
exports.sendEmailResend = exports.sendSMS = void 0;
const axios = require("axios");
const template_1 = require("../config/template");
const gmail_1 = require("./gmail");
// export const sendSMS = async (phone: number, code: string) => {
//     const response = await axios.post(
//         `https://www.bulksmsnigeria.com/api/v2/sms`,
//         {
//             to: `${phone}`,
//             from: config.SMS_SENDER_ID,
//             body: `${code} is your Ace-Pick access code. Do not share this with anyone.`,
//             api_token: config.SMS_API_KEY,
//         },
//         {
//             headers: {
//                 'Content-Type': 'application/json',
//                 "Accept": "application/json",
//             }
//         }
//     );
//     if (response.status <= 300) {
//         return {
//             status: true,
//             message: response.data,
//         }
//     } else {
//         return {
//             status: false,
//             message: response.data,
//         };
//     }
// }
const sendSMS = (phone, code) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield axios.post(`https://v3.api.termii.com/api/sms/send`, {
        to: `${phone}`,
        from: "Acepick net",
        sms: `${code} is your Ace-Pick access code. Do not share this with anyone.`,
        type: 'plain',
        api_key: "TLzqURHkmkKBqbeuZwMJeKsCCqcHrhcLaOXUrLBBxmzBtJturGSHEyJOYIzxuK",
        channel: 'dnd'
    }, {
        headers: {
            'Content-Type': 'application/json',
            "Accept": "application/json",
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
exports.sendSMS = sendSMS;
// export const sendEmail = async (email: string, code: string) => {
//   const response = await axios.post(
//     // `https://account.kudisms.net/api/?username=anthony@martlines.ng&password=sirador@101&message=${code} is your Martline access. Do not share this with anyone.&sender=Martline&mobiles=${req.params.phone}`,
//     `https://api.ng.termii.com/api/email/otp/send`,
//     {
//       "email_address": `${email}`,
//       "code": `${code}`,
//       "email_configuration_id": "8c7bdde9-b886-4024-9a63-1218350d9bae",
//       "api_key": "TL2ofq7ayT0gl1h8r1xEXXCGW6C9VYORpdJjRuJ2xBsFxTGO1mEM6qP8FORHPO",
//     },
//     {
//       headers: {
//         'Content-Type': ['application/json', 'application/json']
//       }
//     }
//   );
//   if (response.status <= 300) {
//     return {
//       status: true,
//       message: response.data,
//     }
//   } else {
//     return {
//       status: false,
//       message: response.data,
//     };
//   }
// }
// export const sendEmailResend = async (email: String, subject: String, template: string, username?: string) => {
//   try {
//     const response = await axios.post(
//       `https://api.brevo.com/v3/smtp/email`,
//       {
//         "sender": {
//           "name": "Acepick",
//           "email": "admin@theacepick.com"
//         },
//         "to": [
//           {
//             "email": email,
//             "name": "User"
//           }
//         ],
//         subject: `${subject}`,
//         "htmlContent": templateData(template, username)
//       },
//       {
//         headers: {
//           "api-key": config.RESEND,
//           "accept": "application/json",
//           'Content-Type': ['application/json', 'application/json']
//         }
//       }
//     );
//     return {
//       status: response.status <= 300,
//       message: response.data,
//     }
//   } catch (error) {
//     console.log(error);
//   }
const sendEmailResend = (email, subject, template, username) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield (0, gmail_1.sendEmail)(email, subject, null, (0, template_1.templateData)(template, username));
        if (response.messageId)
            return {
                status: response.success,
                message: response.message,
            };
        return {
            status: response.success,
            message: response.message
        };
    }
    catch (error) {
        console.log(error);
        return {
            error: "Failed to send email"
        };
    }
});
exports.sendEmailResend = sendEmailResend;
