import { Request, Response } from "express"
import { Location, User, Profile, Cooperation, Professional, Education, Certification, Experience, Portfolio, Wallet, Rider, Profession, Sector } from "../models/Models";
import { errorResponse, handleResponse, successResponse } from "../utils/modules";
// import { PublishMessage } from "../events/handler";
import { randomUUID } from "crypto";
import axios from "axios";
import config from '../config/configSetup'
import { updateUserProfileSchema } from "../validation/body";
import { UserRole } from "../utils/enum";
import { Op } from "sequelize";
import { Fn } from "sequelize/types/utils";
import { getUsersQuerySchema } from "../validation/query";



export const MyAccountInfo = async (req: Request, res: Response) => {
    const { id } = req.user;
    try {
        const profile = await Profile.findOne(
            {
                where: { userId: id },
                attributes: {
                    exclude: []
                },
                include: [
                    {
                        model: User,
                        attributes: { exclude: ['password', 'fcmToken'] },
                        include: [
                            {
                                model: Location,
                                //attributes: ['country', 'state', 'city', 'address']
                            },

                            {
                                model: Wallet,
                                attributes: { exclude: ['pin'] }
                            }
                        ]
                    },
                    {
                        model: Professional,
                        include: [{
                            model: Profession,
                            include: [Sector]
                        }]
                    },
                    {
                        model: Cooperation,
                    },

                    {
                        model: Education
                    },

                    {
                        model: Certification
                    },

                    {
                        model: Experience
                    },

                    {
                        model: Portfolio,
                    },
                    {
                        model: Rider
                    }

                ],

            }
        )



        if (!profile) return errorResponse(res, "Failed", { status: false, message: "Profile Does'nt exist" })


        return successResponse(res, "Successful", profile)
    } catch (error) {
        return errorResponse(res, "Failed", error)
    }
};


export const UserAccountInfo = async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
        const profile = await Profile.findOne(
            {
                where: { userId: userId },
                attributes: {
                    exclude: []
                },
                include: [
                    {
                        model: User,
                        attributes: { exclude: ['password', 'fcmToken'] },
                        include: [
                            {
                                model: Location,
                                //attributes: ['country', 'state', 'city', 'address']
                            },

                            {
                                model: Wallet,
                                attributes: { exclude: ['pin'] }
                            },
                            {
                                model: Rider
                            }

                        ]
                    },
                    {
                        model: Professional,
                        include: [{
                            model: Profession,
                            include: [Sector]
                        }]
                    },
                    {
                        model: Cooperation,
                    },

                    {
                        model: Education
                    },

                    {
                        model: Certification
                    },

                    {
                        model: Experience
                    },

                    {
                        model: Portfolio,
                    }
                ],

            }
        )



        if (!profile) return errorResponse(res, "Failed", { status: false, message: "Profile Does'nt exist" })


        return successResponse(res, "Successful", profile)
    } catch (error) {
        return errorResponse(res, "Failed", error)
    }
};


export const updateProfile = async (req: Request, res: Response) => {
    let { id, role } = req.user;

    const result = updateUserProfileSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            status: false,
            message: 'Validation error',
            errors: result.error.flatten().fieldErrors,
        });
    }

    const { contact, bio, location } = result.data;

    try {
        // console.log(req.user);

        if (bio) {
            const updated = await Profile.update(bio, {
                where: { userId: id }
            });
        }

        if (contact) {
            const updated = await User.update(contact, {
                where: { id }
            });
        }

        if (location) {
            const updated = await Location.update(location, {
                where: { userId: id }
            });
        }

        return successResponse(res, "success", "Profile updated successfully");
    } catch (error) {
        return errorResponse(res, "Failed", error)
    }
}

export const getUsers = async (req: Request, res: Response) => {
    const { id } = req.user;

    const result = getUsersQuerySchema.safeParse(req.query);

    if (!result.success) {
        return res.status(400).json({
            status: false,
            message: 'Validation error',
            errors: result.error.flatten().fieldErrors,
        });
    }

    console.log(result.data);

    const { search, professionId, page, limit, role } = result.data;


    try {
        const contacts = await User.findAll({
            attributes: { exclude: ['password'] },
            where: {
                ...(role && { role }),
                id: { [Op.ne]: id },
            },
            include: [
                {
                    model: Profile,
                    where: search
                        ? {
                            [Op.or]: [
                                { firstName: { [Op.like]: `%${search}%` } },
                                { lastName: { [Op.like]: `%${search}%` } },
                            ],
                        }
                        : undefined,
                    include: [
                        {
                            model: Professional,
                            include: [
                                {
                                    model: Profession,
                                    where: professionId ? { id: professionId } : undefined,
                                },
                            ],
                        },
                    ],
                },
                {
                    model: Location
                },
            ],
            limit: limit,
            offset: (page - 1) * limit,
            order: [['createdAt', 'DESC']],
        });


        return successResponse(res, 'success', contacts)
    } catch (error) {
        console.log(error)
        return errorResponse(res, "Failed", error)
    }
}