import { Request, Response } from "express"
import { successResponse, errorResponse, handleResponse, randomId } from "../utils/modules"
import { randomUUID } from "crypto";
import { Job, User, Material, Dispute, Profile, Professional, Wallet, OnlineUser, Activity, Transaction } from "../models/Models"
import { Accounts, CommissionScope, JobMode, JobStatus, PayStatus, TransactionStatus, TransactionType, UserRole } from "../utils/enum"
import { sendEmail } from "../services/gmail";
import { jobResponseEmail, jobCreatedEmail, jobDisputeEmail, invoiceGeneratedEmail, invoiceUpdatedEmail, completeJobEmail, approveJobEmail, disputedJobEmail, jobUpdatedEmail, jobCancelledEmail } from "../utils/messages";
import { jobStatusQuerySchema } from "../validation/query";
import { jobCostingSchema, jobCostingUpdateSchema, jobPostSchema, jobUpdateSchema, paymentSchema } from "../validation/body";
import { jobIdParamSchema } from "../validation/param";
import { sendPushNotification } from "../services/notification";
import { getIO } from '../chat';
import { Emit } from "../utils/events";
import { LedgerService } from "../services/ledgerService";
import { CommissionService } from "../services/CommissionService";

export const testApi = async (req: Request, res: Response) => {
    return successResponse(res, "success", "Your Api is working!")
}


export const getJobs = async (req: Request, res: Response) => {
    let { id, role } = req.user;

    const result = jobStatusQuerySchema.safeParse(req.query);

    if (!result.success) {
        return res.status(400).json({ error: "Invalid query", issues: result.error.format() });
    }

    let whereCondition: { [key: string]: any; }

    if (role === UserRole.CLIENT) {
        whereCondition = { clientId: id }
    } else {
        whereCondition = { professionalId: id }
    }

    if (result.data.status && result.data.status !== "all") {
        whereCondition = { ...whereCondition, status: result.data.status }
    }

    try {
        const jobs = await Job.findAll({
            where: whereCondition,
            include: [
                role === UserRole.PROFESSIONAL ? {
                    model: User,
                    attributes: ['id', 'email', 'phone', 'fcmToken'],
                    as: 'client',
                    include: [
                        {
                            model: Profile,
                            attributes: ['id', 'firstName', 'lastName', 'avatar']
                        }
                    ]
                } : {
                    model: User,
                    as: 'professional',
                    attributes: ['id', 'email', 'phone', 'fcmToken'],
                    include: [
                        {
                            model: Profile,
                            attributes: ['id', 'firstName', 'lastName', 'avatar'],
                            include: [{
                                model: Professional,
                                attributes: ['id']
                            }]
                        }
                    ]

                },
                {
                    model: Material
                }
            ],

            order: [['createdAt', 'DESC']]
        })

        return successResponse(res, "success", jobs)
    } catch (error) {
        return errorResponse(res, "error", error)
    }
}

export const getJobStat = async (req: Request, res: Response) => {
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
    } catch (error) {
        return errorResponse(res, "error", error);
    }
}


export const getLatestJob = async (req: Request, res: Response) => {
    let { id, role } = req.user;

    let whereCondition: { [key: string]: any; }

    if (role === UserRole.CLIENT) {
        whereCondition = { clientId: id }
    } else {
        whereCondition = { professionalId: id }
    }

    try {
        const job = await Job.findOne({
            where: {
                ...whereCondition,
                status: JobStatus.PENDING,
                accepted: false
            },
            order: [['createdAt', 'DESC']],
            include: [Material]
        })

        if (!job) {
            return handleResponse(res, 404, false, 'No job found');
        }

        return successResponse(res, "success", job)
    } catch (error) {
        return errorResponse(res, "error", error)
    }
}


export const getJobById = async (req: Request, res: Response) => {
    let { id } = req.params;

    try {
        const jobs = await Job.findOne({
            where: { id },
            include: [Material]
        })

        return successResponse(res, "success", jobs)
    } catch (error: any) {
        return errorResponse(res, 'error', error.message);
    }
}


export const createJobOrder = async (req: Request, res: Response) => {
    const { id } = req.user;

    const result = jobPostSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            error: "Invalid input",
            issues: result.error.format(),
        });
    }

    const validatedData = result.data;

    const professional = await User.findOne({
        where: { id: validatedData.professionalId },
        include: [Profile]
    })

    if (!professional) {
        return handleResponse(res, 404, false, 'User not found');
    }

    if (professional.role !== UserRole.PROFESSIONAL) {
        return handleResponse(res, 401, false, 'User is not a professional')
    };

    const client = await User.findOne({
        where: { id: id },
        include: [Profile]
    })

    const job = await Job.create({
        title: validatedData.title,
        description: validatedData.description,
        fullAddress: validatedData.address,
        numOfJobs: validatedData.numOfJobs || 1,
        mode: validatedData.mode || JobMode.PHYSICAL,
        professionalId: validatedData.professionalId,
        clientId: id,
    })

    const jobResponse = { ...job.dataValues }

    job.setDataValue('client', client);
    job.setDataValue('professional', professional);


    const updatedProfessionalProfile = await Profile.update({
        pending: professional.profile.totalJobsPending + 1,
    }, {
        where: { id: professional.profile.id },
    })

    const updatedClientProfile = await Profile.update({
        totalJobsPending: (client?.profile.totalJobsPending || 0) + 1,
    }, {
        where: { id: client?.profile.id }
    })


    //send an email to the prof
    const emailResponse = await sendEmail(
        job.dataValues.professional.email,
        jobCreatedEmail(job.dataValues).title,
        jobCreatedEmail(job.dataValues).body,
        job.dataValues.professional.profile.firstName + ' ' + job.dataValues.professional.profile.lastName
    )

    //send notification to the prof
    console.log('notification token', job.dataValues.professional.fcmToken);
    if (job.dataValues.professional.fcmToken) {
        await sendPushNotification(
            job.dataValues.professional.fcmToken,
            'New job created',
            `A new job has been created: ${job.dataValues.title}`,
            {}
        );
    }

    let onlineUser = await OnlineUser.findOne({
        where: { userId: job.dataValues.professionalId }
    })

    const io = getIO();

    if (onlineUser?.isOnline) {
        io.to(onlineUser?.socketId).emit(Emit.JOB_CREATED, { text: 'This a new Job', data: job });
    }


    const newActivity = await Activity.create({
        userId: id,
        action: `${client?.profile.firstName} ${client?.profile.lastName} has created a new Job #${job.id}`,
        type: 'Job Created',
        status: 'success'
    })


    return successResponse(res, "Successful", { jobResponse, emailSendId: emailResponse.success });
}

export const updateJob = async (req: Request, res: Response) => {
    try {
        const result = jobUpdateSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                error: "Invalid route parameter",
                issues: result.error.format(),
            });
        }

        const job = await Job.findByPk(result.data.jobId, {
            include: [
                {
                    model: User,
                    as: 'professional',
                    include: [Profile]
                }, {
                    model: User,
                    as: 'client',
                    include: [Profile]
                }
            ]
        });

        if (!job) {
            return handleResponse(res, 404, false, "Job not found");
        }

        if (job.accepted) {
            return handleResponse(res, 404, false, "Job already accepted");
        }

        await job.update(result.data);

        //send email to professional
        const emailToSend = await jobUpdatedEmail(job.dataValues);

        const msgId = await sendEmail(
            job.professional.email,
            emailToSend.title,
            emailToSend.body,
            job.professional.profile.firstName
        )

        if (job.professional.fcmToken) {
            await sendPushNotification(
                job.dataValues.client.fcmToken,
                'Job Updated',
                `Your job has been updated by ${job.dataValues.professional.profile.firstName} ${job.dataValues.professional.profile.lastName}`,
                {}
            );
        }

        let onlineUser = await OnlineUser.findOne({
            where: { userId: job.dataValues.professionalId }
        })

        const io = getIO();

        if (onlineUser?.isOnline) {
            io.to(onlineUser?.socketId).emit(Emit.JOB_UPDATED, { text: 'Your job has been updated', data: job });
        }

        return successResponse(res, "Successful", { job });
    } catch (error) {
        return errorResponse(res, 'error', "Error updating job");
    }
}

export const cancelJob = async (req: Request, res: Response) => {
    const { jobId } = req.params;

    try {
        const job = await Job.findByPk(jobId, {
            include: [
                {
                    model: User,
                    as: 'client',
                    include: [Profile]
                }, {
                    model: User,
                    as: 'professional',
                    include: [Profile]
                }
            ]
        });

        if (!job) {
            return errorResponse(res, 'error', "Job not found");
        }

        await job.update({ status: JobStatus.CANCELLED });
        // Send email to client
        const emailToSend = await jobCancelledEmail(job.dataValues);

        const msgId = await sendEmail(
            job.professional.email,
            emailToSend.title,
            emailToSend.body,
            job.professional.profile.firstName
        )

        if (job.professional.fcmToken) {
            await sendPushNotification(
                job.dataValues.client.fcmToken,
                'Job Cancelled',
                `Your job has been cancelled by ${job.dataValues.professional.profile.firstName} ${job.dataValues.professional.profile.lastName}`,
                {}
            );
        }

        let onlineUser = await OnlineUser.findOne({
            where: { userId: job.dataValues.professionalId }
        })

        const io = getIO();

        if (onlineUser?.isOnline) {
            io.to(onlineUser?.socketId).emit(Emit.JOB_CANCELLED, { text: 'Your job has been cancelled by client', data: job });
        }

        await job.destroy();

        await job.save();

        return successResponse(res, 'success', "Job deleted successfully")

    } catch (error) {
        return errorResponse(res, 'error', "Error cancelling job");
    }
}

export const respondToJob = async (req: Request, res: Response) => {
    const {id, role} = req.user;

    const result = jobIdParamSchema.safeParse(req.params);

    if (!result.success) {
        return res.status(400).json({
            error: "Invalid route parameter",
            issues: result.error.format(),
        });
    }

    const jobId = parseInt(result.data.jobId, 10);

    const { accepted } = req.body;

    try {
        const job = await Job.findByPk(jobId);

        if (!job) {
            return handleResponse(res, 404, false, 'Job not found')
        }

        if(id !== job.professionalId){
            return handleResponse(res, 400, false, 'You are not authorized to perform this action')
        }

        await job.update({
            accepted,
        })

        if (accepted) {
            job.status = JobStatus.PENDING;
        } else {
            job.status = JobStatus.REJECTED;
        }

        job.save();

        const professional = await User.findOne({
            where: { id: job.professionalId },
            include: [Profile]
        })


        const client = await User.findOne({
            where: { id: job.clientId },
            include: [Profile]
        })

        job.setDataValue('client', client);
        job.setDataValue('professional', professional);

        // console.log('prof email', job.dataValues.prof.email);
        // console.log('prof name', job.dataValues.prof.profile.fullName);

        //send an email to the prof
        const emailResponse = await sendEmail(
            job.dataValues.client.email,
            jobResponseEmail(job.dataValues).title,
            jobResponseEmail(job.dataValues).body,
            job.dataValues.client.profile.firstName + ' ' + job.dataValues.client.profile.lastName
            //'User'
        )

        //send notification to the prof
        if (job.dataValues.client.fcmToken) {
            await sendPushNotification(
                job.dataValues.client.fcmToken,
                'Job response',
                `Your job has been ${accepted ? 'accepted' : 'rejected'} by the professional: ${job.dataValues.professional.profile.firstName} ${job.dataValues.professional.profile.lastName}`,
                {}
            );
        }

        let onlineUser = await OnlineUser.findOne({
            where: { userId: job.professionalId }
        })

        const io = getIO();

        if (onlineUser?.isOnline) {
            io.to(onlineUser?.socketId).emit(Emit.JOB_RESPONSE, { text: `$Your Job has been ${accepted ? 'accepted' : 'rejected'}`, data: job });
        }


        return successResponse(res, 'success', { message: 'Job respsonse updated', emailSendstatus: Boolean(emailResponse.messageId) })
    } catch (error) {
        return errorResponse(res, 'error', error)
    }
}


export const generateInvoice = async (req: Request, res: Response) => {
    const result = jobCostingSchema.safeParse(req.body);

    const {id, role} = req.user;

    if (!result.success) {
        return res.status(400).json({
            error: "Invalid input",
            issues: result.error.format(),
        });
    }

    const { jobId, durationUnit, durationValue, workmanship, materials } = result.data;


    try {
        const job = await Job.findByPk(jobId, {
            include: [
                {
                    model: User,
                    as: 'client',
                    include: [Profile]
                },
                {
                    model: User,
                    as: 'professional',
                    include: [Profile]
                }
            ]
        });

        if (!job) {
            return handleResponse(res, 404, false, 'Job not found');
        }


        if(id !== job.professionalId){
            return handleResponse(res, 400, false, 'You are not authorized to perform this action')
        }


        if (job.workmanship) {
            return handleResponse(res, 400, false, 'Invoice already generated');
        }

        await job.update({
            durationUnit,
            durationValue,
            workmanship,
        })


        if (materials) {
            const newMat = materials.map((mat) => {
                return {
                    ...mat,
                    subTotal: mat.price * mat.quantity,
                    jobId,
                }
            })

            job.isMaterial = true;

            job.materialsCost = materials.reduce((acc, mat) => acc + mat.price * mat.quantity, 0);


            const mats = await Material.bulkCreate(Object.assign(newMat));

            await job.save();

            //send an email to the client
            const emailTosend = invoiceGeneratedEmail(job.dataValues);

            const emailResponse = await sendEmail(
                job.dataValues.client.email,
                emailTosend.title,
                emailTosend.body,
                job.dataValues.client.profile?.firstName + ' ' + job.dataValues.client.profile?.lastName
                //'User'
            )


            //Send notification to the client
            if (job.dataValues.client.fcmToken) {
                await sendPushNotification(
                    job.dataValues.client.fcmToken,
                    'Invoice generated',
                    `An invoice has been generated for your job: ${job.dataValues.title}`,
                    {}
                );
            }

            let onlineUser = await OnlineUser.findOne({
                where: { userId: job.clientId }
            })

            const io = getIO();

            if (onlineUser?.isOnline) {
                io.to(onlineUser?.socketId).emit(Emit.INVOICE_GENERATED, { text: `An invoice has been generated`, data: { job, materials } });
            }

            return successResponse(res, 'success', { message: 'Invoice generated' })
        }

        await job.save();

        return successResponse(res, 'success', { message: 'Job updated' })
    } catch (err: any) {
        return errorResponse(res, 'error', err.message)
    }
}

export const updateInvoice = async (req: Request, res: Response) => {
    const { jobId } = req.params;


    const result = jobCostingUpdateSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            error: "Invalid input",
            issues: result.error.format(),
        });
    }

    const { durationUnit, durationValue, workmanship, materials } = result.data;

    const job = await Job.findByPk(jobId, {
        include: [
            {
                model: User,
                as: 'client'
            },
            {
                model: User,
                as: 'professional',
                include: [Profile]
            }
        ]
    });

    if (!job) {
        return handleResponse(res, 404, false, 'Job not found')
    }

    if (job.payStatus === PayStatus.PAID) {
        return handleResponse(res, 404, false, 'Job has already been paid')
    }

    await job.update({
        durationUnit,
        durationValue,
        workmanship
    });

    await job.save();

    if (materials && materials.length > 0) {
        // Filter materials without id (new ones) for bulkCreate
        const newMaterials = materials.filter(material => !material.id);
        let created: Material[] = [];

        if (newMaterials.length > 0) {
            created = await Material.bulkCreate(
                newMaterials.map(material => ({
                    ...material,
                    subTotal: material.price * material.quantity,
                    jobId,
                }))
            );
        }

        // Update existing materials
        const updatePromises = [];
        for (const mat of materials) {
            if (mat.id) {
                updatePromises.push(
                    Material.update(
                        {
                            ...mat,
                            subTotal: mat.price * mat.quantity,
                            jobId,
                        },
                        {
                            where: { id: mat.id }
                        }
                    )
                );
            }
        }
        await Promise.all(updatePromises);

        // Mark job as having materials and set total cost
        job.isMaterial = true;

        const allMaterials = await Material.findAll({ where: { jobId } });

        job.materialsCost = allMaterials.reduce((acc, mat) => acc + mat.price * mat.quantity, 0);

        job.materials = allMaterials;

        await job.save();

        // Optional: assign created/updated materials to job
        //job.materials = [...created, ...materials.filter(mat => mat.id)];
    }

    const jobObj = job.toJSON();

    //send an email to the client
    const emailTosend = invoiceUpdatedEmail(jobObj);

    const emailResponse = await sendEmail(
        job.client.email,
        emailTosend.title,
        emailTosend.body,
        (jobObj.client.profile?.firstName ?? '' + ' ' + jobObj.client.profile?.lastName ?? '').toString().trim() ?? 'User'
        //'User'
    )


    //Send notification to the client
    if (job.dataValues.client.fcmToken) {
        await sendPushNotification(
            job.dataValues.client.fcmToken,
            'Invoice Updated',
            `An invoice has been updated for your job: ${job.dataValues.title}`,
            {}
        );
    }


    let onlineUser = await OnlineUser.findOne({
        where: { userId: job.clientId }
    })

    const io = getIO();

    if (onlineUser?.isOnline) {
        io.to(onlineUser?.socketId).emit(Emit.INVOICE_UPDATED, { text: `An invoice has been updated`, data: { job } });
    }


    return successResponse(res, 'success', { message: 'Job updated successfully', job });
}

export const viewInvoice = async (req: Request, res: Response) => {
    const { id } = req.user;
    const { jobId } = req.params;

    try {
        const invoice = await Job.findByPk(jobId, {
            attributes: ['id', 'title', 'description', 'status', 'workmanship', 'materialsCost', 'createdAt', 'updatedAt'],
            include: [
                {
                    model: Material
                }
            ]
        })

        return successResponse(res, 'success', invoice);
    } catch (error: any) {
        return errorResponse(res, 'error', error.message);
    }
}


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

export const completeJob = async (req: Request, res: Response) => {
    const { jobId } = req.params;

    try {
        const job = await Job.findOne({
            where: {
                id: jobId,
                //professionalId: req.user.id, 
                status: JobStatus.ONGOING
            },
            include: [{
                model: User,
                as: 'professional',
                include: [Profile]
            }, {
                model: User,
                as: 'client',
                include: [Profile]
            }]
        })

        if (!job) {
            return handleResponse(res, 404, false, 'Job does not exist / Job already completed');
        }

        job.status = JobStatus.COMPLETED

        await job.save()


        job.professional.profile.totalJobsCompleted = (job.professional.profile?.totalJobsCompleted || 0) + 1;

        await job.professional.profile.save();
        // }


        job.client.profile.totalJobsCompleted = (job.client.profile?.totalJobsCompleted || 0) + 1;

        await job.client.profile?.save();


        //send an email to the client
        const emailTosend = completeJobEmail(job.dataValues);

        const emailResponse = await sendEmail(
            job.dataValues.client.email,
            emailTosend.title,
            emailTosend.body,
            job.dataValues.client.profile.firstName + ' ' + job.dataValues.client.profile.lastName
            //'User'
        )


        //Send notification to the client
        if (job.dataValues.client.fcmToken) {
            await sendPushNotification(
                job.dataValues.client.fcmToken,
                'Job Completed',
                `Your job on ${job.dataValues.title} has been completed by ${job.professional.profile.firstName} ${job.professional.profile.lastName}`,
                {}
            );
        }



        let onlineUser = await OnlineUser.findOne({
            where: { userId: job.clientId }
        })

        const io = getIO();

        if (onlineUser?.isOnline) {
            io.to(onlineUser?.socketId).emit(Emit.JOB_COMPLETED, { text: `Your job has completed`, data: { job } });
        }

        const newActivity = await Activity.create({
            userId: job.professional.id,
            action: `${job.professional.profile.firstName} ${job.professional.profile.lastName} has completed Job #${job.id}`,
            type: 'Job Completion',
            status: 'success'
        })

        return successResponse(res, 'success', { message: 'Job completed sucessfully', emailSendStatus: Boolean(emailResponse) })
    } catch (error: any) {
        return errorResponse(res, 'error', error.message)
    }
}


export const approveJob = async (req: Request, res: Response) => {
    const { jobId } = req.params;

    try {
        const job = await Job.findOne({
            where: {
                id: jobId,
                //clientId: req.user.id, 
                status: JobStatus.COMPLETED
            },
            include: [{
                model: User,
                as: 'professional',
                include: [Profile, Wallet]
            }, {
                model: User,
                as: 'client',
                include: [Profile]
            }]
        })

        if (!job) {
            return handleResponse(res, 404, false, 'Job does not exist / Job already approved');
        }

        if (job.status !== JobStatus.COMPLETED) {
            return handleResponse(res, 404, false, `You cannot approve a/an ${job.status} job`)
        }

        job.status = JobStatus.APPROVED;
        job.approved = true;

        await job.save();


        job.professional.profile.totalJobsApproved = (job.professional.profile?.totalJobsApproved || 0) + 1;

        await job.professional.profile.save();

        job.client.profile.totalJobsApproved = (job.client.profile?.totalJobsApproved || 0) + 1;

        await job.client.profile?.save();


        if (job.professional.wallet) {
            let amount = job.workmanship + job.materialsCost;

            const commission = await CommissionService.calculateCommission(job.workmanship, CommissionScope.JOB);

            amount = amount - commission;

            job.professional.wallet.previousBalance = job.professional.wallet.currentBalance || 0;

            job.professional.wallet.currentBalance = (job.professional.wallet.currentBalance || 0) + amount

            await job.professional.wallet.save();

            const transaction = await Transaction.create({
                userId: job.professional.id,
                amount: amount,
                reference: randomId(12),
                status: TransactionStatus.PENDING,
                currency: 'NGN',
                timestamp: new Date(),
                description: 'wallet deposit',
                jobId: job.id,
                productTransactionId: null,
                type: TransactionType.CREDIT
            })

            await LedgerService.createEntry([
                {
                    transactionId: transaction.id,
                    userId: transaction.userId,
                    amount: transaction.amount + commission,
                    type: TransactionType.DEBIT,
                    account: Accounts.PLATFORM_ESCROW
                },

                {
                    transactionId: transaction.id,
                    userId: transaction.userId,
                    amount: transaction.amount,
                    type: TransactionType.CREDIT,
                    account: Accounts.PROFESSIONAL_WALLET
                },

                {
                    transactionId: transaction.id,
                    userId: null,
                    amount: commission,
                    type: TransactionType.CREDIT,
                    account: Accounts.PLATFORM_REVENUE
                }
            ])
        }

        //send an email to the professional
        const emailTosend = approveJobEmail(job.dataValues);

        const emailResponse = await sendEmail(
            job.dataValues.professional.email,
            emailTosend.title,
            emailTosend.body,
            job.dataValues.professional.profile.firstName + ' ' + job.dataValues.professional.profile.lastName
            //'User'
        )


        //Send notification to the professional
        if (job.dataValues.client.fcmToken) {
            await sendPushNotification(
                job.dataValues.professional.fcmToken,
                'Job Approved',
                `Your job on ${job.dataValues.title} has been Approved by ${job.client.profile.firstName} ${job.client.profile.lastName}`,
                {}
            );
        }


        let onlineUser = await OnlineUser.findOne({
            where: { userId: job.professionalId },
        })

        const io = getIO();

        if (onlineUser?.isOnline) {
            io.to(onlineUser?.socketId).emit(Emit.JOB_APPROVED, { text: `Your job has approved`, data: { job } });
        }

        const newActivity = await Activity.create({
            userId: job.client.id,
            action: `${job.client.profile.firstName} ${job.client.profile.lastName} has approved Job #${job.id}`,
            type: 'Job Approval',
            status: 'success'
        })


        return successResponse(res, 'success', { message: 'Job approved sucessfully', emailSendStatus: emailResponse.success })
    } catch (error: any) {
        return errorResponse(res, 'error', error.message)
    }
}

export const disputeJob = async (req: Request, res: Response) => {
    const jobId = req.params.jobId;

    const { reason, description } = req.body;

    try {
        const job = await Job.findOne({
            where: {
                id: jobId,
                //professionalId: req.user.id, 
                status: JobStatus.COMPLETED
            },
            include: [{
                model: User,
                as: 'professional',
                include: [Profile]
            }, {
                model: User,
                as: 'client',
                include: [Profile]
            }]
        })

        if (!job) {
            return handleResponse(res, 404, false, 'Job does not exist');
        }

        if (job.status !== JobStatus.COMPLETED) {
            return handleResponse(res, 404, false, `You cannot dispute a/an ${job.status} job`)
        }

        job.status = JobStatus.DISPUTED;

        await job.save()


        if (job.professional.profile) {
            job.professional.profile.totalDisputes = (job.professional.profile?.totalDisputes || 0) + 1;

            await job.professional.profile?.save();
        }


        if (job.client.profile) {
            job.client.profile.totalDisputes = (job.client.profile?.totalDisputes || 0) + 1;

            await job.client.profile?.save();
        }

        const dispute = await Dispute.create({
            reason,
            description,
            jobId: jobId,
            reporterId: job.professionalId,
            partnerId: job.clientId,
        })


        //send an email to the professional
        const emailTosend = disputedJobEmail(job.dataValues, dispute);

        const emailResponse = await sendEmail(
            job.dataValues.professional.email,
            emailTosend.title,
            emailTosend.body,
            job.dataValues.professional.profile.firstName + ' ' + job.dataValues.professional.profile.lastName
            //'User'
        )


        //Send notification to the professional
        if (job.dataValues.client.fcmToken) {
            await sendPushNotification(
                job.dataValues.professional.fcmToken,
                'Job Disputed',
                `Your job on ${job.dataValues.title} has been disputed by ${job.client.profile.firstName} ${job.client.profile.lastName}`,
                {}
            );
        }


        let onlineUser = await OnlineUser.findOne({
            where: { userId: job.professionalId },
        })

        const io = getIO();

        if (onlineUser?.isOnline) {
            io.to(onlineUser?.socketId).emit(Emit.JOB_DISPUTED, { text: `Your job has been disputed`, data: { job } });
        }

        const newActivity = await Activity.create({
            userId: job.client.id,
            action: `${job.client.profile.firstName} ${job.client.profile.lastName} has created a dispute on job #${job.id}`,
            type: 'Dispute',
            status: 'success'
        })

        return successResponse(res, 'success', { dispute, emailSendStatus: emailResponse.success })
    } catch (error: any) {
        return errorResponse(res, 'error', error.message)
    }
}