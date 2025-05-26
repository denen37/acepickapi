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
exports.verifyMyBvn = exports.postlocationData = exports.changePassword = exports.updateFcmToken = exports.corperateReg = exports.deleteUsers = exports.login = exports.passwordChange = exports.registerCorperate = exports.register = exports.verifyOtp = exports.sendEmailTest = exports.sendSMSTest = exports.sendOtp = exports.updateProfile = exports.authorize = void 0;
const modules_1 = require("../utils/modules");
const configSetup_1 = __importDefault(require("../config/configSetup"));
const enum_1 = require("../enum");
const Models_1 = require("../models/Models");
const messages_1 = require("../utils/messages");
const body_1 = require("../validation/body");
const bcryptjs_1 = require("bcryptjs");
const jsonwebtoken_1 = require("jsonwebtoken");
const bcryptjs_2 = __importDefault(require("bcryptjs"));
const jsonwebtoken_2 = require("jsonwebtoken");
const sms_1 = require("../services/sms");
const gmail_1 = require("../services/gmail");
const bvn_1 = require("../services/bvn");
// yarn add stream-chat
const stream_chat_1 = require("stream-chat");
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
    let verified = (0, jsonwebtoken_1.verify)(token, configSetup_1.default.TOKEN_SECRET);
    if (!verified)
        return (0, modules_1.handleResponse)(res, 401, false, `Unauthorized request`);
    return (0, modules_1.handleResponse)(res, 200, true, `Authorized`, verified);
});
exports.authorize = authorize;
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { postalCode, lga, state, address, avatar } = req.body;
    let { id } = req.user;
    const profile = yield Models_1.Profile.findOne({ where: { id } });
    if (!(profile === null || profile === void 0 ? void 0 : profile.verified))
        return (0, modules_1.errorResponse)(res, "Verify your bvn");
    yield (profile === null || profile === void 0 ? void 0 : profile.update({
        lga: lga !== null && lga !== void 0 ? lga : profile.lga,
        avatar: avatar !== null && avatar !== void 0 ? avatar : profile.avatar,
        state: state !== null && state !== void 0 ? state : profile.state,
        address: address !== null && address !== void 0 ? address : profile.address,
    }));
    const updated = yield Models_1.Profile.findOne({ where: { id } });
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
    const parsed = body_1.otpRequestSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            error: "Invalid input",
            issues: parsed.error.format(),
        });
    }
    const { email, phone, type, reason } = parsed.data;
    const codeEmail = String(Math.floor(1000 + Math.random() * 9000));
    const codeSms = String(Math.floor(1000 + Math.random() * 9000));
    let emailSendStatus;
    let smsSendStatus;
    try {
        if (type === enum_1.VerificationType.EMAIL || type === enum_1.VerificationType.BOTH) {
            const verifyEmailRecord = yield Models_1.Verify.create({
                contact: email,
                code: codeEmail,
                type: enum_1.VerificationType.EMAIL,
            });
            let messageId;
            if (reason === enum_1.OTPReason.VERIFICATION) {
                const verifyEmailMsg = (0, messages_1.sendOTPEmail)(codeEmail);
                messageId = yield (0, gmail_1.sendEmail)(email, verifyEmailMsg.title, verifyEmailMsg.body, 'User');
            }
            else if (reason === enum_1.OTPReason.FORGOT_PASSWORD) {
                const msg = (0, messages_1.forgotPasswordEmail)(codeEmail);
                messageId = yield (0, gmail_1.sendEmail)(email, msg.title, msg.body, 'User');
            }
            emailSendStatus = Boolean(messageId);
        }
        if (type === enum_1.VerificationType.SMS || type === enum_1.VerificationType.BOTH) {
            const verifySmsRecord = yield Models_1.Verify.create({
                contact: phone,
                code: codeSms,
                type: enum_1.VerificationType.SMS
            });
            const smsResult = yield (0, sms_1.sendSMS)(phone, codeSms.toString());
            smsSendStatus = smsResult.status;
        }
        return (0, modules_1.successResponse)(res, 'OTP sent successfully', { emailSendStatus, smsSendStatus });
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, error.message, error);
    }
});
exports.sendOtp = sendOtp;
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
const verifyOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = body_1.verifyOTPSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            error: "Invalid input",
            issues: result.error.format()
        });
    }
    const { smsCode, emailCode } = result.data;
    try {
        if (emailCode) {
            const verifyEmail = yield Models_1.Verify.findOne({
                where: {
                    code: emailCode.code,
                    contact: emailCode.email,
                }
            });
            if (!verifyEmail)
                return (0, modules_1.errorResponse)(res, 'Invalid Email Code', null);
            if (verifyEmail.verified)
                return (0, modules_1.errorResponse)(res, 'Email Code already verified');
            if (verifyEmail.createdAt < new Date(Date.now() - configSetup_1.default.OTP_EXPIRY_TIME * 60 * 1000))
                return (0, modules_1.errorResponse)(res, 'Email Code expired', null);
            yield verifyEmail.update({ verified: true });
            yield verifyEmail.save();
        }
        if (smsCode) {
            const verifySms = yield Models_1.Verify.findOne({
                where: {
                    code: smsCode.code,
                    contact: smsCode.phone,
                }
            });
            if (!verifySms)
                return (0, modules_1.errorResponse)(res, 'Invalid SMS Code', null);
            if (verifySms.verified)
                return (0, modules_1.errorResponse)(res, 'SMS Code already verified');
            if (verifySms.createdAt < new Date(Date.now() - configSetup_1.default.OTP_EXPIRY_TIME * 60 * 1000))
                return (0, modules_1.errorResponse)(res, 'SMS Code expired', null);
            yield verifySms.update({ verified: true });
            yield verifySms.save();
        }
        return (0, modules_1.successResponse)(res, 'success', 'Both codes verified successfully');
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, 'error', error.message);
    }
});
exports.verifyOtp = verifyOtp;
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = body_1.registrationSchema.safeParse(req.body);
    if (!result.success)
        return res.status(400).json({
            error: "Invalid input",
            issues: result.error.format()
        });
    const { email, phone, password, role, agreed, firstName, lastName, lga, state, address, avatar } = result.data;
    try {
        if (!(0, modules_1.validateEmail)(email))
            return (0, modules_1.handleResponse)(res, 404, false, "Enter a valid email");
        if (!(0, modules_1.validatePhone)(phone))
            return (0, modules_1.handleResponse)(res, 404, false, "Enter a valid phone number");
        const verifiedEmail = yield Models_1.Verify.findOne({
            where: { contact: email, verified: true }
        });
        if (!verifiedEmail)
            return (0, modules_1.handleResponse)(res, 404, false, "Email not verified");
        const verifiedPhone = yield Models_1.Verify.findOne({
            where: { contact: phone, verified: true }
        });
        if (!verifiedPhone)
            return (0, modules_1.handleResponse)(res, 404, false, "Phone not verified");
        const hashedPassword = yield bcryptjs_2.default.hash(password, 10);
        const user = yield Models_1.User.create({
            email,
            phone,
            password: hashedPassword,
            role,
            agreed
        });
        const profile = yield Models_1.Profile.create({
            userId: user.id,
            firstName,
            lastName,
            lga,
            state,
            address,
            role,
            avatar
        });
        const wallet = yield Models_1.Wallet.create({
            userId: user.id,
            balance: 0,
        });
        user.password = null;
        wallet.pin = null;
        user.setDataValue('profile', profile);
        user.setDataValue('wallet', wallet);
        // console.log('user', user);
        let token = (0, jsonwebtoken_2.sign)({ id: user.id, email: user.email, role: user.role }, configSetup_1.default.TOKEN_SECRET);
        let regEmail = (0, messages_1.registerEmail)(user.dataValues);
        let messageId = yield (0, gmail_1.sendEmail)(email, regEmail.title, regEmail.body, profile.firstName || 'User');
        let emailSendStatus = Boolean(messageId);
        return (0, modules_1.successResponse)(res, "success", { user, token, emailSendStatus });
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, 'error', { message: error.message, error });
    }
});
exports.register = register;
const registerCorperate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = body_1.registerCoporateSchema.safeParse(req.body);
    if (!result.success)
        return res.status(400).json({
            error: "Invalid input",
            issues: result.error.format()
        });
    const { email, phone, password, confirmPassword, role = 'corperate', agreed, firstName, lastName, cooperation } = result.data;
    if (!(0, modules_1.validateEmail)(email))
        return (0, modules_1.handleResponse)(res, 404, false, "Enter a valid email");
    if (!(0, modules_1.validatePhone)(phone))
        return (0, modules_1.handleResponse)(res, 404, false, "Enter a valid phone number");
    try {
        const verifiedEmail = yield Models_1.Verify.findOne({
            where: { contact: email, verified: true }
        });
        if (!verifiedEmail)
            return (0, modules_1.handleResponse)(res, 404, false, "Email not verified");
        const verifiedPhone = yield Models_1.Verify.findOne({
            where: { contact: phone, verified: true }
        });
        if (!verifiedPhone)
            return (0, modules_1.handleResponse)(res, 404, false, "Phone not verified");
        const hashedPassword = yield bcryptjs_2.default.hash(password, 10);
        const user = yield Models_1.User.create({
            email,
            phone,
            password: hashedPassword,
            role,
            agreed
        });
        const profile = yield Models_1.Profile.create({
            avatar: cooperation.avatar,
            userId: user.id,
            firstName,
            lastName
        });
        const newCooperation = yield Models_1.Cooperation.create({
            avatar: cooperation.avatar,
            nameOfOrg: cooperation.nameOfOrg,
            phone: cooperation.phone,
            address: cooperation.address,
            state: cooperation.state,
            lga: cooperation.lga,
            regNum: cooperation.regNum,
            noOfEmployees: cooperation.noOfEmployees,
            profileId: profile.id
        });
        const newDirector = yield Models_1.Director.create({
            firstName: cooperation.director.firstName,
            lastName: cooperation.director.lastName,
            email: cooperation.director.email,
            phone: cooperation.director.phone,
            address: cooperation.director.address,
            state: cooperation.director.state,
            lga: cooperation.director.lga,
            cooperateId: newCooperation.id
        });
        const wallet = yield Models_1.Wallet.create({
            userId: user.id,
            balance: 0,
        });
        user.password = null;
        wallet.pin = null;
        user.setDataValue('profile', profile);
        user.setDataValue('wallet', wallet);
        let token = (0, jsonwebtoken_2.sign)({ id: user.id, email: user.email, role: user.role }, configSetup_1.default.TOKEN_SECRET);
        let regEmail = (0, messages_1.registerEmail)(user.dataValues);
        let messageId = yield (0, gmail_1.sendEmail)(email, regEmail.title, regEmail.body, (profile === null || profile === void 0 ? void 0 : profile.firstName) || 'User');
        let emailSendStatus = Boolean(messageId);
        return (0, modules_1.successResponse)(res, "success", { user, token, emailSendStatus });
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, 'error', error);
    }
});
exports.registerCorperate = registerCorperate;
const passwordChange = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { password, confirmPassword } = req.body;
    const { id } = req.user;
    if (password !== confirmPassword)
        return (0, modules_1.errorResponse)(res, "Password do not match", { status: false, message: "Password do not match" });
    const user = yield Models_1.User.findOne({ where: { id } });
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
    let { email, password, fcmToken } = req.body;
    try {
        const user = yield Models_1.User.findOne({ where: { email } });
        if (!user)
            return (0, modules_1.handleResponse)(res, 404, false, "User does not exist");
        const match = yield (0, bcryptjs_1.compare)(password, user.password || '');
        if (!match)
            return (0, modules_1.handleResponse)(res, 404, false, "Invalid Credentials");
        let token = (0, jsonwebtoken_2.sign)({ id: user.id, email: user.email, role: user.role }, configSetup_1.default.TOKEN_SECRET);
        // const chatToken = serverClient.createToken(`${String(user.id)}`);
        const profile = yield Models_1.Profile.findOne({ where: { userId: user.id } });
        yield (profile === null || profile === void 0 ? void 0 : profile.update({ fcmToken }));
        let userData;
        if (user.role == enum_1.UserRole.CLIENT) {
            userData = yield Models_1.User.findOne({
                where: { id: user.id },
                attributes: { exclude: ['password'] },
                include: [{
                        model: Models_1.Wallet,
                        attributes: { exclude: ['password'] },
                    }, {
                        model: Models_1.Profile,
                    }]
            });
        }
        else if (user.role == enum_1.UserRole.PROFESSIONAL) {
            userData = yield Models_1.User.findOne({
                where: { id: user.id },
                attributes: { exclude: ['password'] },
                include: [{
                        model: Models_1.Wallet,
                        attributes: { exclude: ['password'] },
                    }, {
                        model: Models_1.Profile,
                        include: [{
                                model: Models_1.Professional,
                                include: [{
                                        model: Models_1.Profession,
                                        include: [Models_1.Sector]
                                    }]
                            }]
                    }, {
                        model: Models_1.Review
                    }]
            });
        }
        else {
            userData = yield Models_1.User.findOne({
                where: { id: user.id },
                attributes: { exclude: ['password'] },
                include: [{
                        model: Models_1.Wallet,
                        attributes: { exclude: ['password'] },
                    }, {
                        model: Models_1.Profile,
                        include: [{
                                model: Models_1.Cooperation,
                                include: [Models_1.Director]
                            }]
                    }, {
                        model: Models_1.Review,
                    }]
            });
        }
        return (0, modules_1.successResponse)(res, "Successful", { status: true, user: userData, token });
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
    const user = yield Models_1.User.findAll({});
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
// export const registerStepThree = async (req: Request, res: Response) => {
//     let { intro, regNum, experience, professionId, chargeFrom } = req.body;
//     try {
//         let { id } = req.user;
//         const user = await User.findOne({ where: { id } });
//         const professional = await Professional.findOne({ where: { userId: id } });
//         if (professional) return errorResponse(res, "Failed", { status: false, message: "Professional Already Exist" })
//         const profile = await Profile.findOne({ where: { userId: id } });
//         const professionalCreate = await Professional.create({
//             profileId: profile?.id, intro, regNum, yearsOfExp: experience, chargeFrom,
//             file: { images: [] }, userId: id, professionId
//         })
//         // const wallet = await Wallet.create({ userId: user?.id, type: WalletType.PROFESSIONAL })
//         await profile?.update({ type: ProfileType.PROFESSIONAL, corperate: false, switch: true })
//         await user?.update({ state: UserState.VERIFIED })
//         successResponse(res, "Successful", professionalCreate)
//     } catch (error) {
//         return errorResponse(res, "Failed", { message: "Error creating professional", error })
//     }
// }
const corperateReg = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { nameOfOrg, phone, address, state, lga, postalCode, regNum, noOfEmployees } = req.body;
    let { id } = req.user;
    const user = yield Models_1.User.findOne({ where: { id } });
    const corperate = yield Models_1.Cooperation.findOne({ where: { userId: id } });
    if (corperate)
        return (0, modules_1.errorResponse)(res, "Failed", { status: false, message: "Coorperate Account Already Exist" });
    const profile = yield Models_1.Profile.findOne({ where: { userId: id } });
    const coorperateCreate = yield Models_1.Cooperation.create({
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
// export const swithAccount = async (req: Request, res: Response) => {
//     let { id } = req.user;
//     let { type } = req.query;
//     const profile = await Profile.findOne({ where: { userId: id } });
//     if (type == ProfileType.CLIENT) {
//         await profile?.update({ type: ProfileType.CLIENT })
//         return successResponse(res, "Successful")
//     } else {
//         if (profile?.corperate == null) {
//             return successResponseFalse(res, "Completed Proffesional account setup")
//         } else {
//             await profile?.update({ type: ProfileType.PROFESSIONAL })
//             return successResponse(res, "Successful")
//         }
//     }
// }
const updateFcmToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { token } = req.body;
    let { id } = req.user;
    const user = yield Models_1.User.findOne({ where: { id } });
    yield (user === null || user === void 0 ? void 0 : user.update({ fcmToken: token }));
    (0, modules_1.successResponse)(res, "Successful", token);
});
exports.updateFcmToken = updateFcmToken;
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        (0, bcryptjs_1.hash)(password, modules_1.saltRounds, function (err, hashedPassword) {
            return __awaiter(this, void 0, void 0, function* () {
                const user = yield Models_1.User.findOne({ where: { email: email } });
                user === null || user === void 0 ? void 0 : user.update({ password: hashedPassword });
                return (0, modules_1.successResponse)(res, "Password Changed Successfully");
            });
        });
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, "Failed", { status: false, message: "Error changing password" });
    }
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
        const getlocation = yield Models_1.LanLog.findOne({
            where: {
                userId: id
            }
        });
        const user = yield Models_1.User.findOne({
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
            const location = yield Models_1.LanLog.create(insertData);
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
