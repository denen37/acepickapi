import { Request, Response } from "express"
import { Location, User, Profile, Cooperation, Professional, Education, Certification, Experience, Portfolio, Wallet } from "../models/Models";
import { errorResponse, handleResponse, successResponse } from "../utils/modules";
// import { PublishMessage } from "../events/handler";
import { randomUUID } from "crypto";
import axios from "axios";
import config from '../config/configSetup'
import { updateUserProfileSchema } from "../validation/body";



export const AccountInfo = async (req: Request, res: Response) => {
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

