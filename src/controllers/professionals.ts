import { Request, Response } from 'express';
const { Op } = require('sequelize');
import { Location, Profession, Professional, Profile, Review, Sector, User } from '../models/Models';
import { successResponse, errorResponse } from '../utils/modules';
import sequelize from 'sequelize';
import { professionalSearchQuerySchema } from '../validation/query';




export const getProfessionals = async (req: Request, res: Response) => {
    // try {

    const result = professionalSearchQuerySchema.safeParse(req.query);

    if (!result.success) {
        return res.status(400).json({
            error: "Invalid query parameters",
            issues: result.error.format(),
        });
    }

    const { profession, sector, span, state, lga, rating, page, limit } = result.data;
    const { id } = req.user;

    let spanValue;
    let userLocation;
    let distanceQuery = '';
    let minRating = rating;
    let offset = (page - 1) * limit;


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
        attributes: [
            'id',
            'chargeFrom',
            'available',
            [sequelize.fn('AVG', sequelize.col('Profile.User.professionalReviews.rating')), 'avgRating']
        ],
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
                                model: Review,
                                as: 'professionalReviews', // Must match your association alias
                                attributes: []
                            },
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
                                    ].filter(Boolean) // Filter out undefined conditions
                                }
                            }
                        ]
                    }
                ]
            },
            {
                model: Profession,
                where: profession ? {
                    title: { [Op.like]: `%${profession}%` }
                } : undefined,
                include: [
                    {
                        model: Sector,
                        where: sector ? {
                            title: { [Op.like]: `%${sector}%` }
                        } : undefined
                    }
                ]
            }
        ],
        group: [
            'Professional.id',
            'Professional.chargeFrom',
            'Professional.available',
            'Profile.id',
            'Profile.firstName',
            'Profile.lastName',
            'Profile.avatar',
            'Profile.verified',
            'Profile.userId',
            'Profile.User.id',
            'Profile.User.email',
            'Profile.User.phone',
            'Profile.User.status',
            'Profile.User.role',
            'Profile.User.createdAt',
            'Profile.User.updatedAt',
            'Profile.User.location.id',
            'Profile.User.location.address',
            'Profile.User.location.lga',
            'Profile.User.location.state',
            'Profile.User.location.latitude',
            'Profile.User.location.longitude',
            'Profile.User.location.userId',
            'Profile.User.location.createdAt',
            'Profile.User.location.updatedAt',
            'Profession.id',
            'Profession.title',
            'Profession.image',
            'Profession.sectorId',
            'Profession.sector.id',
            'Profession.sector.title',
            'Profession.sector.image'
        ],
        having: minRating ? sequelize.where(
            sequelize.fn('AVG', sequelize.col('Profile.User.professionalReviews.rating')),
            { [Op.gte]: minRating }
        ) : undefined,
    });



    return successResponse(res, 'success', professionals);

    // } catch (error: any) {
    //     return errorResponse(res, 'error', error.message || 'Something went wrong');
    // }
};




