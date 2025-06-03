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
exports.payforJob = exports.generateInvoice = exports.respondToJob = exports.createJobOrder = exports.getJobById = exports.getJobs = exports.testApi = void 0;
const modules_1 = require("../utils/modules");
const crypto_1 = require("crypto");
const Models_1 = require("../models/Models");
const enum_1 = require("../enum");
const gmail_1 = require("../services/gmail");
const messages_1 = require("../utils/messages");
const query_1 = require("../validation/query");
const body_1 = require("../validation/body");
const param_1 = require("../validation/param");
const testApi = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, modules_1.successResponse)(res, "success", "Your Api is working!");
});
exports.testApi = testApi;
const getJobs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { id, role } = req.user;
    const result = query_1.jobStatusQuerySchema.safeParse(req.query);
    if (!result.success) {
        return res.status(400).json({ error: "Invalid query", issues: result.error.format() });
    }
    let whereCondition;
    if (role === enum_1.UserRole.CLIENT) {
        whereCondition = { clientId: id };
    }
    else {
        whereCondition = { professionalId: id };
    }
    if (result.data.status) {
        whereCondition = Object.assign(Object.assign({}, whereCondition), { status: result.data.status });
    }
    try {
        const jobs = yield Models_1.Job.findAll({
            where: whereCondition,
        });
        return (0, modules_1.successResponse)(res, "success", jobs);
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, "error", error);
    }
});
exports.getJobs = getJobs;
const getJobById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { id } = req.params;
    try {
        const jobs = yield Models_1.Job.findOne({
            where: { id },
            include: [Models_1.Material]
        });
        return (0, modules_1.successResponse)(res, "success", jobs);
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, 'error', error.message);
    }
});
exports.getJobById = getJobById;
const createJobOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const result = body_1.jobPostSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            error: "Invalid input",
            issues: result.error.format(),
        });
    }
    const validatedData = result.data;
    const professional = yield Models_1.User.findOne({
        where: { id: validatedData.professionalId },
        include: [Models_1.Profile]
    });
    if (!professional) {
        return (0, modules_1.handleResponse)(res, 404, false, 'User not found');
    }
    if (professional.role !== enum_1.UserRole.PROFESSIONAL) {
        return (0, modules_1.handleResponse)(res, 401, false, 'User is not a professional');
    }
    ;
    const client = yield Models_1.User.findOne({
        where: { id: id },
        include: [Models_1.Profile]
    });
    const job = yield Models_1.Job.create({
        title: validatedData.title,
        description: validatedData.description,
        fullAddress: validatedData.address,
        numOfJobs: validatedData.numOfJobs || 1,
        mode: validatedData.mode || enum_1.JobMode.PHYSICAL,
        professionalId: validatedData.professionalId,
        clientId: id,
    });
    const jobResponse = Object.assign({}, job.dataValues);
    job.setDataValue('client', client);
    job.setDataValue('professional', professional);
    const updatedProfessionalProfile = yield Models_1.Profile.update({
        pending: professional.profile.totalJobsPending + 1,
    }, {
        where: { id: professional.profile.id },
    });
    const updatedClientProfile = yield Models_1.Profile.update({
        totalJobsPending: ((client === null || client === void 0 ? void 0 : client.profile.totalJobsPending) || 0) + 1,
    }, {
        where: { id: client === null || client === void 0 ? void 0 : client.profile.id }
    });
    //send an email to the prof
    const msgStat = yield (0, gmail_1.sendEmail)(job.dataValues.professional.email, (0, messages_1.jobCreatedEmail)(job.dataValues).title, (0, messages_1.jobCreatedEmail)(job.dataValues).body, job.dataValues.professional.profile.firstName + ' ' + job.dataValues.professional.profile.lastName);
    //send notification to the prof
    return (0, modules_1.successResponse)(res, "Successful", { jobResponse, emailSendId: msgStat.messageId });
});
exports.createJobOrder = createJobOrder;
const respondToJob = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = param_1.jobIdParamSchema.safeParse(req.params);
    if (!result.success) {
        return res.status(400).json({
            error: "Invalid route parameter",
            issues: result.error.format(),
        });
    }
    const jobId = parseInt(result.data.jobId, 10);
    const { accepted } = req.body;
    try {
        const job = yield Models_1.Job.findByPk(jobId);
        if (!job) {
            return (0, modules_1.handleResponse)(res, 404, false, 'Job not found');
        }
        yield job.update({
            accepted,
        });
        job.save();
        const professional = yield Models_1.User.findOne({
            where: { id: job.professionalId },
            include: [Models_1.Profile]
        });
        const client = yield Models_1.User.findOne({
            where: { id: job.clientId },
            include: [Models_1.Profile]
        });
        job.setDataValue('client', client);
        job.setDataValue('professional', professional);
        // console.log('prof email', job.dataValues.prof.email);
        // console.log('prof name', job.dataValues.prof.profile.fullName);
        //send an email to the prof
        const msgStat = yield (0, gmail_1.sendEmail)(job.dataValues.client.email, (0, messages_1.jobResponseEmail)(job.dataValues).title, (0, messages_1.jobResponseEmail)(job.dataValues).body, job.dataValues.client.profile.firstName + ' ' + job.dataValues.client.profile.lastName
        //'User'
        );
        return (0, modules_1.successResponse)(res, 'success', { message: 'Job respsonse updated', emailSendstatus: Boolean(msgStat.messageId) });
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, 'error', error);
    }
});
exports.respondToJob = respondToJob;
const generateInvoice = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = body_1.jobCostingSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            error: "Invalid input",
            issues: result.error.format(),
        });
    }
    const { jobId, durationUnit, durationValue, workmanship, materials } = result.data;
    try {
        const job = yield Models_1.Job.findByPk(jobId);
        if (!job) {
            return (0, modules_1.handleResponse)(res, 404, false, 'Job not found');
        }
        yield job.update({
            durationUnit,
            durationValue,
            workmanship,
        });
        if (materials) {
            const newMat = materials.map((mat) => {
                return Object.assign(Object.assign({}, mat), { subTotal: mat.price * mat.quantity, jobId });
            });
            job.isMaterial = true;
            job.materials = materials.reduce((acc, mat) => acc + mat.price * mat.quantity, 0);
            const mats = yield Models_1.Material.bulkCreate(Object.assign(newMat));
            yield job.save();
            //Send notification to the client
            return (0, modules_1.successResponse)(res, 'success', { message: 'Invoice generated' });
        }
        yield job.save();
        return (0, modules_1.successResponse)(res, 'success', { message: 'Job updated' });
    }
    catch (err) {
        return (0, modules_1.errorResponse)(res, 'error', err.message);
    }
});
exports.generateInvoice = generateInvoice;
const payforJob = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const result = body_1.paymentSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            error: "Invalid input",
            issues: result.error.format(),
        });
    }
    const { amount, paidFor, pin, jobId } = result.data;
    //try {
    const job = yield Models_1.Job.findByPk(jobId);
    if (!job) {
        return (0, modules_1.handleResponse)(res, 404, false, 'Job not found');
    }
    if (job.payStatus === enum_1.PayStatus.PAID) {
        return (0, modules_1.handleResponse)(res, 400, false, 'Job has already been paid for');
    }
    let response;
    // try {
    //     response = await axios.post(`${config.PAYMENT_BASE_URL}/pay-api/debit-wallet`, {
    //         amount,
    //         pin,
    //         reason: 'job payment',
    //         jobId
    //     }, {
    //         headers: {
    //             Authorization: req.headers.authorization,
    //         }
    //     });
    // } catch (error: any) {
    //     // axios error - get meaningful message from backend
    //     const errData = error.response?.data || {};
    //     const errMessage = errData.message || error.message || 'Payment failed';
    //     return handleResponse(res, 400, false, errMessage, errData.data);
    // }
    //if (response.data.status) {
    job.payStatus = enum_1.PayStatus.PAID;
    job.paidFor = paidFor;
    job.paymentRef = (0, crypto_1.randomUUID)();
    job.status = enum_1.JobStatus.ONGOING;
    yield job.save();
    if (job.payStatus === enum_1.PayStatus.PAID) {
        const updatedProfessionalProfile = yield Models_1.Profile.update({
            totalJobsOngoing: (job.professional.profile.totalJobsOngoing || 0) + 1,
        }, {
            where: { userId: job.professionalId }
        });
        const updatedClientProfile = yield Models_1.Profile.update({
            totalJobsOngoing: (job.professional.profile.totalJobsOngoing || 0) + 1,
        }, {
            where: { userId: job.clientId }
        });
    }
    return (0, modules_1.successResponse)(res, 'success', { message: 'Job payment successful' });
    //   }
    //return handleResponse(res, 400, false, 'Payment failed', response.data.data);
    // } catch (error: any) {
    //     return errorResponse(res, 'error', { message: error.message, error });
    // }
});
exports.payforJob = payforJob;
// export const completeJob = async (req: Request, res: Response) => {
//     const { jobId } = req.params;
//     try {
//         const job = await Job.findByPk(jobId)
//         if (!job) {
//             return handleResponse(res, 404, false, 'Job does not exist');
//         }
//         job.status = JobStatus.COMPLETED
//         await job.save()
//         const updateUserProfile = await axios.post(`${config.AUTH_BASE_URL}/api/profiles/update-metrics/${job.profId}`,
//             {
//                 payload: [
//                     { field: 'ongoing', action: 'decrement' },
//                     { field: 'completed', action: 'increment' },
//                 ]
//             },
//             {
//                 headers: {
//                     Authorization: req.headers.authorization,
//                 }
//             }
//         )
//         const updateOwnerProfile = await axios.post(`${config.AUTH_BASE_URL}/api/profiles/update-metrics/${job.clientId}`,
//             {
//                 payload: [
//                     { field: 'ongoing', action: 'decrement' },
//                     { field: 'completed', action: 'increment' },
//                 ]
//             },
//             {
//                 headers: {
//                     Authorization: req.headers.authorization,
//                 }
//             }
//         )
//         return successResponse(res, 'success', 'Job completed sucessfully')
//     } catch (error: any) {
//         return errorResponse(res, 'error', error.message)
//     }
// }
// export const approveJob = async (req: Request, res: Response) => {
//     const { jobId } = req.params;
//     try {
//         const job = await Job.findByPk(jobId)
//         if (!job) {
//             return handleResponse(res, 404, false, 'Job does not exist');
//         }
//         if (job.status !== JobStatus.COMPLETED) {
//             return handleResponse(res, 404, false, `You cannot approve a/an ${job.status} job`)
//         }
//         job.status = JobStatus.APPROVED;
//         await job.save()
//         const updateProfProfile = await axios.post(`${config.AUTH_BASE_URL}/api/profiles/update-metrics/${job.profId}`,
//             {
//                 payload: [
//                     { field: 'completed', action: 'decrement' },
//                     { field: 'approved', action: 'increment' },
//                 ]
//             },
//             {
//                 headers: {
//                     Authorization: req.headers.authorization,
//                 }
//             }
//         )
//         const updateClientProfile = await axios.post(`${config.AUTH_BASE_URL}/api/profiles/update-metrics/${job.clientId}`,
//             {
//                 payload: [
//                     { field: 'completed', action: 'decrement' },
//                     { field: 'approved', action: 'increment' },
//                 ]
//             },
//             {
//                 headers: {
//                     Authorization: req.headers.authorization,
//                 }
//             }
//         )
//         //credit job client
//         const walletResponse = await axios.post(`${config.PAYMENT_BASE_URL}/pay-api/credit-wallet`,
//             {
//                 amount: job.workmanship,
//                 userId: job.profId,
//             },
//             {
//                 headers: {
//                     Authorization: req.headers.authorization
//                 }
//             }
//         )
//         return successResponse(res, 'success', 'Job approved sucessfully')
//     } catch (error: any) {
//         return errorResponse(res, 'error', error.message)
//     }
// }
// export const disputeJob = async (req: Request, res: Response) => {
//     const jobId = req.params.jobId;
//     const { reason, description } = req.body;
//     try {
//         const job = await Job.findByPk(jobId);
//         if (!job) {
//             return handleResponse(res, 404, false, 'Job does not exist');
//         }
//         if (job.status !== JobStatus.COMPLETED) {
//             return handleResponse(res, 404, false, `You cannot dispute a/an ${job.status} job`)
//         }
//         job.status = JobStatus.DISPUTED;
//         await job.save()
//         const profResponse = await axios.get(`${config.AUTH_BASE_URL}/api/users/${job.profId}`, {
//             headers: {
//                 Authorization: req.headers.authorization,
//             },
//         });
//         const prof = profResponse.data.data;
//         job.setDataValue('prof', prof);
//         const updateUserProfile = await axios.post(`${config.AUTH_BASE_URL}/api/profiles/update-metrics/${job.profId}`,
//             {
//                 payload: [
//                     { field: 'completed', action: 'decrement' },
//                     { field: 'disputed', action: 'increment' },
//                 ]
//             },
//             {
//                 headers: {
//                     Authorization: req.headers.authorization,
//                 }
//             }
//         )
//         const updateOwnerProfile = await axios.post(`${config.AUTH_BASE_URL}/api/profiles/update-metrics/${job.clientId}`,
//             {
//                 payload: [
//                     { field: 'completed', action: 'decrement' },
//                     { field: 'disputed', action: 'increment' },
//                 ]
//             },
//             {
//                 headers: {
//                     Authorization: req.headers.authorization,
//                 }
//             }
//         )
//         const dispute = await Dispute.create({
//             reason,
//             description,
//             jobId: jobId,
//             reporterId: job.profId,
//             partnerId: job.clientId,
//         })
//         const msgStat = await sendEmail(
//             job.dataValues.prof.email,
//             jobDisputeEmail(job.dataValues, dispute).subject,
//             jobDisputeEmail(job.dataValues, dispute).text,
//             job.dataValues.prof.profile.fullName
//         )
//         return successResponse(res, 'success', { dispute, emailSendId: msgStat.messageId })
//     } catch (error: any) {
//         return errorResponse(res, 'error', error.message)
//     }
// }
