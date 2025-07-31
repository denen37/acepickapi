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
exports.disputeJob = exports.approveJob = exports.completeJob = exports.viewInvoice = exports.updateInvoice = exports.generateInvoice = exports.respondToJob = exports.cancelJob = exports.updateJob = exports.createJobOrder = exports.getJobById = exports.getLatestJob = exports.getJobStat = exports.getJobs = exports.testApi = void 0;
const modules_1 = require("../utils/modules");
const Models_1 = require("../models/Models");
const enum_1 = require("../utils/enum");
const gmail_1 = require("../services/gmail");
const messages_1 = require("../utils/messages");
const query_1 = require("../validation/query");
const body_1 = require("../validation/body");
const param_1 = require("../validation/param");
const notification_1 = require("../services/notification");
const chat_1 = require("../chat");
const events_1 = require("../utils/events");
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
            include: [
                role === enum_1.UserRole.PROFESSIONAL ? {
                    model: Models_1.User,
                    attributes: ['id', 'email', 'phone', 'fcmToken'],
                    as: 'client',
                    include: [
                        {
                            model: Models_1.Profile,
                            attributes: ['id', 'firstName', 'lastName', 'avatar']
                        }
                    ]
                } : {
                    model: Models_1.User,
                    as: 'professional',
                    attributes: ['id', 'email', 'phone', 'fcmToken'],
                    include: [
                        {
                            model: Models_1.Profile,
                            attributes: ['id', 'firstName', 'lastName', 'avatar'],
                            include: [{
                                    model: Models_1.Professional,
                                    attributes: ['id']
                                }]
                        }
                    ]
                },
                {
                    model: Models_1.Material
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        return (0, modules_1.successResponse)(res, "success", jobs);
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, "error", error);
    }
});
exports.getJobs = getJobs;
const getJobStat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { id, role } = req.user;
    try {
        // const jobStats = await Job.findAll({
        //     where: { [role === UserRole.CLIENT ? 'clientId' : 'professionalId']: id },
        //     attributes: [
        //         [sequelize.fn('COUNT', sequelize.col('id')), 'totalJobs'],
        //         [sequelize.fn('SUM', sequelize.col('price')), 'totalEarnings'],
        //         [sequelize.fn('AVG', sequelize.col('price')), 'averageEarnings'],
        //     ],
        //     raw: true
        // });
        //totalJobs
        //totalExpense
        //totalJobsDeclined
        //totalJobsOngoing
        //totalJobsPending
        //totalJobsCompleted
        //totalJobsApproved
        //totalJobsCanceled
        //totalDisputes
        //totalEarning!: number;
        //completedAmount
        //pendingAmount
        //pendingAmount
        //rejectedAmount
        //availableWithdrawalAmount
        // return successResponse(res, "success", jobStats);
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, "error", error);
    }
});
exports.getJobStat = getJobStat;
const getLatestJob = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { id, role } = req.user;
    let whereCondition;
    if (role === enum_1.UserRole.CLIENT) {
        whereCondition = { clientId: id };
    }
    else {
        whereCondition = { professionalId: id };
    }
    try {
        const job = yield Models_1.Job.findOne({
            where: Object.assign(Object.assign({}, whereCondition), { status: enum_1.JobStatus.PENDING, accepted: false }),
            order: [['createdAt', 'DESC']],
            include: [Models_1.Material]
        });
        if (!job) {
            return (0, modules_1.handleResponse)(res, 404, false, 'No job found');
        }
        return (0, modules_1.successResponse)(res, "success", job);
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, "error", error);
    }
});
exports.getLatestJob = getLatestJob;
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
    console.log('notification token', job.dataValues.professional.fcmToken);
    if (job.dataValues.professional.fcmToken) {
        yield (0, notification_1.sendPushNotification)(job.dataValues.professional.fcmToken, 'New job created', `A new job has been created: ${job.dataValues.title}`, {});
    }
    let onlineUser = yield Models_1.OnlineUser.findOne({
        where: { userId: job.dataValues.professionalId }
    });
    const io = (0, chat_1.getIO)();
    if (onlineUser === null || onlineUser === void 0 ? void 0 : onlineUser.isOnline) {
        io.to(onlineUser === null || onlineUser === void 0 ? void 0 : onlineUser.socketId).emit(events_1.Emit.JOB_CREATED, { text: 'This a new Job', data: job });
    }
    return (0, modules_1.successResponse)(res, "Successful", { jobResponse, emailSendId: msgStat.messageId });
});
exports.createJobOrder = createJobOrder;
const updateJob = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = body_1.jobUpdateSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                error: "Invalid route parameter",
                issues: result.error.format(),
            });
        }
        const job = yield Models_1.Job.findByPk(result.data.jobId, {
            include: [
                {
                    model: Models_1.User,
                    as: 'professional',
                    include: [Models_1.Profile]
                }, {
                    model: Models_1.User,
                    as: 'client',
                    include: [Models_1.Profile]
                }
            ]
        });
        if (!job) {
            return (0, modules_1.handleResponse)(res, 404, false, "Job not found");
        }
        if (job.accepted) {
            return (0, modules_1.handleResponse)(res, 404, false, "Job already accepted");
        }
        yield job.update(result.data);
        //send email to professional
        const emailToSend = yield (0, messages_1.jobUpdatedEmail)(job.dataValues);
        const msgId = yield (0, gmail_1.sendEmail)(job.professional.email, emailToSend.title, emailToSend.body, job.professional.profile.firstName);
        if (job.professional.fcmToken) {
            yield (0, notification_1.sendPushNotification)(job.dataValues.client.fcmToken, 'Job Updated', `Your job has been updated by ${job.dataValues.professional.profile.firstName} ${job.dataValues.professional.profile.lastName}`, {});
        }
        let onlineUser = yield Models_1.OnlineUser.findOne({
            where: { userId: job.dataValues.professionalId }
        });
        const io = (0, chat_1.getIO)();
        if (onlineUser === null || onlineUser === void 0 ? void 0 : onlineUser.isOnline) {
            io.to(onlineUser === null || onlineUser === void 0 ? void 0 : onlineUser.socketId).emit(events_1.Emit.JOB_UPDATED, { text: 'Your job has been updated', data: job });
        }
        return (0, modules_1.successResponse)(res, "Successful", { job });
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, 'error', "Error updating job");
    }
});
exports.updateJob = updateJob;
const cancelJob = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { jobId } = req.params;
    try {
        const job = yield Models_1.Job.findByPk(jobId, {
            include: [
                {
                    model: Models_1.User,
                    as: 'client',
                    include: [Models_1.Profile]
                }, {
                    model: Models_1.User,
                    as: 'professional',
                    include: [Models_1.Profile]
                }
            ]
        });
        if (!job) {
            return (0, modules_1.errorResponse)(res, 'error', "Job not found");
        }
        yield job.update({ status: enum_1.JobStatus.CANCELLED });
        // Send email to client
        const emailToSend = yield (0, messages_1.jobCancelledEmail)(job.dataValues);
        const msgId = yield (0, gmail_1.sendEmail)(job.professional.email, emailToSend.title, emailToSend.body, job.professional.profile.firstName);
        if (job.professional.fcmToken) {
            yield (0, notification_1.sendPushNotification)(job.dataValues.client.fcmToken, 'Job Cancelled', `Your job has been cancelled by ${job.dataValues.professional.profile.firstName} ${job.dataValues.professional.profile.lastName}`, {});
        }
        let onlineUser = yield Models_1.OnlineUser.findOne({
            where: { userId: job.dataValues.professionalId }
        });
        const io = (0, chat_1.getIO)();
        if (onlineUser === null || onlineUser === void 0 ? void 0 : onlineUser.isOnline) {
            io.to(onlineUser === null || onlineUser === void 0 ? void 0 : onlineUser.socketId).emit(events_1.Emit.JOB_CANCELLED, { text: 'Your job has been cancelled by client', data: job });
        }
        yield job.destroy();
        yield job.save();
        return (0, modules_1.successResponse)(res, 'success', "Job deleted successfully");
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, 'error', "Error cancelling job");
    }
});
exports.cancelJob = cancelJob;
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
        if (accepted) {
            job.status = enum_1.JobStatus.PENDING;
        }
        else {
            job.status = enum_1.JobStatus.REJECTED;
        }
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
        //send notification to the prof
        if (job.dataValues.client.fcmToken) {
            yield (0, notification_1.sendPushNotification)(job.dataValues.client.fcmToken, 'Job response', `Your job has been ${accepted ? 'accepted' : 'rejected'} by the professional: ${job.dataValues.professional.profile.firstName} ${job.dataValues.professional.profile.lastName}`, {});
        }
        let onlineUser = yield Models_1.OnlineUser.findOne({
            where: { userId: job.professionalId }
        });
        const io = (0, chat_1.getIO)();
        if (onlineUser === null || onlineUser === void 0 ? void 0 : onlineUser.isOnline) {
            io.to(onlineUser === null || onlineUser === void 0 ? void 0 : onlineUser.socketId).emit(events_1.Emit.JOB_RESPONSE, { text: `$Your Job has been ${accepted ? 'accepted' : 'rejected'}`, data: job });
        }
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
        const job = yield Models_1.Job.findByPk(jobId, {
            include: [
                {
                    model: Models_1.User,
                    as: 'client'
                },
                {
                    model: Models_1.User,
                    as: 'professional',
                    include: [Models_1.Profile]
                }
            ]
        });
        if (!job) {
            return (0, modules_1.handleResponse)(res, 404, false, 'Job not found');
        }
        if (job.workmanship) {
            return (0, modules_1.handleResponse)(res, 400, false, 'Invoice already generated');
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
            job.materialsCost = materials.reduce((acc, mat) => acc + mat.price * mat.quantity, 0);
            const mats = yield Models_1.Material.bulkCreate(Object.assign(newMat));
            yield job.save();
            //send an email to the client
            const emailTosend = (0, messages_1.invoiceGeneratedEmail)(job.dataValues);
            const msgStat = yield (0, gmail_1.sendEmail)(job.dataValues.client.email, emailTosend.title, emailTosend.body, job.dataValues.client.profile.firstName + ' ' + job.dataValues.client.profile.lastName
            //'User'
            );
            //Send notification to the client
            if (job.dataValues.client.fcmToken) {
                yield (0, notification_1.sendPushNotification)(job.dataValues.client.fcmToken, 'Invoice generated', `An invoice has been generated for your job: ${job.dataValues.title}`, {});
            }
            let onlineUser = yield Models_1.OnlineUser.findOne({
                where: { userId: job.clientId }
            });
            const io = (0, chat_1.getIO)();
            if (onlineUser === null || onlineUser === void 0 ? void 0 : onlineUser.isOnline) {
                io.to(onlineUser === null || onlineUser === void 0 ? void 0 : onlineUser.socketId).emit(events_1.Emit.INVOICE_GENERATED, { text: `An invoice has been generated`, data: { job, materials } });
            }
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
const updateInvoice = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    const { jobId } = req.params;
    const result = body_1.jobCostingUpdateSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            error: "Invalid input",
            issues: result.error.format(),
        });
    }
    const { durationUnit, durationValue, workmanship, materials } = result.data;
    const job = yield Models_1.Job.findByPk(jobId, {
        include: [
            {
                model: Models_1.User,
                as: 'client'
            },
            {
                model: Models_1.User,
                as: 'professional',
                include: [Models_1.Profile]
            }
        ]
    });
    if (!job) {
        return (0, modules_1.handleResponse)(res, 404, false, 'Job not found');
    }
    if (job.payStatus === enum_1.PayStatus.PAID) {
        return (0, modules_1.handleResponse)(res, 404, false, 'Job has already been paid');
    }
    yield job.update({
        durationUnit,
        durationValue,
        workmanship
    });
    yield job.save();
    if (materials && materials.length > 0) {
        // Filter materials without id (new ones) for bulkCreate
        const newMaterials = materials.filter(material => !material.id);
        let created = [];
        if (newMaterials.length > 0) {
            created = yield Models_1.Material.bulkCreate(newMaterials.map(material => (Object.assign(Object.assign({}, material), { subTotal: material.price * material.quantity, jobId }))));
        }
        // Update existing materials
        const updatePromises = [];
        for (const mat of materials) {
            if (mat.id) {
                updatePromises.push(Models_1.Material.update(Object.assign(Object.assign({}, mat), { subTotal: mat.price * mat.quantity, jobId }), {
                    where: { id: mat.id }
                }));
            }
        }
        yield Promise.all(updatePromises);
        // Mark job as having materials and set total cost
        job.isMaterial = true;
        const allMaterials = yield Models_1.Material.findAll({ where: { jobId } });
        job.materialsCost = allMaterials.reduce((acc, mat) => acc + mat.price * mat.quantity, 0);
        job.materials = allMaterials;
        yield job.save();
        // Optional: assign created/updated materials to job
        //job.materials = [...created, ...materials.filter(mat => mat.id)];
    }
    const jobObj = job.toJSON();
    //send an email to the client
    const emailTosend = (0, messages_1.invoiceUpdatedEmail)(jobObj);
    const msgStat = yield (0, gmail_1.sendEmail)(job.client.email, emailTosend.title, emailTosend.body, (_e = ((_d = (_b = (_a = jobObj.client.profile) === null || _a === void 0 ? void 0 : _a.firstName) !== null && _b !== void 0 ? _b : '' + ' ' + ((_c = jobObj.client.profile) === null || _c === void 0 ? void 0 : _c.lastName)) !== null && _d !== void 0 ? _d : '').toString().trim()) !== null && _e !== void 0 ? _e : 'User'
    //'User'
    );
    //Send notification to the client
    if (job.dataValues.client.fcmToken) {
        yield (0, notification_1.sendPushNotification)(job.dataValues.client.fcmToken, 'Invoice Updated', `An invoice has been updated for your job: ${job.dataValues.title}`, {});
    }
    let onlineUser = yield Models_1.OnlineUser.findOne({
        where: { userId: job.clientId }
    });
    const io = (0, chat_1.getIO)();
    if (onlineUser === null || onlineUser === void 0 ? void 0 : onlineUser.isOnline) {
        io.to(onlineUser === null || onlineUser === void 0 ? void 0 : onlineUser.socketId).emit(events_1.Emit.INVOICE_UPDATED, { text: `An invoice has been updated`, data: { job } });
    }
    return (0, modules_1.successResponse)(res, 'success', { message: 'Job updated successfully', job });
});
exports.updateInvoice = updateInvoice;
const viewInvoice = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const { jobId } = req.params;
    try {
        const invoice = yield Models_1.Job.findByPk(jobId, {
            attributes: ['id', 'title', 'description', 'status', 'workmanship', 'materialsCost', 'createdAt', 'updatedAt'],
            include: [
                {
                    model: Models_1.Material
                }
            ]
        });
        return (0, modules_1.successResponse)(res, 'success', invoice);
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, 'error', error.message);
    }
});
exports.viewInvoice = viewInvoice;
// export const payforJob = async (req: Request, res: Response) => {
//     const { id } = req.user;
//     const result = paymentSchema.safeParse(req.body);
//     if (!result.success) {
//         return res.status(400).json({
//             error: "Invalid input",
//             issues: result.error.format(),
//         });
//     }
//     const { amount, paidFor, pin, jobId } = result.data;
//     try {
//         const job = await Job.findByPk(jobId);
//         if (!job) {
//             return handleResponse(res, 404, false, 'Job not found');
//         }
//         if (job.payStatus === PayStatus.PAID) {
//             return handleResponse(res, 400, false, 'Job has already been paid for')
//         }
//         // try {
//         //     response = await axios.post(`${config.PAYMENT_BASE_URL}/pay-api/debit-wallet`, {
//         //         amount,
//         //         pin,
//         //         reason: 'job payment',
//         //         jobId
//         //     }, {
//         //         headers: {
//         //             Authorization: req.headers.authorization,
//         //         }
//         //     });
//         // } catch (error: any) {
//         //     // axios error - get meaningful message from backend
//         //     const errData = error.response?.data || {};
//         //     const errMessage = errData.message || error.message || 'Payment failed';
//         //     return handleResponse(res, 400, false, errMessage, errData.data);
//         // }
//         //if (response.data.status) {
//         job.payStatus = PayStatus.PAID;
//         job.paymentRef = randomUUID();
//         job.status = JobStatus.ONGOING;
//         await job.save();
//         if (job.payStatus === PayStatus.PAID) {
//             const updatedProfessionalProfile = await Profile.update({
//                 totalJobsOngoing: (job.professional.profile.totalJobsOngoing || 0) + 1,
//             }, {
//                 where: { userId: job.professionalId }
//             })
//             const updatedClientProfile = await Profile.update({
//                 totalJobsOngoing: (job.professional.profile.totalJobsOngoing || 0) + 1,
//             }, {
//                 where: { userId: job.clientId }
//             })
//         }
//         return successResponse(res, 'success', { message: 'Job payment successful' });
//         //   }
//     } catch (error: any) {
//         return errorResponse(res, 'error', { message: error.message, error });
//     }
// };
const completeJob = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const { jobId } = req.params;
    try {
        const job = yield Models_1.Job.findOne({
            where: {
                id: jobId,
                //professionalId: req.user.id, 
                status: enum_1.JobStatus.ONGOING
            },
            include: [{
                    model: Models_1.User,
                    as: 'professional',
                    include: [Models_1.Profile]
                }, {
                    model: Models_1.User,
                    as: 'client',
                    include: [Models_1.Profile]
                }]
        });
        if (!job) {
            return (0, modules_1.handleResponse)(res, 404, false, 'Job does not exist / Job already completed');
        }
        job.status = enum_1.JobStatus.COMPLETED;
        yield job.save();
        job.professional.profile.totalJobsCompleted = (((_a = job.professional.profile) === null || _a === void 0 ? void 0 : _a.totalJobsCompleted) || 0) + 1;
        yield job.professional.profile.save();
        // }
        job.client.profile.totalJobsCompleted = (((_b = job.client.profile) === null || _b === void 0 ? void 0 : _b.totalJobsCompleted) || 0) + 1;
        yield ((_c = job.client.profile) === null || _c === void 0 ? void 0 : _c.save());
        //send an email to the client
        const emailTosend = (0, messages_1.completeJobEmail)(job.dataValues);
        const msgStat = yield (0, gmail_1.sendEmail)(job.dataValues.client.email, emailTosend.title, emailTosend.body, job.dataValues.client.profile.firstName + ' ' + job.dataValues.client.profile.lastName
        //'User'
        );
        //Send notification to the client
        if (job.dataValues.client.fcmToken) {
            yield (0, notification_1.sendPushNotification)(job.dataValues.client.fcmToken, 'Job Completed', `Your job on ${job.dataValues.title} has been completed by ${job.professional.profile.firstName} ${job.professional.profile.lastName}`, {});
        }
        let onlineUser = yield Models_1.OnlineUser.findOne({
            where: { userId: job.clientId }
        });
        const io = (0, chat_1.getIO)();
        if (onlineUser === null || onlineUser === void 0 ? void 0 : onlineUser.isOnline) {
            io.to(onlineUser === null || onlineUser === void 0 ? void 0 : onlineUser.socketId).emit(events_1.Emit.JOB_COMPLETED, { text: `Your job has completed`, data: { job } });
        }
        return (0, modules_1.successResponse)(res, 'success', { message: 'Job completed sucessfully', emailSendStatus: Boolean(msgStat) });
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, 'error', error.message);
    }
});
exports.completeJob = completeJob;
const approveJob = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const { jobId } = req.params;
    try {
        const job = yield Models_1.Job.findOne({
            where: {
                id: jobId,
                //clientId: req.user.id, 
                status: enum_1.JobStatus.COMPLETED
            },
            include: [{
                    model: Models_1.User,
                    as: 'professional',
                    include: [Models_1.Profile, Models_1.Wallet]
                }, {
                    model: Models_1.User,
                    as: 'client',
                    include: [Models_1.Profile]
                }]
        });
        if (!job) {
            return (0, modules_1.handleResponse)(res, 404, false, 'Job does not exist / Job already approved');
        }
        if (job.status !== enum_1.JobStatus.COMPLETED) {
            return (0, modules_1.handleResponse)(res, 404, false, `You cannot approve a/an ${job.status} job`);
        }
        job.status = enum_1.JobStatus.APPROVED;
        job.approved = true;
        yield job.save();
        job.professional.profile.totalJobsApproved = (((_a = job.professional.profile) === null || _a === void 0 ? void 0 : _a.totalJobsApproved) || 0) + 1;
        yield job.professional.profile.save();
        job.client.profile.totalJobsApproved = (((_b = job.client.profile) === null || _b === void 0 ? void 0 : _b.totalJobsApproved) || 0) + 1;
        yield ((_c = job.client.profile) === null || _c === void 0 ? void 0 : _c.save());
        if (job.professional.wallet) {
            job.professional.wallet.previousBalance = job.professional.wallet.currentBalance || 0;
            job.professional.wallet.currentBalance = (job.professional.wallet.currentBalance || 0) + job.workmanship + job.materialsCost;
            yield job.professional.wallet.save();
        }
        //send an email to the professional
        const emailTosend = (0, messages_1.approveJobEmail)(job.dataValues);
        const msgStat = yield (0, gmail_1.sendEmail)(job.dataValues.professional.email, emailTosend.title, emailTosend.body, job.dataValues.professional.profile.firstName + ' ' + job.dataValues.professional.profile.lastName
        //'User'
        );
        //Send notification to the professional
        if (job.dataValues.client.fcmToken) {
            yield (0, notification_1.sendPushNotification)(job.dataValues.professional.fcmToken, 'Job Approved', `Your job on ${job.dataValues.title} has been Approved by ${job.client.profile.firstName} ${job.client.profile.lastName}`, {});
        }
        let onlineUser = yield Models_1.OnlineUser.findOne({
            where: { userId: job.professionalId },
        });
        const io = (0, chat_1.getIO)();
        if (onlineUser === null || onlineUser === void 0 ? void 0 : onlineUser.isOnline) {
            io.to(onlineUser === null || onlineUser === void 0 ? void 0 : onlineUser.socketId).emit(events_1.Emit.JOB_APPROVED, { text: `Your job has approved`, data: { job } });
        }
        return (0, modules_1.successResponse)(res, 'success', { message: 'Job approved sucessfully', emailSendStatus: Boolean(msgStat) });
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, 'error', error.message);
    }
});
exports.approveJob = approveJob;
const disputeJob = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const jobId = req.params.jobId;
    const { reason, description } = req.body;
    try {
        const job = yield Models_1.Job.findOne({
            where: {
                id: jobId,
                //professionalId: req.user.id, 
                status: enum_1.JobStatus.COMPLETED
            },
            include: [{
                    model: Models_1.User,
                    as: 'professional',
                    include: [Models_1.Profile]
                }, {
                    model: Models_1.User,
                    as: 'client',
                    include: [Models_1.Profile]
                }]
        });
        if (!job) {
            return (0, modules_1.handleResponse)(res, 404, false, 'Job does not exist');
        }
        if (job.status !== enum_1.JobStatus.COMPLETED) {
            return (0, modules_1.handleResponse)(res, 404, false, `You cannot dispute a/an ${job.status} job`);
        }
        job.status = enum_1.JobStatus.DISPUTED;
        yield job.save();
        if (job.professional.profile) {
            job.professional.profile.totalDisputes = (((_a = job.professional.profile) === null || _a === void 0 ? void 0 : _a.totalDisputes) || 0) + 1;
            yield ((_b = job.professional.profile) === null || _b === void 0 ? void 0 : _b.save());
        }
        if (job.client.profile) {
            job.client.profile.totalDisputes = (((_c = job.client.profile) === null || _c === void 0 ? void 0 : _c.totalDisputes) || 0) + 1;
            yield ((_d = job.client.profile) === null || _d === void 0 ? void 0 : _d.save());
        }
        const dispute = yield Models_1.Dispute.create({
            reason,
            description,
            jobId: jobId,
            reporterId: job.professionalId,
            partnerId: job.clientId,
        });
        //send an email to the professional
        const emailTosend = (0, messages_1.disputedJobEmail)(job.dataValues, dispute);
        const msgStat = yield (0, gmail_1.sendEmail)(job.dataValues.professional.email, emailTosend.title, emailTosend.body, job.dataValues.professional.profile.firstName + ' ' + job.dataValues.professional.profile.lastName
        //'User'
        );
        //Send notification to the professional
        if (job.dataValues.client.fcmToken) {
            yield (0, notification_1.sendPushNotification)(job.dataValues.professional.fcmToken, 'Job Disputed', `Your job on ${job.dataValues.title} has been disputed by ${job.client.profile.firstName} ${job.client.profile.lastName}`, {});
        }
        let onlineUser = yield Models_1.OnlineUser.findOne({
            where: { userId: job.professionalId },
        });
        const io = (0, chat_1.getIO)();
        if (onlineUser === null || onlineUser === void 0 ? void 0 : onlineUser.isOnline) {
            io.to(onlineUser === null || onlineUser === void 0 ? void 0 : onlineUser.socketId).emit(events_1.Emit.JOB_DISPUTED, { text: `Your job has been disputed`, data: { job } });
        }
        return (0, modules_1.successResponse)(res, 'success', { dispute, emailSendStatus: Boolean(msgStat.messageId) });
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, 'error', error.message);
    }
});
exports.disputeJob = disputeJob;
