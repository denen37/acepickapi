import { Request, Response } from 'express';
const { Op } = require('sequelize');
import { Location, Profession, Professional, Profile, Sector, User } from '../models/Models';
import { successResponse, errorResponse } from '../utils/modules';
import sequelize from 'sequelize';


const lat = 7.7322
const lng = 8.5391
const radiusInKm = 300; // radius in kilometers

const distanceQuery = `
  6371 * acos(
    cos(radians(${lat})) * cos(radians([location].[latitude])) *
    cos(radians([location].[longitude]) - radians(${lng})) +
    sin(radians(${lat})) * sin(radians([location].[latitude]))
  )
`;


export const getProfessionals = async (req: Request, res: Response) => {
    // try {
    const { profession, sector, span } = req.query;

    const spanValue = parseInt(span as string, 10) || 0;

    const { id } = req.user;

    // const userLocation = await Location.findAll({
    //     where: {
    //         userId: id
    //     }
    // })

    const professionals = await Professional.findAll({
        attributes: ['id', 'chargeFrom', 'available'],
        include: [
            {
                model: Profile,
                attributes: ['id', 'firstName', 'lastName', 'avatar', 'verified', 'lga', 'state', 'userId'],
                include: [
                    {
                        model: User,
                        include: [
                            {
                                model: Location,
                                attributes: {
                                    include: [
                                        [sequelize.literal(distanceQuery), 'distance']
                                    ]
                                },
                                where: sequelize.where(
                                    sequelize.literal(distanceQuery),
                                    { [Op.lte]: radiusInKm }
                                )
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

    // } catch (error: any) {
    //     return errorResponse(res, 'error', error.message || 'Something went wrong');
    // }
};




