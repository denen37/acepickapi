import { Request, Response } from "express"
import { Cooperation } from "../models/Cooperation";
import { Profile } from "../models/Profile";
import { User } from "../models/User";
import { errorResponse, handleResponse, successResponse } from "../utils/modules";
import { Professional } from "../models/Professional";
// import { PublishMessage } from "../events/handler";
import { randomUUID } from "crypto";
import axios from "axios";
import config from '../config/configSetup'

enum Metrics {
    ONGOING = 'ongoing',
    PENDING = 'pending',
    DECLINED = 'declined',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    APPROVED = 'approved',
    REVIEWS = 'reviews',
}

enum MetricOperation {
    INCREMENT = 'increment',
    DECREMENT = 'decrement',
}


export const getCooperates = async (req: Request, res: Response) => {
    let { metadata, search } = req.query;

    let hasmetadata = metadata === 'true' ? true : false;

    let assoc = hasmetadata ? [
        {
            model: Profile,
            attributes: ['id', 'fullName', 'avatar', 'verified', 'notified', 'lga', 'state', 'address']
        },
        {
            model: User,
            attributes: ['id', 'email', 'phone'],
        }
    ] : []


    let searchids: number[] = [];

    try {
        if (search) {
            let result = await axios.get(`${config.JOBS_BASE_URL}/jobs-api/search_profs?search=${search}`)

            searchids = result.data.data.map((item: any) => item.id)

        }

        const whereCondition = searchids.length > 0 ? { professionId: searchids } : {};

        const cooperates = await Cooperation.findAll({
            where: whereCondition,
            include: assoc
        });


        return successResponse(res, 'sucess', cooperates)

    } catch (error) {
        return errorResponse(res, 'error', error);
    }
}

export const getProfessionals = async (req: Request, res: Response) => {
    let { search } = req.query;
    let { userIds }: { userIds: string[] } = req.body;

    //Send a message to jobs to return professionals
    try {
        let searchids: number[] = [];

        if (search) {
            let result = await axios.get(`${config.JOBS_BASE_URL}/jobs-api/search_profs?search=${search}`, {
                headers: {
                    Authorization: req.headers.authorization
                }
            })

            searchids = result.data.data.map((item: any) => item.id)
        }

        let whereCondition: { [key: string]: any } = searchids.length > 0 ? { professionId: searchids } : {};

        if (userIds && userIds.length > 0) {
            whereCondition.userId = userIds;
        }


        // console.log(whereCondition)

        let professionals = await Professional.findAll({
            where: whereCondition,
            attributes: ['id', 'chargeFrom', 'avaialable', 'professionId'],
            include: [
                {
                    model: User,
                    attributes: ['id', 'email', 'phone'],
                    include: [{
                        model: Profile,
                        attributes: ['id', 'fullName', 'avatar', 'verified', 'notified', 'lga', 'state', 'address']
                    }]
                }
            ]
        })


        let result = await axios.post(`${config.JOBS_BASE_URL}/jobs-api/get_profs`,
            { profIds: professionals.map(prof => prof.professionId), },
            {
                headers: {
                    Authorization: req.headers.authorization
                }
            }
        )

        const profList = result.data.data


        professionals.forEach((prof) => {
            const profession = profList.find((p: any) => p.id === prof.professionId);
            prof.setDataValue('profession', profession || null);
        });


        return successResponse(res, 'success', professionals)

    } catch (error: any) {
        return errorResponse(res, 'error', error);
    }
}

export const getProfessionalById = async (req: Request, res: Response) => {
    let { userId } = req.params;

    try {
        const profile = await Profile.findOne({
            where: { userId: userId },
            attributes: {
                exclude: []
            },
            include: [
                {
                    model: User,
                    attributes: ["email", "phone"],
                },
                {
                    model: Professional,
                },
                {
                    model: Cooperation,
                },
            ],
        })

        //we need to get the profession of the user
        const profResponse = await axios.get(`${config.JOBS_BASE_URL}/jobs-api/profs/${profile?.professional.professionId}`, {
            headers: {
                Authorization: req.headers.authorization
            }
        })

        const profession = profResponse.data.data;

        profile?.professional.setDataValue('profession', profession || null);

        //TODO - we need to get the reviews of the user

        return successResponse(res, 'success', profile);
    } catch (error) {
        return errorResponse(res, 'error', error);
    }

}

export const ProfAccountInfo = async (req: Request, res: Response) => {
    const { id } = req.user;
    const profile = await Profile.findOne(
        {
            where: { userId: id },
            attributes: {
                exclude: []
            },
            include: [
                {
                    model: User,
                    attributes: ["email", "phone"],
                },
                {
                    model: Professional,
                },
                {
                    model: Cooperation,
                },
            ],

        }
    )

    const walletResponse = await axios.get(`${config.PAYMENT_BASE_URL}/pay-api/view-wallet`, {
        headers: {
            Authorization: req.headers.authorization
        }
    })

    const wallet = walletResponse.data.data;

    profile?.setDataValue('wallet', wallet);

    if (!profile) return errorResponse(res, "Failed", { status: false, message: "Profile Does'nt exist" })


    return successResponse(res, "Successful", profile)
};

export const updateProfile = async (req: Request, res: Response) => {
    let { id, role } = req.user;

    try {
        console.log(req.user);

        const profile = await Profile.findOne({
            where: { userId: id }
        })

        const updatedProfile = await profile?.update(req.body);

        await profile?.save();

        return successResponse(res, "Successful", updatedProfile);
    } catch (error) {
        return errorResponse(res, "Failed", error)
    }
}

export const metricOperations = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { payload }: {
        payload: { field: string, action: string }[]
    } = req.body;

    const profile = await Profile.findOne({
        where: { userId: userId },
    })

    if (!profile) return handleResponse(res, 404, false, "Profile Does not exist");

    payload.forEach(item => {
        switch (item.field) {
            case Metrics.ONGOING:
                if (item.action === MetricOperation.INCREMENT) {
                    profile.totalJobsOngoing += 1;
                } else {
                    profile.totalJobsOngoing -= 1;
                }
                break;

            case Metrics.COMPLETED:
                if (item.action === MetricOperation.INCREMENT)
                    profile.totalJobsCompleted += 1;
                else
                    profile.totalJobsCompleted -= 1;
                break;

            case Metrics.CANCELLED:
                if (item.action === MetricOperation.INCREMENT)
                    profile.totalJobsCanceled += 1;
                else
                    profile.totalJobsCanceled -= 1;
                break;

            case Metrics.PENDING:
                if (item.action === MetricOperation.INCREMENT)
                    profile.totalJobsPending += 1;
                else
                    profile.totalJobsPending -= 1;
                break;


            case Metrics.DECLINED:
                if (item.action === MetricOperation.INCREMENT)
                    profile.totalJobsDeclined += 1;
                else
                    profile.totalJobsDeclined -= 1;
                break;

            case Metrics.APPROVED:
                if (item.action === MetricOperation.INCREMENT)
                    profile.totalJobsApproved += 1;
                else
                    profile.totalJobsApproved -= 1;
                break;


            case Metrics.REVIEWS:
                if (item.action === MetricOperation.INCREMENT)
                    profile.totalReview += 1;
                else
                    profile.totalReview -= 1;
            default:
                break;
        }

    })
    await profile.save();

    return successResponse(res, 'success', 'Profile updated successfully');
}


