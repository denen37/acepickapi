import { Request, Response } from 'express';
const { Op, fn, col, literal } = require('sequelize');
import { Cooperation, Profession, Profile, Review, Sector, User, Location } from '../models/Models';
import { successResponse, errorResponse } from '../utils/modules';
import sequelize from 'sequelize';
import { professionalSearchQuerySchema } from '../validation/query';

export const getCooperates = async (req: Request, res: Response) => {
    const { profession, sector } = req.query;

    try {
        const result = professionalSearchQuerySchema.safeParse(req.query);

        if (!result.success) {
            return res.status(400).json({
                error: "Invalid query parameters",
                issues: result.error.format(),
            });
        }

        const { profession, sector, span, state, lga, rating, page, limit, chargeFrom } = result.data;
        const { id } = req.user;

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


            distanceQuery = `
          6371 * acos(
            cos(radians(${userLocation?.latitude})) * cos(radians([profile->user->location].[latitude])) *
            cos(radians([profile->user->location].[longitude]) - radians(${userLocation?.longitude})) +
            sin(radians(${userLocation?.latitude})) * sin(radians([profile->user->location].[latitude]))
          )
        `;
        }

        // const cooperates = await Cooperation.findAll({
        //     attributes: [
        //         'id',
        //         'nameOfOrg',
        //         'address',
        //         'state',
        //         'lga',
        //     ],
        //     include: [
        //         {
        //             model: Profession,
        //             where: profession ? {
        //                 title: {
        //                     [Op.like]: `%${profession}%`
        //                 }
        //             } : undefined,
        //             include: [{
        //                 model: Sector,
        //                 where: sector ? {
        //                     title: {
        //                         [Op.like]: `%${sector}%`
        //                     }
        //                 } : undefined
        //             }]
        //         },
        //         {
        //             model: Profile,
        //             attributes: ['id', 'avatar'],
        //             include: [{
        //                 model: User,
        //                 attributes: ['id', 'role'],
        //             }]
        //         }
        //     ]
        // });


        // const reviewStats = await Review.findAll({
        //     attributes: [
        //         'professionalUserId',
        //         [fn('AVG', col('rating')), 'averageRating'],
        //         [fn('COUNT', col('id')), 'totalReviews']
        //     ],
        //     group: ['professionalUserId'],
        //     raw: true
        // });


        //console.log('Review Stats:', reviewStats.map((stat) => stat.dataValues));

        const cooperates = await Cooperation.findAll({
            offset,
            limit,
            attributes: {
                include: [
                    [sequelize.fn('AVG', sequelize.col('Profile.User.professionalReviews.rating')), 'avgRating'],
                    [sequelize.fn('COUNT', sequelize.col('Profile.User.professionalReviews.rating')), 'numRatings']
                ]
            },
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
                                    as: 'professionalReviews',
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
                                            span && sequelize.where(
                                                sequelize.literal(distanceQuery),
                                                { [Op.lte]: span }
                                            ),
                                            state && { state: { [Op.like]: `%${state}%` } },
                                            lga && { lga: { [Op.like]: `%${lga}%` } }
                                        ].filter(Boolean)
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    model: Profession,
                    where: profession ? { title: { [Op.like]: `%${profession}%` } } : undefined,
                    include: [
                        {
                            model: Sector,
                            where: sector ? { title: { [Op.like]: `%${sector}%` } } : undefined
                        }
                    ]
                }
            ],
            // group: [
            //     'Professional.id',
            //     'Profile.id',
            //     'Profile.User.id',
            //     'Profile.User.location.id',
            //     'Profession.id',
            //     'Profession.sector.id'
            // ],
            having: minRating
                ? sequelize.where(
                    sequelize.fn('AVG', sequelize.col('Profile.User.professionalReviews.rating')),
                    { [Op.gte]: minRating }
                )
                : undefined,
            order: [['id', 'ASC']],
        });



        return successResponse(res, 'success', cooperates);
    } catch (error) {
        return errorResponse(res, 'error', error);
    }
}