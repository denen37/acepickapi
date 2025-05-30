import { Request, Response } from 'express';
const { Op } = require('sequelize');
import { Location, Profession, Professional, Profile, Sector, User } from '../models/Models';
import { successResponse, errorResponse } from '../utils/modules';
import sequelize from 'sequelize';
import { professionalSearchQuerySchema } from '../validation/query';




export const getProfessionals = async (req: Request, res: Response) => {
    try {

        const result = professionalSearchQuerySchema.safeParse(req.query);

        if (!result.success) {
            return res.status(400).json({
                error: "Invalid query parameters",
                issues: result.error.format(),
            });
        }

        const { profession, sector, span, state, lga } = result.data;
        const { id } = req.user;

        let spanValue;
        let userLocation;
        let distanceQuery = '';

        if (span) {
            userLocation = await Location.findOne({
                where: {
                    userId: id
                }
            })


            console.log('lat', userLocation?.latitude);
            console.log('long', userLocation?.longitude);

            distanceQuery = `
  6371 * acos(
    cos(radians(${userLocation?.latitude})) * cos(radians([profile->user->location].[latitude])) *
    cos(radians([profile->user->location].[longitude]) - radians(${userLocation?.longitude})) +
    sin(radians(${userLocation?.latitude})) * sin(radians([profile->user->location].[latitude]))
  )
`;
        }


        const professionals = await Professional.findAll({
            attributes: ['id', 'chargeFrom', 'available'],
            include: [
                {
                    model: Profile,
                    attributes: ['id', 'firstName', 'lastName', 'avatar', 'verified', 'userId'],
                    include: [
                        {
                            model: User,
                            attributes: {
                                exclude: ['password', 'fcmToken']
                            },
                            include: [
                                {
                                    model: Location,
                                    attributes: {
                                        include: span ? [
                                            [sequelize.literal(distanceQuery), 'distance']
                                        ] : []
                                    },
                                    where: {
                                        [Op.and]: [
                                            span ? sequelize.where(
                                                sequelize.literal(distanceQuery),
                                                { [Op.lte]: span }
                                            ) : undefined,
                                            state ? { state: { [Op.like]: `%${state}%` } } : {},
                                            lga ? { lga: { [Op.like]: `%${lga}%` } } : {}

                                        ]
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    model: Profession,
                    where: profession ? {
                        title: {
                            [Op.like]: `%${profession}%`
                        }
                    } : undefined,
                    include: [
                        {
                            model: Sector,
                            where: sector ? {
                                title: {
                                    [Op.like]: `%${sector}%`
                                }
                            } : undefined
                        }
                    ]
                },

            ]
        });

        return successResponse(res, 'success', professionals);

    } catch (error: any) {
        return errorResponse(res, 'error', error.message || 'Something went wrong');
    }
};




