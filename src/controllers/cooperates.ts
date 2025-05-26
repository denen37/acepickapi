import { Request, Response } from 'express';
const { Op, fn, col, literal } = require('sequelize');
import { Cooperation, Profession, Profile, Review, Sector, User } from '../models/Models';
import { successResponse, errorResponse } from '../utils/modules';

export const getCooperates = async (req: Request, res: Response) => {
    const { profession, sector } = req.query;

    try {
        const cooperates = await Cooperation.findAll({
            attributes: [
                'id',
                'nameOfOrg',
                'address',
                'state',
                'lga',
            ],
            include: [
                {
                    model: Profession,
                    where: profession ? {
                        title: {
                            [Op.like]: `%${profession}%`
                        }
                    } : undefined,
                    include: [{
                        model: Sector,
                        where: sector ? {
                            title: {
                                [Op.like]: `%${sector}%`
                            }
                        } : undefined
                    }]
                },
                {
                    model: Profile,
                    attributes: ['id', 'avatar'],
                    include: [{
                        model: User,
                        attributes: ['id', 'role'],
                    }]
                }
            ]
        });


        const reviewStats = await Review.findAll({
            attributes: [
                'professionalUserId',
                [fn('AVG', col('rating')), 'averageRating'],
                [fn('COUNT', col('id')), 'totalReviews']
            ],
            group: ['professionalUserId'],
            raw: true
        });


        console.log('Review Stats:', reviewStats.map((stat) => stat.dataValues));


        return successResponse(res, 'success', cooperates);
    } catch (error) {
        return errorResponse(res, 'error', error);
    }
}