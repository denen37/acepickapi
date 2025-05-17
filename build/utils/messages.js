"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgotPasswordEmail = exports.sendOTPEmail = exports.sendOTPPhone = exports.registerEmail = void 0;
const registerEmail = (user) => {
    var _a, _b;
    return {
        title: "Welcome to Acepick",
        body: `Welcome on board ${(_a = user.profile) === null || _a === void 0 ? void 0 : _a.firstName} ${(_b = user.profile) === null || _b === void 0 ? void 0 : _b.lastName},
        <br><br> 
        we are pleased to have you on Acepick, 
        please validate your account by providing your BVN 
        to get accessible to all features on Acepick.<br><br> Thanks.`
    };
};
exports.registerEmail = registerEmail;
const sendOTPPhone = (code) => {
    return {
        title: "Acepick OTP",
        body: `Your OTP code is ${code}.`
    };
};
exports.sendOTPPhone = sendOTPPhone;
const sendOTPEmail = (code) => {
    return {
        title: "Email Verification",
        body: `Dear User,<br><br>
          
            Thank you for choosing our service. To complete your registration
             and ensure the security of your account,
              please use the verification code below
              <br><br>
            
             Verification Code: ${code}
            <br><br>
            
            Please enter this code on our website/app to
             proceed with your registration process. 
             If you did not initiate this action, 
             please ignore this email.<br><br>`
    };
};
exports.sendOTPEmail = sendOTPEmail;
const forgotPasswordEmail = (code) => {
    return {
        title: "Reset Password",
        body: `Dear User,<br><br>

            We have received a request to reset your password. 
            If you did not make this request, please ignore this email.
             Otherwise, please use the verification code below to reset your password.
             <br><br>

             Verification Code: ${code}
            <br><br>

            Please enter this code on our website/app to
             proceed with the password reset process. 
             If you did not initiate this action, 
             please ignore this email.<br><br>`
    };
};
exports.forgotPasswordEmail = forgotPasswordEmail;
