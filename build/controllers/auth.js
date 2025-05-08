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
exports.verifyMyBvn = exports.postlocationData = exports.changePassword = exports.updateFcmToken = exports.swithAccount = exports.corperateReg = exports.registerStepThree = exports.registerStepTwo = exports.upload_avatar = exports.deleteUsers = exports.login = exports.passwordChange = exports.register = exports.verifyOtp = exports.sendOtp = exports.updateProfile = exports.authorize = void 0;
const modules_1 = require("../utils/modules");
const configSetup_1 = __importDefault(require("../config/configSetup"));
const Verify_1 = require("../models/Verify");
const sms_1 = require("../services/sms");
const User_1 = require("../models/User");
const bcryptjs_1 = require("bcryptjs");
const jsonwebtoken_1 = require("jsonwebtoken");
const Profile_1 = require("../models/Profile");
// import { Professional } from "../models/Professional";
const LanLog_1 = require("../models/LanLog");
// import { Sector } from "../models/Sector";
// import { Profession } from "../models/Profession";
const Cooperation_1 = require("../models/Cooperation");
// import { Review } from "../models/Review";
const bvn_1 = require("../services/bvn");
// yarn add stream-chat
const stream_chat_1 = require("stream-chat");
// import { Portfolio } from "../models/Portfolio";
const Wallet_1 = require("../models/Wallet");
const Professional_1 = require("../models/Professional");
const axios_1 = __importDefault(require("axios"));
const jsonwebtoken_2 = require("jsonwebtoken");
const upload_1 = require("../services/upload");
// instantiate your stream client using the API key and secret
// the secret is only used server side and gives you full access to the API
const serverClient = stream_chat_1.StreamChat.getInstance('zzfb7h72xhc5', '5pfxakc5zasma3hw9awd2qsqgk2fxyr4a5qb3au4kkdt27d7ttnca7vnusfuztud');
// you can still use new StreamChat('api_key', 'api_secret');
// generate a token for the user with id 'john'
const authorize = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { token } = req.body;
    if (!token)
        return (0, modules_1.handleResponse)(res, 401, false, `Access Denied / Unauthorized request`);
    if (token.includes('Bearer'))
        token = token.split(' ')[1];
    if (token === 'null' || !token)
        return (0, modules_1.handleResponse)(res, 401, false, `Unauthorized request`);
    let verified = (0, jsonwebtoken_2.verify)(token, configSetup_1.default.TOKEN_SECRET);
    if (!verified)
        return (0, modules_1.handleResponse)(res, 401, false, `Unauthorized request`);
    return (0, modules_1.handleResponse)(res, 200, true, `Authorized`, verified);
});
exports.authorize = authorize;
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { postalCode, lga, state, address, avatar } = req.body;
    let { id } = req.user;
    const profile = yield Profile_1.Profile.findOne({ where: { id } });
    if (!(profile === null || profile === void 0 ? void 0 : profile.verified))
        return (0, modules_1.errorResponse)(res, "Verify your bvn");
    yield (profile === null || profile === void 0 ? void 0 : profile.update({
        lga: lga !== null && lga !== void 0 ? lga : profile.lga,
        avatar: avatar !== null && avatar !== void 0 ? avatar : profile.avatar,
        state: state !== null && state !== void 0 ? state : profile.state,
        address: address !== null && address !== void 0 ? address : profile.address,
    }));
    const updated = yield Profile_1.Profile.findOne({ where: { id } });
    return (0, modules_1.successResponse)(res, "Updated Successfully", updated);
});
exports.updateProfile = updateProfile;
// export const updateProfessional = async (req: Request, res: Response) => {
//     let { intro, language } = req.body;
//     let { id } = req.user;
//     const professional = await Professional.findOne({ where: { userId: id } })
//     await professional?.update({
//         intro: intro ?? professional.intro,
//         language: language ?? professional.language
//     })
//     const updated = await Professional.findOne({ where: { userId: id } })
//     return successResponse(res, "Updated Successfully", updated)
// }
const sendOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, phone, type } = req.body;
    const serviceId = (0, modules_1.randomId)(12);
    const codeEmail = String(Math.floor(1000 + Math.random() * 9000));
    const codeSms = String(Math.floor(1000 + Math.random() * 9000));
    if (type == Verify_1.VerificationType.BOTH) {
        yield Verify_1.Verify.create({
            serviceId,
            code: codeSms,
            client: phone
        });
        yield Verify_1.Verify.create({
            serviceId,
            code: codeEmail,
            client: email
        });
        const smsResult = yield (0, sms_1.sendSMS)(phone, codeSms.toString());
        const emailResult = yield (0, sms_1.sendEmailResend)(email, "Email Verification", `Dear User,<br><br>
  
    Thank you for choosing our service. To complete your registration and ensure the security of your account, please use the verification code below<br><br>
    
    Verification Code: ${codeEmail}<br><br>
    
    Please enter this code on our website/app to proceed with your registration process. If you did not initiate this action, please ignore this email.<br><br>`);
        if (smsResult.status && (emailResult === null || emailResult === void 0 ? void 0 : emailResult.status))
            return (0, modules_1.successResponse)(res, "Successful", Object.assign(Object.assign({}, smsResult), { serviceId }));
        return (0, modules_1.errorResponse)(res, "Failed", emailResult);
    }
    else if (type == Verify_1.VerificationType.SMS) {
        yield Verify_1.Verify.create({
            serviceId,
            code: codeSms,
            client: phone
        });
        const smsResult = yield (0, sms_1.sendSMS)(phone, codeSms.toString());
        if (smsResult.status)
            return (0, modules_1.successResponse)(res, "Successful", Object.assign(Object.assign({}, smsResult), { serviceId }));
        return (0, modules_1.errorResponse)(res, "Failed", smsResult);
    }
    else if (type == Verify_1.VerificationType.EMAIL) {
        yield Verify_1.Verify.create({
            serviceId,
            code: codeEmail,
            client: email
        });
        const emailResult = yield (0, sms_1.sendEmailResend)(email, "Email Verification", `Dear User,<br><br>
  
    Thank you for choosing our service. To complete your registration and ensure the security of your account, please use the verification code below<br><br>
    
    Verification Code: ${codeEmail}<br><br>
    
    Please enter this code on our website/app to proceed with your registration process. If you did not initiate this action, please ignore this email.<br><br>
    
`);
        if (emailResult === null || emailResult === void 0 ? void 0 : emailResult.status)
            return (0, modules_1.successResponse)(res, "Successful", Object.assign(Object.assign({}, emailResult), { serviceId }));
        return (0, modules_1.errorResponse)(res, "Failed", emailResult);
    }
    else {
        // const secret_key = createRandomRef(12, "ace_pick")
        yield Verify_1.Verify.create({
            serviceId,
            code: codeEmail,
            client: email
        });
        const emailResult = yield (0, sms_1.sendEmailResend)(email, "Email Verification", `Dear User,<br><br>
  
    Thank you for choosing our service. To complete your registration and ensure the security of your account, please use the verification code below<br><br>
    
    Verification Code: ${codeEmail}<br><br>
    
    Please enter this code on our website/app to proceed with your registration process. If you did not initiate this action, please ignore this email.<br><br>
    
 `);
        if (emailResult === null || emailResult === void 0 ? void 0 : emailResult.status)
            return (0, modules_1.successResponse)(res, "Successful", Object.assign(Object.assign({}, emailResult), { emailServiceId: serviceId }));
        return (0, modules_1.errorResponse)(res, "Failed", emailResult);
    }
});
exports.sendOtp = sendOtp;
const verifyOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { emailServiceId, smsServiceId, smsCode, emailCode, type } = req.body;
    if (type === Verify_1.VerificationType.EMAIL) {
        const verifyEmail = yield Verify_1.Verify.findOne({
            where: {
                serviceId: emailServiceId
            }
        });
        if (verifyEmail) {
            if (verifyEmail.code === emailCode) {
                const verifyEmailResult = yield Verify_1.Verify.findOne({ where: { id: verifyEmail.id } });
                yield (verifyEmailResult === null || verifyEmailResult === void 0 ? void 0 : verifyEmailResult.destroy());
                return (0, modules_1.successResponse)(res, "Successful", {
                    message: "successful",
                    status: true
                });
            }
            else {
                (0, modules_1.errorResponse)(res, "Failed", {
                    message: "Invalid Email Code",
                    status: false
                });
            }
        }
        else {
            (0, modules_1.errorResponse)(res, "Failed", {
                message: `Email Code Already Used`,
                status: false
            });
        }
    }
    else if (type === Verify_1.VerificationType.SMS) {
        const verifySms = yield Verify_1.Verify.findOne({
            where: {
                serviceId: smsServiceId
            }
        });
        //smsCode
        if (verifySms) {
            if (verifySms.code === smsCode) {
                const verifySmsResult = yield Verify_1.Verify.findOne({ where: { id: verifySms.id } });
                yield (verifySmsResult === null || verifySmsResult === void 0 ? void 0 : verifySmsResult.destroy());
                return (0, modules_1.successResponse)(res, "Successful", {
                    message: "successful",
                    status: true
                });
            }
            else {
                (0, modules_1.errorResponse)(res, "Failed", {
                    message: `Invalid SMS Code`,
                    status: false
                });
            }
        }
        else {
            (0, modules_1.errorResponse)(res, "Failed", {
                message: `SMS Code Already Used`,
                status: false
            });
        }
    }
    else {
        const verifySms = yield Verify_1.Verify.findOne({
            where: {
                serviceId: smsServiceId
            }
        });
        const verifyEmail = yield Verify_1.Verify.findOne({
            where: {
                serviceId: emailServiceId
            }
        });
        if (verifySms && verifyEmail) {
            if (verifySms.code === smsCode && verifyEmail.code === emailCode) {
                const verifySmsResult = yield Verify_1.Verify.findOne({ where: { id: verifySms.id } });
                yield (verifySmsResult === null || verifySmsResult === void 0 ? void 0 : verifySmsResult.destroy());
                const verifyEmailResult = yield Verify_1.Verify.findOne({ where: { id: verifyEmail.id } });
                yield (verifyEmailResult === null || verifyEmailResult === void 0 ? void 0 : verifyEmailResult.destroy());
                return (0, modules_1.successResponse)(res, "Successful", {
                    message: "email and sms verification successful",
                    status: true
                });
            }
            else {
                (0, modules_1.errorResponse)(res, "Failed", {
                    message: `Invalid ${!verifySms ? "SmS" : "Email"} Code`,
                    status: false
                });
            }
        }
        else {
            (0, modules_1.errorResponse)(res, "Failed", {
                message: `${!verifySms ? "SmS" : "Email"} Code Already Used`,
                status: false
            });
        }
    }
});
exports.verifyOtp = verifyOtp;
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, phone, password, role } = req.body;
    (0, bcryptjs_1.hash)(password, modules_1.saltRounds, function (err, hashedPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const userEmail = yield User_1.User.findOne({ where: { email } });
            const userPhone = yield User_1.User.findOne({ where: { phone } });
            if (!(0, modules_1.validateEmail)(email))
                return (0, modules_1.successResponseFalse)(res, "Failed", { status: false, message: "Enter a valid email" });
            if (userPhone || userEmail) {
                if ((userEmail === null || userEmail === void 0 ? void 0 : userEmail.state) === User_1.UserState.VERIFIED || (userPhone === null || userPhone === void 0 ? void 0 : userPhone.state) === User_1.UserState.VERIFIED) {
                    if (userPhone)
                        return (0, modules_1.successResponseFalse)(res, "Failed", { status: false, message: "Phone already exist", state: userPhone.state });
                    if (userEmail)
                        return (0, modules_1.successResponseFalse)(res, "Failed", { status: false, message: "Email already exist", state: userEmail.state });
                }
                yield (userEmail === null || userEmail === void 0 ? void 0 : userEmail.destroy());
            }
            const user = yield User_1.User.create({
                email, phone, password: hashedPassword, role
            });
            const emailServiceId = (0, modules_1.randomId)(12);
            const codeEmail = String(Math.floor(1000 + Math.random() * 9000));
            yield Verify_1.Verify.create({
                serviceId: emailServiceId,
                code: codeEmail,
                client: email,
                secret_key: (0, modules_1.createRandomRef)(12, "ace_pick"),
            });
            try {
                const emailResult = yield (0, sms_1.sendEmailResend)(user.email, "Email Verification", `Dear User,<br><br>
      
                Thank you for choosing our service. To complete your registration and ensure the security of your account, please use the verification code below<br><br>
                
                Verification Code: ${codeEmail}<br><br>
                
                Please enter this code on our website/app to proceed with your registration process. If you did not initiate this action, please ignore this email.<br><br>
                
            `);
            }
            catch (error) {
                return (0, modules_1.errorResponse)(res, "An Error Occurred", error);
            }
            let token = (0, jsonwebtoken_1.sign)({ id: user.id, email: user.email, role: user.role }, configSetup_1.default.TOKEN_SECRET);
            const chatToken = serverClient.createToken(`${String(user.id)}`);
            const profile = yield Profile_1.Profile.findOne({ where: { userId: user.id } });
            try {
            }
            catch (error) {
                return (0, modules_1.errorResponse)(res, "An Error Occurred", error);
            }
            return (0, modules_1.successResponse)(res, "Successful", {
                status: true,
                message: {
                    email, phone, token, emailServiceId, chatToken
                }
            });
        });
    });
});
exports.register = register;
const passwordChange = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { password, confirmPassword } = req.body;
    const { id } = req.user;
    if (password !== confirmPassword)
        return (0, modules_1.errorResponse)(res, "Password do not match", { status: false, message: "Password do not match" });
    const user = yield User_1.User.findOne({ where: { id } });
    if (!user)
        return (0, modules_1.errorResponse)(res, "Failed", { status: false, message: "User does not exist" });
    (0, bcryptjs_1.hash)(password, modules_1.saltRounds, function (err, hashedPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            yield user.update({ password: hashedPassword });
            return (0, modules_1.successResponse)(res, "Password changed successfully");
        });
    });
});
exports.passwordChange = passwordChange;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { email, password, type, fcmToken } = req.body;
    try {
        const user = yield User_1.User.findOne({ where: { email } });
        if (!user)
            return (0, modules_1.handleResponse)(res, 404, false, "User does not exist");
        const match = yield (0, bcryptjs_1.compare)(password, user.password);
        if (!match)
            return (0, modules_1.handleResponse)(res, 404, false, "Invalid Credentials");
        let token = (0, jsonwebtoken_1.sign)({ id: user.id, email: user.email, role: user.role }, configSetup_1.default.TOKEN_SECRET);
        const chatToken = serverClient.createToken(`${String(user.id)}`);
        const profile = yield Profile_1.Profile.findOne({ where: { userId: user.id } });
        yield (profile === null || profile === void 0 ? void 0 : profile.update({ fcmToken }));
        const profileUpdated = yield Profile_1.Profile.findOne({
            where: { userId: user.id },
            include: [{
                    model: User_1.User,
                    attributes: ['id', 'email', 'phone', 'fcmToken', 'status'],
                    // include: [{
                    //     model: Wallet
                    // }]
                }]
        });
        const walletResponse = yield axios_1.default.get(`${configSetup_1.default.PAYMENT_BASE_URL}/pay-api/view-wallet`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const wallet = walletResponse.data.data;
        profileUpdated === null || profileUpdated === void 0 ? void 0 : profileUpdated.setDataValue('wallet', wallet);
        return (0, modules_1.successResponse)(res, "Successful", { status: true, profile: profileUpdated, token, chatToken });
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, 'error', error.message);
    }
    // profile?.fcmToken == null ? null : sendExpoNotification(profileUpdated!.fcmToken, "hello world");
    // if (profile?.type == ProfileType.CLIENT) {
    //     if (type == profile?.type) {
    //         const response = await serverClient.upsertUsers([{
    //             id: String(user.id),
    //             role: 'admin',
    //             mycustomfield: {
    //                 email: `${user.email}`,
    //                 accountType: profile?.type,
    //                 userId: String(user.id),
    //             }
    //         }]);
    //         return successResponse(res, "Successful", { status: true, message: { ...user.dataValues, token, chatToken } })
    //     } else {
    //         return successResponseFalse(res, "Cannot access Client account")
    //     }
    // } else {
    //     if (type == profile?.type) {
    //         const professionalProfile = await Professional.findAll(
    //             {
    //                 order: [
    //                     ['id', 'DESC']
    //                 ],
    //                 include: [
    //                     { model: Cooperation },
    //                     {
    //                         model: Profile,
    //                         where: { userId: profile?.userId },
    //                         include: [
    //                             {
    //                                 model: User,
    //                                 attributes: [
    //                                     'createdAt', 'updatedAt', "email", "phone"],
    //                                 include: [{
    //                                     model: Wallet,
    //                                     where: {
    //                                         type: WalletType.PROFESSIONAL
    //                                     }
    //                                 },
    //                                 {
    //                                     model: Education,
    //                                 },
    //                                 {
    //                                     model: Certification,
    //                                 },
    //                                 {
    //                                     model: Experience,
    //                                 },
    //                                 {
    //                                     model: Portfolio,
    //                                     order: [
    //                                         ['id', 'DESC'],
    //                                     ],
    //                                 },
    //                                 ]
    //                             },
    //                         ],
    //                     }
    //                 ],
    //             }
    //         )
    //         let data = deleteKey(professionalProfile[0].dataValues, "profile", "corperate");
    //         let mergedObj = {
    //             profile: professionalProfile[0].dataValues.profile,
    //             professional: { ...data },
    //             corperate: professionalProfile[0].dataValues.corperate,
    //         }
    //         const response = await serverClient.upsertUsers([{
    //             id: String(user.id),
    //             role: 'admin',
    //             // mycustomfield: {
    //             //   email: `${user.email}`,
    //             //   accountType: profile?.type,
    //             //   data: mergedObj
    //             // }
    //         }]);
    //         return successResponse(res, "Successful", { status: true, message: { ...user.dataValues, token, chatToken } })
    //     }
    //     else {
    //         return successResponseFalse(res, "Cannot access Professional account")
    //     }
    // }
});
exports.login = login;
const deleteUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User_1.User.findAll({});
    let index = 0;
    for (let value of user) {
        yield value.destroy();
        index++;
    }
    if (index == user.length) {
        return (0, modules_1.successResponse)(res, "Successful");
    }
});
exports.deleteUsers = deleteUsers;
const upload_avatar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let filePath = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path;
    if (!filePath) {
        return (0, modules_1.successResponseFalse)(res, "No file uploaded");
    }
    const url = yield (0, upload_1.upload_cloud)(filePath);
    return (0, modules_1.successResponse)(res, "Successful", { url });
});
exports.upload_avatar = upload_avatar;
const registerStepTwo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { fullName, lga, state, address, type, avatar } = req.body;
    let { id } = req.user;
    const user = yield User_1.User.findOne({ where: { id } });
    const profile = yield Profile_1.Profile.findOne({ where: { userId: id } });
    if (profile)
        return (0, modules_1.errorResponse)(res, "Failed", { status: false, message: "Profile Already Exist" });
    const profileCreate = yield Profile_1.Profile.create({ fullName, lga, state, address, type, userId: id, avatar /*: convertHttpToHttps(avatar)*/ });
    const wallet = yield Wallet_1.Wallet.create({ userId: id, balance: 0 });
    yield (0, sms_1.sendEmailResend)(user.email, "Welcome to Acepick", `Welcome on board ${profileCreate.fullName},<br><br> we are pleased to have you on Acepick, please validate your account by providing your BVN to get accessible to all features on Acepick.<br><br> Thanks.`);
    yield (user === null || user === void 0 ? void 0 : user.update({ state: Profile_1.ProfileType.CLIENT ? User_1.UserState.VERIFIED : User_1.UserState.STEP_THREE }));
    (0, modules_1.successResponse)(res, "Successful", { status: true, message: profileCreate });
});
exports.registerStepTwo = registerStepTwo;
const registerStepThree = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { intro, regNum, experience, professionId, chargeFrom } = req.body;
    try {
        let { id } = req.user;
        const user = yield User_1.User.findOne({ where: { id } });
        const professional = yield Professional_1.Professional.findOne({ where: { userId: id } });
        if (professional)
            return (0, modules_1.errorResponse)(res, "Failed", { status: false, message: "Professional Already Exist" });
        const profile = yield Profile_1.Profile.findOne({ where: { userId: id } });
        const professionalCreate = yield Professional_1.Professional.create({
            profileId: profile === null || profile === void 0 ? void 0 : profile.id, intro, regNum, yearsOfExp: experience, chargeFrom,
            file: { images: [] }, userId: id, professionId
        });
        // const wallet = await Wallet.create({ userId: user?.id, type: WalletType.PROFESSIONAL })
        yield (profile === null || profile === void 0 ? void 0 : profile.update({ type: Profile_1.ProfileType.PROFESSIONAL, corperate: false, switch: true }));
        yield (user === null || user === void 0 ? void 0 : user.update({ state: User_1.UserState.VERIFIED }));
        (0, modules_1.successResponse)(res, "Successful", professionalCreate);
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, "Failed", { message: "Error creating professional", error });
    }
});
exports.registerStepThree = registerStepThree;
const corperateReg = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { nameOfOrg, phone, address, state, lga, postalCode, regNum, noOfEmployees } = req.body;
    let { id } = req.user;
    const user = yield User_1.User.findOne({ where: { id } });
    const corperate = yield Cooperation_1.Cooperation.findOne({ where: { userId: id } });
    if (corperate)
        return (0, modules_1.errorResponse)(res, "Failed", { status: false, message: "Coorperate Account Already Exist" });
    const profile = yield Profile_1.Profile.findOne({ where: { userId: id } });
    const coorperateCreate = yield Cooperation_1.Cooperation.create({
        nameOfOrg, phone, address, state, lga, postalCode, regNum, noOfEmployees, profileId: profile === null || profile === void 0 ? void 0 : profile.id,
        userId: id
    });
    // const prof = await Professional.findOne({ where: { userId: id } })
    // await profile?.update({ corperate: true, fullName: nameOfOrg })
    // await prof?.update({ corperateId: coorperateCreate.id })
    // await user?.update({ state: UserState.VERIFIED })
    // successResponse(res, "Successful", coorperateCreate)
});
exports.corperateReg = corperateReg;
const swithAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { id } = req.user;
    let { type } = req.query;
    const profile = yield Profile_1.Profile.findOne({ where: { userId: id } });
    if (type == Profile_1.ProfileType.CLIENT) {
        yield (profile === null || profile === void 0 ? void 0 : profile.update({ type: Profile_1.ProfileType.CLIENT }));
        return (0, modules_1.successResponse)(res, "Successful");
    }
    else {
        if ((profile === null || profile === void 0 ? void 0 : profile.corperate) == null) {
            return (0, modules_1.successResponseFalse)(res, "Completed Proffesional account setup");
        }
        else {
            yield (profile === null || profile === void 0 ? void 0 : profile.update({ type: Profile_1.ProfileType.PROFESSIONAL }));
            return (0, modules_1.successResponse)(res, "Successful");
        }
    }
});
exports.swithAccount = swithAccount;
const updateFcmToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { token } = req.body;
    let { id } = req.user;
    const user = yield User_1.User.findOne({ where: { id } });
    yield (user === null || user === void 0 ? void 0 : user.update({ fcmToken: token }));
    (0, modules_1.successResponse)(res, "Successful", token);
});
exports.updateFcmToken = updateFcmToken;
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { password, code, emailServiceId } = req.body;
    const verify = yield Verify_1.Verify.findOne({
        where: {
            code,
            serviceId: emailServiceId,
            used: false
        }
    });
    if (!verify)
        return (0, modules_1.errorResponse)(res, "Failed", { status: false, message: "Invalid Code" });
    (0, bcryptjs_1.hash)(password, modules_1.saltRounds, function (err, hashedPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.User.findOne({ where: { email: verify.client } });
            user === null || user === void 0 ? void 0 : user.update({ password: hashedPassword });
            // let token = sign({ id: user!.id, email: user!.email }, config.TOKEN_SECRET);
            yield verify.destroy();
            return (0, modules_1.successResponse)(res, "Password Changed Successfully");
        });
    });
});
exports.changePassword = changePassword;
// export const accountInfo = async (req: Request, res: Response) => {
//     const { id } = req.user;
//     const profileX = await Profile.findOne(
//         {
//             where: { userId: id },
//             include: [{
//                 model: User,
//                 attributes: [
//                     'createdAt', 'updatedAt', "email", "phone"], include: [{
//                         model: Wallet,
//                     },
//                     // { model: Dispute }
//                     ]
//             }
//             ],
//         }
//     )
//     if (!profileX) return errorResponse(res, "Failed", { status: false, message: "Profile Does'nt exist" })
//     if (profileX?.type == ProfileType.CLIENT) {
//         const canceledJob = await Job.findAll({
//             where: {
//                 status: JobStatus.CANCEL,
//                 userId: [id],
//             }
//         })
//         const ongoingJob = await Job.findAll({
//             where: {
//                 status: JobStatus.ONGOING,
//                 userId: [id],
//             }
//         })
//         const completedJob = await Job.findAll({
//             where: {
//                 status: JobStatus.COMPLETED,
//                 userId: [id],
//             }
//         })
//         const rejectedJob = await Job.findAll({
//             where: {
//                 status: [JobStatus.REJECTED, JobStatus.DISPUTED],
//                 userId: [id],
//             }
//         })
//         const pendingJob = await Job.findAll({
//             where: {
//                 // status: [JobStatus.PENDING, JobStatus.INVOICE],
//                 status: [JobStatus.PENDING],
//                 userId: [id],
//             }
//         })
//         const review = await Review.findAll({
//             where: {
//                 clientUserId: id
//             },
//             include: [{
//                 model: User, as: "user",
//                 attributes: ["id"], include: [{ model: Profile, attributes: ["fullName", "avatar"] }]
//             }]
//         })
//         // const disputes = await Dispute.findAll({
//         //     where: {
//         //         [Op.or]: [
//         //             { reporterId: id },
//         //             { partnerId: id }
//         //         ]
//         //     }
//         // })
//         const all_transactions = await Transactions.findAll({
//             order: [
//                 ['id', 'DESC']
//             ],
//             where: {
//                 userId: id,
//                 type: TransactionType.DEBIT,
//             },
//             attributes: [[Sequelize.literal('SUM(amount)'), 'result']],
//         });
//         await profileX.update({
//             totalExpense: all_transactions[0].dataValues.result ?? 0,
//             totalReview: review.length, totalJobCanceled: canceledJob.length, /*totalDisputes: disputes.length,*/
//             totalOngoingHire: ongoingJob.length, totalCompletedHire: completedJob.length, totalJobRejected: rejectedJob.length,
//             totalPendingHire: pendingJob.length,
//         })
//         const profile = await Profile.findOne(
//             {
//                 where: { userId: id },
//                 include: [{
//                     model: User,
//                     attributes: [
//                         'createdAt', 'updatedAt', "email", "phone"],
//                     include: [{
//                         model: Wallet,
//                         where: {
//                             type: WalletType.CLIENT
//                         }
//                     },
//                     {
//                         model: Review,
//                         order: [
//                             ['id', 'DESC'],
//                         ],
//                         limit: 4,
//                     },
//                     // { model: Dispute }
//                     ]
//                 }
//                 ],
//             }
//         )
//         return successResponse(res, "Successful", {
//             profile: profile,
//             professional: null,
//             corperate: null,
//             review: review.slice(0, 4)
//         })
//     } else {
//         const canceledJob = await Job.findAll({
//             where: {
//                 status: JobStatus.CANCEL,
//                 ownerId: [id],
//             }
//         })
//         const ongoingJob = await Job.findAll({
//             where: {
//                 status: JobStatus.ONGOING,
//                 ownerId: [id],
//             }
//         })
//         const pendingJob = await Job.findAll({
//             where: {
//                 status: [JobStatus.PENDING, JobStatus.INVOICE],
//                 ownerId: [id],
//             }
//         })
//         const rejectedJob = await Job.findAll({
//             where: {
//                 status: [JobStatus.REJECTED, JobStatus.DISPUTED],
//                 ownerId: [id],
//             }
//         })
//         const completedJob = await Job.findAll({
//             where: {
//                 status: JobStatus.COMPLETED,
//                 ownerId: [id],
//             }
//         })
//         const rejectedAmount = await Job.findAll({
//             where: {
//                 status: JobStatus.CANCEL
//             }, attributes: [[Sequelize.literal('COALESCE(SUM(total), 0.0)'), 'result']],
//         })
//         const completedAmount = await Job.findAll({
//             where: {
//                 status: JobStatus.COMPLETED,
//             }, attributes: [[Sequelize.literal('COALESCE(SUM(total), 0.0)'), 'result']]
//         })
//         const wallet = await Wallet.findOne({
//             where: {
//                 userId: id,
//                 type: WalletType.PROFESSIONAL
//             }
//         })
//         const updateProffessionalProfile = await Professional.findOne({ where: { userId: id } })
//         const review = await Review.findAll({
//             where: {
//                 proffesionalUserId: id
//             },
//             include: [{
//                 model: User, as: "user",
//                 attributes: ["id"], include: [{ model: Profile, attributes: ["fullName", "avatar"] }]
//             }]
//         })
//         const disputes = await Dispute.findAll({
//             where: {
//                 [Op.or]: [
//                     { reporterId: id },
//                     { partnerId: id }
//                 ]
//             }
//         })
//         await profileX.update({ totalReview: review.length, totalJobCanceled: canceledJob.length, totalDisputes: disputes.length })
//         const all_transactions = await Transactions.findAll({
//             order: [
//                 ['id', 'DESC']
//             ],
//             where: {
//                 userId: id,
//                 type: TransactionType.CREDIT,
//                 creditType: CreditType.EARNING
//             },
//             attributes: [[Sequelize.literal('SUM(amount)'), 'result']],
//         });
//         await updateProffessionalProfile?.update({
//             totalEarning: all_transactions[0].dataValues.result ?? 0,
//             availableWithdrawalAmount: wallet?.amount,
//             totalReview: review.length,
//             totalDispute: disputes.length,
//             rejectedAmount: Number(rejectedAmount[0].dataValues.result),
//             pendingAmount: wallet?.transitAmount,
//             completedAmount: Number(completedAmount[0].dataValues.result),
//             totalJobCompleted: completedJob.length, totalJobCanceled: canceledJob.length,
//             totalJobPending: pendingJob.length, totalJobOngoing: ongoingJob.length,
//             totalJobRejected: rejectedJob.length
//         })
//         const professionalProfile = await Professional.findAll(
//             {
//                 order: [
//                     ['id', 'DESC']
//                 ],
//                 include: [
//                     { model: Cooperation },
//                     {
//                         model: Profile,
//                         where: { userId: id },
//                         include: [
//                             {
//                                 model: User,
//                                 attributes: [
//                                     'createdAt', 'updatedAt', "email", "phone"],
//                                 include: [{
//                                     model: Wallet,
//                                     where: {
//                                         type: WalletType.PROFESSIONAL
//                                     }
//                                 },
//                                 {
//                                     model: Education,
//                                 },
//                                 {
//                                     model: Certification,
//                                 },
//                                 {
//                                     model: Experience,
//                                 },
//                                 {
//                                     model: Portfolio,
//                                     order: [
//                                         ['id', 'DESC'],
//                                     ],
//                                 },
//                                 {
//                                     model: Review,
//                                     order: [
//                                         ['id', 'DESC'],
//                                     ],
//                                     limit: 4,
//                                 },
//                                 ]
//                             },
//                         ],
//                     }
//                 ],
//             }
//         )
//         let data = deleteKey(professionalProfile[0].dataValues, "profile", "corperate");
//         let mergedObj = {
//             profile: professionalProfile[0].dataValues.profile,
//             professional: { ...data },
//             corperate: professionalProfile[0].dataValues.corperate,
//             review: review.slice(0, 4)
//         }
//         if (!profileX) return errorResponse(res, "Failed", { status: false, message: "Profile Does'nt exist" })
//         return successResponse(res, "Successful", mergedObj)
//     }
// };
// export const accountSingleInfo = async (req: Request, res: Response) => {
//     const { id } = req.params;
//     const profileX = await Profile.findOne(
//         {
//             where: { userId: id },
//             include: [{
//                 model: User,
//                 attributes: [
//                     'createdAt', 'updatedAt', "email", "phone"], include: [{
//                         model: Wallet,
//                     },
//                     { model: Dispute }
//                     ]
//             }
//             ],
//         }
//     )
//     console.log(profileX?.type)
//     if (!profileX) return errorResponse(res, "Failed", { status: false, message: "Profile Does'nt exist" })
//     if (profileX?.type == ProfileType.CLIENT) {
//         const canceledJob = await Job.findAll({
//             where: {
//                 status: JobStatus.CANCEL,
//                 userId: [id],
//             }
//         })
//         const ongoingJob = await Job.findAll({
//             where: {
//                 status: JobStatus.ONGOING,
//                 userId: [id],
//             }
//         })
//         const completedJob = await Job.findAll({
//             where: {
//                 status: JobStatus.COMPLETED,
//                 userId: [id],
//             }
//         })
//         const rejectedJob = await Job.findAll({
//             where: {
//                 status: [JobStatus.REJECTED, JobStatus.DISPUTED],
//                 userId: [id],
//             }
//         })
//         const pendingJob = await Job.findAll({
//             where: {
//                 status: [JobStatus.PENDING, JobStatus.INVOICE],
//                 userId: [id],
//             }
//         })
//         const review = await Review.findAll({
//             where: {
//                 clientUserId: id
//             },
//             include: [{
//                 model: User, as: "user",
//                 attributes: ["id"], include: [{ model: Profile, attributes: ["fullName", "avatar"] }]
//             }]
//         })
//         const disputes = await Dispute.findAll({
//             where: {
//                 [Op.or]: [
//                     { reporterId: id },
//                     { partnerId: id }
//                 ]
//             }
//         })
//         const all_transactions = await Transactions.findAll({
//             order: [
//                 ['id', 'DESC']
//             ],
//             where: {
//                 userId: id,
//                 type: TransactionType.DEBIT,
//             },
//             attributes: [[Sequelize.literal('SUM(amount)'), 'result']],
//         });
//         await profileX.update({
//             totalExpense: all_transactions[0].dataValues.result ?? 0,
//             totalReview: review.length, totalJobCanceled: canceledJob.length, totalDisputes: disputes.length,
//             totalOngoingHire: ongoingJob.length, totalCompletedHire: completedJob.length, totalJobRejected: rejectedJob.length,
//             totalPendingHire: pendingJob.length,
//         })
//         const profile = await Profile.findOne(
//             {
//                 where: { userId: id },
//                 include: [{
//                     model: User,
//                     attributes: [
//                         'createdAt', 'updatedAt', "email", "phone"], include: [{
//                             model: Wallet,
//                             where: {
//                                 type: WalletType.CLIENT
//                             }
//                         },
//                         { model: Dispute }
//                         ]
//                 }
//                 ],
//             }
//         )
//         return successResponse(res, "Successful", {
//             profile: profile,
//             professional: null,
//             corperate: null,
//             review: review.slice(0, 4)
//         })
//     } else {
//         const canceledJob = await Job.findAll({
//             where: {
//                 status: JobStatus.CANCEL,
//                 ownerId: [id],
//             }
//         })
//         const ongoingJob = await Job.findAll({
//             where: {
//                 status: JobStatus.ONGOING,
//                 ownerId: [id],
//             }
//         })
//         const pendingJob = await Job.findAll({
//             where: {
//                 status: [JobStatus.PENDING, JobStatus.INVOICE],
//                 ownerId: [id],
//             }
//         })
//         const rejectedJob = await Job.findAll({
//             where: {
//                 status: [JobStatus.REJECTED, JobStatus.DISPUTED],
//                 ownerId: [id],
//             }
//         })
//         const completedJob = await Job.findAll({
//             where: {
//                 status: JobStatus.COMPLETED,
//                 ownerId: [id],
//             }
//         })
//         const rejectedAmount = await Job.findAll({
//             where: {
//                 status: JobStatus.CANCEL
//             }, attributes: [[Sequelize.literal('COALESCE(SUM(total), 0.0)'), 'result']],
//         })
//         const completedAmount = await Job.findAll({
//             where: {
//                 status: JobStatus.COMPLETED,
//             }, attributes: [[Sequelize.literal('COALESCE(SUM(total), 0.0)'), 'result']]
//         })
//         const wallet = await Wallet.findOne({
//             where: {
//                 userId: id,
//                 type: WalletType.PROFESSIONAL
//             }
//         })
//         const review = await Review.findAll({
//             where: {
//                 proffesionalUserId: id,
//             },
//             include: [{
//                 model: User, as: "user",
//                 attributes: ["id"], include: [{ model: Profile, attributes: ["fullName", "avatar"] }]
//             }]
//         })
//         const disputes = await Dispute.findAll({
//             where: {
//                 [Op.or]: [
//                     { reporterId: id },
//                     { partnerId: id }
//                 ]
//             }
//         })
//         const updateProffessionalProfile = await Professional.findOne({
//             where: { userId: id },
//         })
//         await profileX.update({ totalReview: review.length, totalJobCanceled: canceledJob.length, totalDisputes: disputes.length })
//         const all_transactions = await Transactions.findAll({
//             order: [
//                 ['id', 'DESC']
//             ],
//             where: {
//                 userId: id,
//                 type: TransactionType.CREDIT,
//                 creditType: CreditType.EARNING
//             },
//             attributes: [[Sequelize.literal('SUM(amount)'), 'result']],
//         });
//         await updateProffessionalProfile?.update({
//             totalEarning: all_transactions[0].dataValues.result ?? 0,
//             availableWithdrawalAmount: wallet?.amount,
//             totalReview: review.length,
//             totalDispute: disputes.length,
//             rejectedAmount: Number(rejectedAmount[0].dataValues.result),
//             pendingAmount: wallet?.transitAmount,
//             completedAmount: Number(completedAmount[0].dataValues.result),
//             totalJobCompleted: completedJob.length, totalJobCanceled: canceledJob.length,
//             totalJobPending: pendingJob.length, totalJobOngoing: ongoingJob.length,
//             totalJobRejected: rejectedJob.length
//         })
//         const professional = await Professional.findOne({
//             where: { userId: id },
//             include: [
//                 {
//                     model: Profile,
//                     include: [
//                         {
//                             model: ProfessionalSector,
//                             include: [
//                                 { model: Sector },
//                                 { model: Profession },
//                             ],
//                             order: [
//                                 ['id', 'DESC'],
//                             ],
//                         }
//                     ]
//                 },
//                 { model: Cooperation },
//                 {
//                     model: User,
//                     include: [{ model: LanLog },
//                     {
//                         model: Education,
//                         order: [
//                             ['id', 'DESC'],
//                         ],
//                     },
//                     {
//                         model: Certification,
//                         order: [
//                             ['id', 'DESC'],
//                         ],
//                     },
//                     {
//                         model: Experience,
//                     },
//                     {
//                         model: Portfolio,
//                         order: [
//                             ['id', 'DESC'],
//                         ],
//                     },
//                     { model: Dispute }
//                     ]
//                 },
//             ],
//         });
//         let data = deleteKey(professional?.dataValues, "profile", "corperate");
//         return successResponse(res, "Successful", {
//             profile: professional?.dataValues.profile,
//             corperate: professional?.dataValues.corperate,
//             professional: data,
//             review: review.slice(0, 4)
//         })
//     }
// };
const postlocationData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { lan, log, address } = req.body;
    const { id } = req.user;
    try {
        const getlocation = yield LanLog_1.LanLog.findOne({
            where: {
                userId: id
            }
        });
        const user = yield User_1.User.findOne({
            where: {
                id
            }
        });
        if (getlocation) {
            const location = yield getlocation.update({
                latitude: lan !== null && lan !== void 0 ? lan : getlocation.latitude, longitude: log !== null && log !== void 0 ? log : getlocation.longitude,
                userId: id, address: address !== null && address !== void 0 ? address : getlocation.address,
                coordinates: { type: 'Point', coordinates: [lan !== null && lan !== void 0 ? lan : getlocation.latitude, log !== null && log !== void 0 ? log : getlocation.longitude] },
            });
            if (location)
                return (0, modules_1.successResponse)(res, "Updated Successfully", location);
            return (0, modules_1.errorResponse)(res, "Failed updating Location");
        }
        else {
            const insertData = {
                latitude: lan, longitude: log, userId: id, address,
                coordinates: { type: 'Point', coordinates: [lan, log] },
            };
            const location = yield LanLog_1.LanLog.create(insertData);
            yield (user === null || user === void 0 ? void 0 : user.update({ locationId: location.id }));
            if (location)
                return (0, modules_1.successResponse)(res, "Created Successfully", location);
            return (0, modules_1.errorResponse)(res, "Failed Creating Location");
        }
    }
    catch (error) {
        console.log(error);
        return (0, modules_1.errorResponse)(res, `An error occurred - ${error}`);
    }
});
exports.postlocationData = postlocationData;
const verifyMyBvn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { bvn } = req.body;
    try {
        let result = yield (0, bvn_1.verifyBvn)(bvn);
        let verifyStatus = result;
        return (0, modules_1.successResponse)(res, "BVN verified successfully", verifyStatus);
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, "BVN verification failed", error);
    }
});
exports.verifyMyBvn = verifyMyBvn;
// export const verifyBvnDetail = async (req: Request, res: Response) => {
//     try {
//         const redis = new Redis();
//         const { bvnInpt } = req.body;
//         const { id } = req.user;
//         const user = await User.findOne({ where: { id } })
//         const profile = await Profile.findOne({ where: { userId: id } })
//         // console.log(profile);
//         const cachedUserBvn = await redis.getData(`bvn-${profile!.id}`);
//         if (cachedUserBvn) {
//             const { first_name, middle_name, last_name, gender, phone } = JSON.parse(cachedUserBvn);
//             const full_name = `${last_name ?? ""} ${first_name ?? ""} ${middle_name ?? ""}`;
//             if (compareTwoStrings(`${full_name}`.toLowerCase(), `${profile?.fullName}`.toLowerCase()) < 0.72) {
//                 console.log(full_name)
//                 console.log(`${profile?.fullName}`)
//                 console.log(compareTwoStrings(`${full_name}`.toLowerCase(), `${profile?.fullName}`.toLowerCase()))
//                 await sendEmailResend(user!.email, "Verification Failed", `Hello ${profile?.fullName}, Your account validated failed,<br><br> reason: BVN data mismatch.<br><br> Try again. Best Regards.`);
//                 return errorResponse(res, 'BVN data mismatch');
//             } else {
//                 await profile?.update({ verified: true })
//                 await sendEmailResend(user!.email, "Verification Successful", `Hello ${profile?.fullName}, Your account is now validated, you now have full access to all features.<br><br> Thank you for trusting Acepick. Best Regards.`);
//                 return successResponse(res, 'Verification Successful', { full_name, gender, phone });
//             }
//         }
//         const bvn = await verifyBvn(bvnInpt);
//         if (bvn!.message.verificationStatus == "NOT VERIFIED") return errorResponse(res, `${bvn!.message.description}`);
//         await redis.setData(`bvn-${profile!.id}`, JSON.stringify(bvn.message.response), 3600); // cache in redis for 1 hour
//         const { first_name, middle_name, last_name, gender, phone } = bvn.message.response;
//         const full_name = `${last_name ?? ""} ${first_name ?? ""} ${middle_name ?? ""}`;
//         console.log(bvn.message)
//         if (compareTwoStrings(`${full_name}`.toLowerCase(), `${profile?.fullName}`.toLowerCase()) < 0.72) {
//             console.log(compareTwoStrings(`${full_name}`.toLowerCase(), `${profile?.fullName}`.toLowerCase()))
//             console.log(full_name)
//             console.log(`${profile?.fullName}`)
//             await sendEmailResend(user!.email, "Verification Failed", `Hello ${profile?.fullName},<br><br> Your account validated failed,<br><br> reason: BVN data mismatch.<br><br> Try again. Best Regards.`);
//             return errorResponse(res, 'BVN data mismatch');
//         } else {
//             await profile?.update({ verified: true })
//             await sendEmailResend(user!.email, "Verification Successful", `Hello ${profile?.fullName},<br><br> Your account is now validated, you now have full access to all features.<br><br> Thank you for trusting Acepick. Best Regards.`);
//             return successResponse(res, 'Verification Successful', { full_name, gender, phone, });
//         }
//     } catch (error) {
//         console.log(error);
//         return errorResponse(res, `An error occurred - ${error}`);
//     }
// }
// export const getEarningSummary = async (req: Request, res: Response) => {
//     const today = new Date();
//     const year = today.getFullYear();
//     const month = today.getMonth();
//     // const prvmonth = today.getMonth() - 1;
//     // Get the start date of the month
//     const monthstartDate = new Date(year, month, 1);
//     // Get the end date of the month
//     const monthendDate = new Date(year, month + 1, 0);
//     // Get the start date of the month
//     const previous1MonthstartDate = new Date(year, (today.getMonth() - 1), 1);
//     // Get the end date of the month
//     const previous1MonthendDate = new Date(year, (today.getMonth() - 1) + 1, 0);
//     // Get the start date of the month
//     const previous2MonthstartDate = new Date(year, (today.getMonth() - 2), 1);
//     // Get the end date of the month
//     const previous2MonthendDate = new Date(year, (today.getMonth() - 2) + 1, 0);
//     // Get the start date of the month
//     const previous3MonthstartDate = new Date(year, (today.getMonth() - 3), 1);
//     // Get the end date of the month
//     const previous3MonthendDate = new Date(year, (today.getMonth() - 3) + 1, 0);
//     // Get the start date of the month
//     const previous4MonthstartDate = new Date(year, (today.getMonth() - 4), 1);
//     // Get the end date of the month
//     const previous4MonthendDate = new Date(year, (today.getMonth() - 4) + 1, 0);
//     const formatter = new Intl.DateTimeFormat('en', { month: 'short' });
//     const monthF1: any = formatter.format(monthstartDate);
//     const monthF2: any = formatter.format(previous1MonthstartDate);
//     const monthF3: any = formatter.format(previous2MonthstartDate);
//     const monthF4: any = formatter.format(previous3MonthstartDate);
//     const monthF5: any = formatter.format(previous4MonthstartDate);
//     const { id } = req.user;
//     const profile = await Profile.findOne(
//         {
//             where: { userId: id },
//             include: [{
//                 model: User,
//                 attributes: [
//                     'createdAt', 'updatedAt', "email", "phone"]
//             }
//             ],
//         }
//     )
//     console.log(profile?.type)
//     if (!profile) return errorResponse(res, "Failed", { status: false, message: "Profile Does'nt exist" })
//     if (profile?.type == ProfileType.CLIENT) {
//         try {
//             const all_transactions = await Transactions.findAll({
//                 order: [
//                     ['id', 'DESC']
//                 ],
//                 where: {
//                     userId: id,
//                     type: TransactionType.DEBIT,
//                 },
//                 attributes: [[Sequelize.literal('SUM(amount)'), 'result']],
//             });
//             const transactions = await Transactions.findAll({
//                 order: [
//                     ['id', 'DESC']
//                 ],
//                 where: {
//                     userId: id,
//                     createdAt: {
//                         [Op.gt]: monthstartDate,
//                         [Op.lt]: monthendDate,
//                     },
//                     type: TransactionType.DEBIT,
//                 },
//                 attributes: [[Sequelize.literal('SUM(amount)'), 'result']],
//             });
//             const transactions_1 = await Transactions.findAll({
//                 order: [
//                     ['id', 'DESC']
//                 ],
//                 where: {
//                     userId: id,
//                     createdAt: {
//                         [Op.gt]: previous1MonthstartDate,
//                         [Op.lt]: previous1MonthendDate,
//                     },
//                     type: TransactionType.DEBIT,
//                 },
//                 attributes: [[Sequelize.literal('SUM(amount)'), 'result']],
//             });
//             const transactions_2 = await Transactions.findAll({
//                 order: [
//                     ['id', 'DESC']
//                 ],
//                 where: {
//                     userId: id,
//                     createdAt: {
//                         [Op.gt]: previous2MonthstartDate,
//                         [Op.lt]: previous2MonthendDate,
//                     },
//                     type: TransactionType.DEBIT,
//                 },
//                 attributes: [[Sequelize.literal('SUM(amount)'), 'result']],
//             });
//             const transactions_3 = await Transactions.findAll({
//                 order: [
//                     ['id', 'DESC']
//                 ],
//                 where: {
//                     userId: id,
//                     createdAt: {
//                         [Op.gt]: previous3MonthstartDate,
//                         [Op.lt]: previous3MonthendDate,
//                     },
//                     type: TransactionType.DEBIT,
//                 },
//                 attributes: [[Sequelize.literal('SUM(amount)'), 'result']],
//             });
//             const transactions_4 = await Transactions.findAll({
//                 order: [
//                     ['id', 'DESC']
//                 ],
//                 where: {
//                     userId: id,
//                     createdAt: {
//                         [Op.gt]: previous4MonthstartDate,
//                         [Op.lt]: previous4MonthendDate,
//                     },
//                     type: TransactionType.DEBIT,
//                 },
//                 attributes: [[Sequelize.literal('SUM(amount)'), 'result']],
//             });
//             return successResponse(res, 'Sucessful', {
//                 month: [monthF1, monthF2,
//                     monthF3, monthF4,
//                     monthF5,
//                 ].reverse(),
//                 spending: [transactions[0].dataValues.result ?? 0, transactions_1[0].dataValues.result ?? 0,
//                 transactions_2[0].dataValues.result ?? 0, transactions_3[0].dataValues.result ?? 0,
//                 transactions_4[0].dataValues.result ?? 0,
//                 ].reverse(),
//                 totalSpending: all_transactions[0].dataValues.result ?? 0,
//                 currentMonthSpending: transactions[0].dataValues.result ?? 0,
//             });
//         } catch (error) {
//             console.log(error);
//             return handleResponse(res, 500, false, `An error occured - ${error}`);
//         }
//     } else {
//         try {
//             const all_transactions = await Transactions.findAll({
//                 order: [
//                     ['id', 'DESC']
//                 ],
//                 where: {
//                     userId: id,
//                     type: TransactionType.CREDIT,
//                     creditType: CreditType.EARNING
//                 },
//                 attributes: [[Sequelize.literal('SUM(amount)'), 'result']],
//             });
//             const transactions = await Transactions.findAll({
//                 order: [
//                     ['id', 'DESC']
//                 ],
//                 where: {
//                     userId: id,
//                     createdAt: {
//                         [Op.gt]: monthstartDate,
//                         [Op.lt]: monthendDate,
//                     },
//                     type: TransactionType.CREDIT,
//                     creditType: CreditType.EARNING
//                 },
//                 attributes: [[Sequelize.literal('SUM(amount)'), 'result']],
//             });
//             const transactions_1 = await Transactions.findAll({
//                 order: [
//                     ['id', 'DESC']
//                 ],
//                 where: {
//                     userId: id,
//                     createdAt: {
//                         [Op.gt]: previous1MonthstartDate,
//                         [Op.lt]: previous1MonthendDate,
//                     },
//                     creditType: CreditType.EARNING,
//                     type: TransactionType.CREDIT,
//                 },
//                 attributes: [[Sequelize.literal('SUM(amount)'), 'result']],
//             });
//             const transactions_2 = await Transactions.findAll({
//                 order: [
//                     ['id', 'DESC']
//                 ],
//                 where: {
//                     userId: id,
//                     createdAt: {
//                         [Op.gt]: previous2MonthstartDate,
//                         [Op.lt]: previous2MonthendDate,
//                     },
//                     creditType: CreditType.EARNING,
//                     type: TransactionType.CREDIT,
//                 },
//                 attributes: [[Sequelize.literal('SUM(amount)'), 'result']],
//             });
//             const transactions_3 = await Transactions.findAll({
//                 order: [
//                     ['id', 'DESC']
//                 ],
//                 where: {
//                     userId: id,
//                     createdAt: {
//                         [Op.gt]: previous3MonthstartDate,
//                         [Op.lt]: previous3MonthendDate,
//                     },
//                     type: TransactionType.CREDIT,
//                     creditType: CreditType.EARNING
//                 },
//                 attributes: [[Sequelize.literal('SUM(amount)'), 'result']],
//             });
//             const transactions_4 = await Transactions.findAll({
//                 order: [
//                     ['id', 'DESC']
//                 ],
//                 where: {
//                     userId: id,
//                     createdAt: {
//                         [Op.gt]: previous4MonthstartDate,
//                         [Op.lt]: previous4MonthendDate,
//                     },
//                     type: TransactionType.CREDIT,
//                     creditType: CreditType.EARNING
//                 },
//                 attributes: [[Sequelize.literal('SUM(amount)'), 'result']],
//             });
//             return successResponse(res, 'Sucessful', {
//                 month: [monthF1, monthF2,
//                     monthF3, monthF4,
//                     monthF5,
//                 ].reverse(),
//                 earning: [transactions[0].dataValues.result ?? 0, transactions_1[0].dataValues.result ?? 0,
//                 transactions_2[0].dataValues.result ?? 0, transactions_3[0].dataValues.result ?? 0,
//                 transactions_4[0].dataValues.result ?? 0,
//                 ].reverse(),
//                 totalEarning: all_transactions[0].dataValues.result ?? 0,
//                 currentMonthEarning: transactions[0].dataValues.result ?? 0,
//             });
//         } catch (error) {
//             console.log(error);
//             return handleResponse(res, 500, false, `An error occured - ${error}`);
//         }
//     }
// };
