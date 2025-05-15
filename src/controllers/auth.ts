import { convertHttpToHttps, createRandomRef, deleteKey, errorResponse, handleResponse, randomId, saltRounds, successResponse, successResponseFalse, validateEmail, validatePhone } from "../utils/modules";
import config from "../config/configSetup"
import { Request, Response } from 'express';
import { VerificationType, Verify } from "../models/Verify";
import { sendSMS } from "../services/sms";
import { UserState, UserStatus, User, UserRole } from "../models/User";
import { compare, hash } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { Profile, ProfileType } from "../models/Profile";
// import { Professional } from "../models/Professional";
import { LanLog } from "../models/LanLog";
// import { Sector } from "../models/Sector";
// import { Profession } from "../models/Profession";
import { Cooperation } from "../models/Cooperation";
// import { Review } from "../models/Review";
import { verifyBvn } from "../services/bvn";
import { compareTwoStrings } from 'string-similarity';

// yarn add stream-chat
import { StreamChat } from 'stream-chat';
// import { JobStatus, Job } from "../models/Job";
import { Education } from "../models/Education";
import { Certification } from "../models/Certification";
import { Experience } from "../models/Experience";
// import { Portfolio } from "../models/Portfolio";
import { Wallet } from "../models/Wallet";
// import { Dispute } from "../models/Dispute";
// import { CreditType, TransactionType, Transactions } from "../models/Transaction";
import { Sequelize } from "sequelize-typescript";
// import { Redis } from "../services/redis";
// import { ProfessionalSector } from "../models/ProfessionalSector";
import { Op } from "sequelize";
import { sendExpoNotification } from "../services/expo";
import { Professional } from "../models/Professional";
import axios from "axios";
import { verify } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { basename } from "path";
import { registerEmail, sendOTPEmail } from "../utils/messages";
import { sendEmail } from "../services/gmail";
import { Director } from "../models/Director";
import { Profession } from "../models/Profession";
import { Sector } from "../models/Sector";
import { Review } from "../models/Review";
import { resolve } from "path/win32";


// instantiate your stream client using the API key and secret
// the secret is only used server side and gives you full access to the API
const serverClient = StreamChat.getInstance('zzfb7h72xhc5',
    '5pfxakc5zasma3hw9awd2qsqgk2fxyr4a5qb3au4kkdt27d7ttnca7vnusfuztud');
// you can still use new StreamChat('api_key', 'api_secret');

// generate a token for the user with id 'john'

export const authorize = async (req: Request, res: Response) => {

    let { token }: { token: string } = req.body;

    if (!token) return handleResponse(res, 401, false, `Access Denied / Unauthorized request`);

    if (token.includes('Bearer')) token = token.split(' ')[1];

    if (token === 'null' || !token) return handleResponse(res, 401, false, `Unauthorized request`);

    let verified: any = verify(token, config.TOKEN_SECRET);

    if (!verified) return handleResponse(res, 401, false, `Unauthorized request`);

    return handleResponse(res, 200, true, `Authorized`, verified);

}



export const updateProfile = async (req: Request, res: Response) => {
    let { postalCode, lga, state, address, avatar } = req.body;

    let { id } = req.user;

    const profile = await Profile.findOne({ where: { id } })

    if (!profile?.verified) return errorResponse(res, "Verify your bvn")

    await profile?.update({
        lga: lga ?? profile.lga,
        avatar: avatar ?? profile.avatar,
        state: state ?? profile.state,
        address: address ?? profile.address,
    })

    const updated = await Profile.findOne({ where: { id } })

    return successResponse(res, "Updated Successfully", updated)
}



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




export const sendOtp = async (req: Request, res: Response) => {
    const { email, phone, type } = req.body;
    const codeEmail = String(Math.floor(1000 + Math.random() * 9000));
    const codeSms = String(Math.floor(1000 + Math.random() * 9000));
    let emailSendStatus;
    let smsSendStatus;

    try {
        if (type === VerificationType.EMAIL || type === VerificationType.BOTH) {
            const verifyEmailRecord = await Verify.create({
                contact: email,
                code: codeEmail,
                type: VerificationType.EMAIL,
            })

            const verifyEmailMsg = sendOTPEmail(codeEmail);

            const messageId = await sendEmail(
                email,
                verifyEmailMsg.title,
                verifyEmailMsg.body,
                'User'
            )

            emailSendStatus = Boolean(messageId);
        }


        if (type === VerificationType.SMS || type === VerificationType.BOTH) {
            const verifySmsRecord = await Verify.create({
                contact: phone,
                code: codeSms,
                type: VerificationType.SMS
            })

            const smsResult = await sendSMS(phone, codeSms.toString());

            smsSendStatus = smsResult.status
        }


        return successResponse(res, 'OTP sent successfully', { emailSendStatus, smsSendStatus })
    } catch (error: any) {
        return errorResponse(res, error.message, error)
    }
};

export const sendSMSTest = async (req: Request, res: Response) => {
    const { phone } = req.body;

    // try {
    const status = await sendSMS(phone, '123456')

    return successResponse(res, 'OTP sent successfully', { smsSendStatus: status })
    // } catch (error) {
    //     return errorResponse(res, 'error', error);
    // }
}

export const sendEmailTest = async (req: Request, res: Response) => {
    const { email } = req.body;

    // try {
    const verifyEmailMsg = sendOTPEmail('123456');

    const messageId = await sendEmail(
        email,
        verifyEmailMsg.title,
        verifyEmailMsg.body,
        'User'
    )

    let emailSendStatus = Boolean(messageId);

    return successResponse(res, 'OTP sent successfully', { emailSendStatus })
    // } catch (error) {
    //     return errorResponse(res, 'error', error);
}



export const verifyOtp = async (req: Request, res: Response) => {
    const { smsCode, emailCode }:
        { smsCode: { phone: string, code: string } | null, emailCode: { email: string, code: string } | null }
        = req.body;

    // try {
    if (emailCode) {

        const verifyEmail = await Verify.findOne({
            where: {
                code: emailCode.code,
                contact: emailCode.email,
            }
        })

        if (!verifyEmail) return errorResponse(res, 'Invalid Email Code', null);

        if (verifyEmail.verified) return errorResponse(res, 'Email Code already verified');

        if (verifyEmail.createdAt < new Date(Date.now() - config.OTP_EXPIRY_TIME * 60 * 1000))
            return errorResponse(res, 'Email Code expired', null);

        await verifyEmail.update({ verified: true })

        await verifyEmail.save();
    }


    if (smsCode) {
        const verifySms = await Verify.findOne({
            where: {
                code: smsCode.code,
                contact: smsCode.phone,
            }
        })

        if (!verifySms) return errorResponse(res, 'Invalid SMS Code', null);

        if (verifySms.verified) return errorResponse(res, 'SMS Code already verified');

        if (verifySms.createdAt < new Date(Date.now() - config.OTP_EXPIRY_TIME * 60 * 1000))
            return errorResponse(res, 'SMS Code expired', null);

        await verifySms.update({ verified: true })

        await verifySms.save();
    }

    return successResponse(res, 'success', 'Both codes verified successfully');
    // } catch (error: any) {
    //     return errorResponse(res, 'error', error.message);

    // }
}




export const register = async (req: Request, res: Response): Promise<any> => {
    const { email, phone, password, confirmPassword, role, firstName, lastName, lga, bvn, state, address, avatar } = req.body;

    if (!email || !phone || !password || !confirmPassword || !role || !firstName || !lastName || !lga || !bvn || !state || !address || !avatar)
        return handleResponse(res, 404, false, "All fields are required");

    if (password !== confirmPassword) return handleResponse(res, 404, false, "Password do not match");

    try {
        if (!validateEmail(email)) return handleResponse(res, 404, false, "Enter a valid email");

        if (!validatePhone(phone)) return handleResponse(res, 404, false, "Enter a valid phone number");

        const verifiedEmail = await Verify.findOne({
            where: { contact: email, verified: true }
        });

        if (!verifiedEmail) return handleResponse(res, 404, false, "Email not verified");

        const verifiedPhone = await Verify.findOne({
            where: { contact: phone, verified: true }
        })

        if (!verifiedPhone) return handleResponse(res, 404, false, "Phone not verified");

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            email,
            phone,
            password: hashedPassword,
            role,
        })

        const profile = await Profile.create({
            userId: user.id,
            firstName,
            lastName,
            lga,
            state,
            address,
            role,
            avatar,
            bvn
        })

        const wallet = await Wallet.create({
            userId: user.id,
            balance: 0,
        })

        user.password = null;
        wallet.pin = null;

        user.setDataValue('profile', profile);
        user.setDataValue('wallet', wallet);

        let token = sign({ id: user.id, email: user.email, role: user.role }, config.TOKEN_SECRET);

        let regEmail = registerEmail(user);

        let messageId = await sendEmail(
            email,
            regEmail.title,
            regEmail.body,
            'User'
        )

        let emailSendStatus = Boolean(messageId);



        return successResponse(res, "success", { user, token, emailSendStatus });
    } catch (error: any) {
        return errorResponse(res, 'error', { message: error.message, error });
    }
}

export const registerCorperate = async (req: Request, res: Response): Promise<any> => {
    const { email, phone, password, confirmPassword, role = 'corperate', firstName, lastName, cooperation } = req.body;


    if (!email || !phone || !password || !confirmPassword || !role || !firstName || !lastName || !cooperation)
        return handleResponse(res, 404, false, "All fields are required");

    if (password !== confirmPassword) return handleResponse(res, 404, false, "Password do not match");

    if (!validateEmail(email)) return handleResponse(res, 404, false, "Enter a valid email");

    if (!validatePhone(phone)) return handleResponse(res, 404, false, "Enter a valid phone number");

    const verifiedEmail = await Verify.findOne({
        where: { contact: email, verified: true }
    });

    if (!verifiedEmail) return handleResponse(res, 404, false, "Email not verified");

    const verifiedPhone = await Verify.findOne({
        where: { contact: phone, verified: true }
    })

    if (!verifiedPhone) return handleResponse(res, 404, false, "Phone not verified");

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        email,
        phone,
        password: hashedPassword,
        role,
    })

    const profile = await Profile.create({
        avatar: cooperation.avatar,
        userId: user.id,
        firstName,
        lastName
    })

    const newCooperation = await Cooperation.create({
        avatar: cooperation.avatar,
        nameOfOrg: cooperation.nameOfOrg,
        phone: cooperation.phone,
        address: cooperation.address,
        state: cooperation.state,
        lga: cooperation.lga,
        regNum: cooperation.regNum,
        noOfEmployees: cooperation.noOfEmployees,
        profileId: profile.id
    })

    const newDirector = await Director.create({
            firstName: cooperation.director.firstName,
            lastName:cooperation.director.lastName,
            email:cooperation.director.email,
            phone:cooperation.director.phone,
            address:cooperation.director.address,
            state:cooperation.director.state,
            lga: cooperation.director.lga,
            bvn:cooperation.director.bvn,
            cooperateId: newCooperation.id
    })

    const wallet = await Wallet.create({
        userId: user.id,
        balance: 0,
    })

    user.password = null
    wallet.pin = null
    
    user.setDataValue('profile', profile);
    user.setDataValue('wallet', wallet);

    let token = sign({ id: user.id, email: user.email, role: user.role }, config.TOKEN_SECRET);

    let regEmail = registerEmail(user);

    let messageId = await sendEmail(
        email,
        regEmail.title,
        regEmail.body,
        'User'
    )

    let emailSendStatus = Boolean(messageId);



    return successResponse(res, "success", { user, token, emailSendStatus });
}



export const passwordChange = async (req: Request, res: Response) => {
    let { password, confirmPassword } = req.body;
    const { id } = req.user;
    if (password !== confirmPassword) return errorResponse(res, "Password do not match", { status: false, message: "Password do not match" })

    const user = await User.findOne({ where: { id } })
    if (!user) return errorResponse(res, "Failed", { status: false, message: "User does not exist" })

    hash(password, saltRounds, async function (err, hashedPassword) {
        await user.update({ password: hashedPassword })
        return successResponse(res, "Password changed successfully")
    })
}




export const login = async (req: Request, res: Response) => {
    let { email, password, fcmToken } = req.body;

    try {
        const user = await User.findOne({ where: { email } })

        if (!user) return handleResponse(res, 404, false, "User does not exist")

        const match = await compare(password, user.password || '')

        if (!match) return handleResponse(res, 404, false, "Invalid Credentials")

        let token = sign({ id: user.id, email: user.email, role: user.role }, config.TOKEN_SECRET);

        // const chatToken = serverClient.createToken(`${String(user.id)}`);

        const profile = await Profile.findOne({ where: { userId: user.id } })

        await profile?.update({ fcmToken })

        let userData: any;

        if (user.role == UserRole.CLIENT) {
            userData = await User.findOne({
                where: { id: user.id },
                attributes: { exclude: ['password'] },
                include: [{
                    model: Wallet,
                    attributes: { exclude: ['password'] },
                }, {
                    model: Profile,
                }]
            })
        } else if (user.role == UserRole.PROFESSIONAL) {
            userData = await User.findOne({
                where: { id: user.id },
                attributes: { exclude: ['password'] },
                include: [{
                    model: Wallet,
                    attributes: { exclude: ['password'] },
                }, {
                    model: Profile,
                    include: [{
                        model: Professional,
                        include: [{
                            model: Profession,
                            include: [Sector]
                        }]
                    }]
                }, {
                    model: Review
                }]
            })
        } else {
            userData = await User.findOne({
                where: { id: user.id },
                attributes: { exclude: ['password'] },
                include: [{
                    model: Wallet,
                    attributes: { exclude: ['password'] },
                }, {
                    model: Profile,
                    include: [{
                        model: Cooperation,
                        include: [Director]
                    }]
                }, {
                    model: Review
                }]
            })
        }


        return successResponse(res, "Successful", { status: true, user: userData, token })

    } catch (error: any) {
        return errorResponse(res, 'error', error.message);
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
}




export const deleteUsers = async (req: Request, res: Response) => {
    const user = await User.findAll({})
    let index = 0
    for (let value of user) {
        await value.destroy()
        index++
    }
    if (index == user.length) {
        return successResponse(res, "Successful")
    }
}



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



export const corperateReg = async (req: Request, res: Response) => {
    let { nameOfOrg, phone, address, state, lga, postalCode, regNum, noOfEmployees } = req.body;
    let { id } = req.user;
    const user = await User.findOne({ where: { id } });
    const corperate = await Cooperation.findOne({ where: { userId: id } });
    if (corperate) return errorResponse(res, "Failed", { status: false, message: "Coorperate Account Already Exist" })
    const profile = await Profile.findOne({ where: { userId: id } });
    const coorperateCreate = await Cooperation.create({
        nameOfOrg, phone, address, state, lga, postalCode, regNum, noOfEmployees, profileId: profile?.id,
        userId: id
    })
    // const prof = await Professional.findOne({ where: { userId: id } })
    // await profile?.update({ corperate: true, fullName: nameOfOrg })
    // await prof?.update({ corperateId: coorperateCreate.id })
    // await user?.update({ state: UserState.VERIFIED })
    // successResponse(res, "Successful", coorperateCreate)
}




export const swithAccount = async (req: Request, res: Response) => {
    let { id } = req.user;
    let { type } = req.query;
    const profile = await Profile.findOne({ where: { userId: id } });
    if (type == ProfileType.CLIENT) {
        await profile?.update({ type: ProfileType.CLIENT })
        return successResponse(res, "Successful")
    } else {
        if (profile?.corperate == null) {
            return successResponseFalse(res, "Completed Proffesional account setup")
        } else {
            await profile?.update({ type: ProfileType.PROFESSIONAL })
            return successResponse(res, "Successful")
        }
    }
}




export const updateFcmToken = async (req: Request, res: Response) => {
    let { token } = req.body;
    let { id } = req.user;
    const user = await User.findOne({ where: { id } });
    await user?.update({ fcmToken: token })
    successResponse(res, "Successful", token)
}







export const changePassword = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        hash(password, saltRounds, async function (err, hashedPassword) {

            const user = await User.findOne({ where: { email: email } });

            user?.update({ password: hashedPassword })

            return successResponse(res, "Password Changed Successfully")
        });
    } catch (error) {
        return errorResponse(res, "Failed", { status: false, message: "Error changing password" })
    }
};



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




export const postlocationData = async (req: Request, res: Response) => {

    const { lan, log, address } = req.body;
    const { id } = req.user;

    try {
        const getlocation = await LanLog.findOne({
            where: {
                userId: id
            }
        });
        const user = await User.findOne({
            where: {
                id
            }
        });
        if (getlocation) {
            const location = await getlocation.update({
                latitude: lan ?? getlocation.latitude, longitude: log ?? getlocation.longitude,
                userId: id, address: address ?? getlocation.address,
                coordinates: { type: 'Point', coordinates: [lan ?? getlocation.latitude, log ?? getlocation.longitude] },
            })
            if (location) return successResponse(res, "Updated Successfully", location);
            return errorResponse(res, "Failed updating Location");
        } else {
            const insertData = {
                latitude: lan, longitude: log, userId: id, address,
                coordinates: { type: 'Point', coordinates: [lan, log] },
            }
            const location = await LanLog.create(insertData);
            await user?.update({ locationId: location.id })
            if (location) return successResponse(res, "Created Successfully", location);
            return errorResponse(res, "Failed Creating Location");
        }

    } catch (error) {
        console.log(error);
        return errorResponse(res, `An error occurred - ${error}`);
    }
}



export const verifyMyBvn = async (req: Request, res: Response) => {
    let { bvn } = req.body;
    try {
        let result = await verifyBvn(bvn);

        let verifyStatus = result

        return successResponse(res, "BVN verified successfully", verifyStatus);
    } catch (error) {
        return errorResponse(res, "BVN verification failed", error);
    }
}




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
