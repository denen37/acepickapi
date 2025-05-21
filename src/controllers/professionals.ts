import { Request, Response } from 'express';
const { Op } = require('sequelize');
import { Profession, Professional, Profile, Sector } from '../models/Models';
import { successResponse, errorResponse } from '../utils/modules';

export const getProfessionals = async (req: Request, res: Response) => {
    try {
        const { profession, sector } = req.query;

        const professionals = await Professional.findAll({
            where: {},
            attributes: ['id', 'chargeFrom', 'available'],
            include: [
                {
                    model: Profile,
                    attributes: ['id', 'firstName', 'lastName', 'avatar', 'verified', 'lga', 'state', 'userId']
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
                }
            ]
        });

        return successResponse(res, 'success', professionals);

    } catch (error: any) {
        return errorResponse(res, 'error', error.message || 'Something went wrong');
    }
};