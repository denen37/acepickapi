import { Request, Response } from "express"
import { successResponse, errorResponse, handleResponse } from "../utils/modules"
import { randomUUID } from "crypto";
import { Job, User, Material, Dispute, Profile, Professional } from "../models/Models"
import { JobMode, JobStatus, PayStatus, UserRole } from "../enum"
import { sendEmail } from "../services/gmail";
import { jobResponseEmail, jobCreatedEmail, jobDisputeEmail } from "../utils/messages";
import { jobStatusQuerySchema } from "../validation/query";
import { jobCostingSchema, jobPostSchema, paymentSchema } from "../validation/body";
import { jobIdParamSchema } from "../validation/param";


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

    if (result.data.status) {
        whereCondition = { ...whereCondition, status: result.data.status }
    }

    try {
        const jobs = await Job.findAll({
            where: whereCondition,
        })

        return successResponse(res, "success", jobs)
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
    const msgStat = await sendEmail(
        job.dataValues.professional.email,
        jobCreatedEmail(job.dataValues).title,
        jobCreatedEmail(job.dataValues).body,
        job.dataValues.professional.profile.firstName + ' ' + job.dataValues.professional.profile.lastName
    )

    //send notification to the prof

    return successResponse(res, "Successful", { jobResponse, emailSendId: msgStat.messageId });
}

export const respondToJob = async (req: Request, res: Response) => {
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

        await job.update({
            accepted,
        })

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
        const msgStat = await sendEmail(
            job.dataValues.client.email,
            jobResponseEmail(job.dataValues).title,
            jobResponseEmail(job.dataValues).body,
            job.dataValues.client.profile.firstName + ' ' + job.dataValues.client.profile.lastName
            //'User'
        )

        return successResponse(res, 'success', { message: 'Job respsonse updated', emailSendstatus: Boolean(msgStat.messageId) })
    } catch (error) {
        return errorResponse(res, 'error', error)
    }
}


export const generateInvoice = async (req: Request, res: Response) => {
    const result = jobCostingSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            error: "Invalid input",
            issues: result.error.format(),
        });
    }

    const { jobId, durationUnit, durationValue, workmanship, materials } = result.data;


    try {
        const job = await Job.findByPk(jobId);

        if (!job) {
            return handleResponse(res, 404, false, 'Job not found');
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

            job.materials = materials.reduce((acc, mat) => acc + mat.price * mat.quantity, 0);


            const mats = await Material.bulkCreate(Object.assign(newMat));

            await job.save();

            //Send notification to the client

            return successResponse(res, 'success', { message: 'Invoice generated' })
        }

        await job.save();

        return successResponse(res, 'success', { message: 'Job updated' })
    } catch (err: any) {
        return errorResponse(res, 'error', err.message)
    }
}


export const payforJob = async (req: Request, res: Response) => {
    const { id } = req.user;

    const result = paymentSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            error: "Invalid input",
            issues: result.error.format(),
        });
    }

    const { amount, paidFor, pin, jobId } = result.data;


    //try {

    const job = await Job.findByPk(jobId);
    if (!job) {
        return handleResponse(res, 404, false, 'Job not found');
    }

    if (job.payStatus === PayStatus.PAID) {
        return handleResponse(res, 400, false, 'Job has already been paid for')
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
    job.payStatus = PayStatus.PAID;

    job.paidFor = paidFor;

    job.paymentRef = randomUUID();

    job.status = JobStatus.ONGOING;

    await job.save();

    if (job.payStatus === PayStatus.PAID) {
        const updatedProfessionalProfile = await Profile.update({
            totalJobsOngoing: (job.professional.profile.totalJobsOngoing || 0) + 1,
        }, {
            where: { userId: job.professionalId }
        })


        const updatedClientProfile = await Profile.update({
            totalJobsOngoing: (job.professional.profile.totalJobsOngoing || 0) + 1,
        }, {
            where: { userId: job.clientId }
        })
    }

    return successResponse(res, 'success', { message: 'Job payment successful' });
    //   }

    //return handleResponse(res, 400, false, 'Payment failed', response.data.data);
    // } catch (error: any) {
    //     return errorResponse(res, 'error', { message: error.message, error });
    // }
};

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