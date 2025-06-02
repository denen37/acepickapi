import { Request, Response } from 'express';
const { Op } = require('sequelize');
import { Location, Profession, Professional, Profile, Review, Sector, User } from '../models/Models';
import { successResponse, errorResponse, nestFlatKeys } from '../utils/modules';
import sequelize, { QueryTypes } from 'sequelize';
import dbSequelize from '../config/db';
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

    const { profession, sector, span, state, lga, rating, page, limit, chargeFrom } = result.data;
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


        distanceQuery = `
  6371 * acos(
    cos(radians(${userLocation?.latitude})) * cos(radians([profile->user->location].[latitude])) *
    cos(radians([profile->user->location].[longitude]) - radians(${userLocation?.longitude})) +
    sin(radians(${userLocation?.latitude})) * sin(radians([profile->user->location].[latitude]))
  )
`;
    }

    const professionals = await dbSequelize.query(
        `
          SELECT [Professional].[id], 
                 [Professional].[chargeFrom], 
                 [Professional].[available], 
                 AVG([profile->user->professionalReviews].[rating]) AS [avgRating], 
                 [profile].[id] AS [profile.id], 
                 [profile].[firstName] AS [profile.firstName], 
                 [profile].[lastName] AS [profile.lastName], 
                 [profile].[avatar] AS [profile.avatar], 
                 [profile].[verified] AS [profile.verified], 
                 [profile].[userId] AS [profile.userId], 
                 [profile->user].[id] AS [profile.user.id], 
                 [profile->user].[email] AS [profile.user.email], 
                 [profile->user].[phone] AS [profile.user.phone], 
                 [profile->user].[status] AS [profile.user.status], 
                 [profile->user].[role] AS [profile.user.role], 
                 [profile->user].[createdAt] AS [profile.user.createdAt], 
                 [profile->user].[updatedAt] AS [profile.user.updatedAt], 
                 [profile->user->location].[id] AS [profile.user.location.id], 
                 [profile->user->location].[address] AS [profile.user.location.address], 
                 [profile->user->location].[lga] AS [profile.user.location.lga], 
                 [profile->user->location].[state] AS [profile.user.location.state], 
                 [profile->user->location].[latitude] AS [profile.user.location.latitude], 
                 [profile->user->location].[longitude] AS [profile.user.location.longitude], 
                 [profile->user->location].[zipcode] AS [profile.user.location.zipcode], 
                 [profile->user->location].[userId] AS [profile.user.location.userId], 
                 [profile->user->location].[createdAt] AS [profile.user.location.createdAt],
                 [profile->user->location].[updatedAt] AS [profile.user.location.updatedAt],
                 ${span ? `(${distanceQuery}) AS [profile.user.location.distance],` : ''} 
                 [profession].[id] AS [profession.id], 
                 [profession].[title] AS [profession.title], 
                 [profession].[image] AS [profession.image], 
                 [profession].[sectorId] AS [profession.sectorId], 
                 [profession->sector].[id] AS [profession.sector.id],
                 [profession->sector].[title] AS [profession.sector.title],
                 [profession->sector].[image] AS [profession.sector.image] 
          FROM [professionals] AS [Professional] 
          LEFT OUTER JOIN [profiles] AS [profile] 
              ON [Professional].[profileId] = [profile].[id] 
          LEFT OUTER JOIN (
              [users] AS [profile->user] 
              LEFT OUTER JOIN [review] AS [profile->user->professionalReviews] 
                  ON [profile->user].[id] = [profile->user->professionalReviews].[professionalUserId] 
              INNER JOIN [location] AS [profile->user->location] 
                  ON [profile->user].[id] = [profile->user->location].[userId] 
                  ${span || state || lga ? `
                  AND (
                      ${span ? `(${distanceQuery} <= ${span})` : '1=1'}
                      ${state ? ` AND [profile->user->location].[state] LIKE N'%${state}%'` : ''}
                      ${lga ? ` AND [profile->user->location].[lga] LIKE N'%${lga}%'` : ''}
                  )` : ''}
          ) ON [profile].[userId] = [profile->user].[id] 
          INNER JOIN [professions] AS [profession] 
              ON [Professional].[professionId] = [profession].[id] 
              ${profession ? `AND [profession].[title] LIKE N'%${profession}%'` : ''} 
          INNER JOIN [sectors] AS [profession->sector] 
              ON [profession].[sectorId] = [profession->sector].[id] 
              ${sector ? `AND [profession->sector].[title] LIKE N'%${sector}%'` : ''}
      
          ${chargeFrom ? `WHERE [Professional].[chargeFrom] >= ${chargeFrom}` : ''}
      
          GROUP BY 
              [Professional].[id], [Professional].[chargeFrom], [Professional].[available], 
              [profile].[id], [profile].[firstName], [profile].[lastName], [profile].[avatar], 
              [profile].[verified], [profile].[userId], 
              [profile->user].[id], [profile->user].[email], [profile->user].[phone], 
              [profile->user].[status], [profile->user].[role], 
              [profile->user].[createdAt], [profile->user].[updatedAt], 
              [profile->user->location].[id], [profile->user->location].[address], 
              [profile->user->location].[lga], [profile->user->location].[state], 
              [profile->user->location].[latitude], [profile->user->location].[longitude], 
              [profile->user->location].[zipcode], [profile->user->location].[userId], 
              [profile->user->location].[createdAt], [profile->user->location].[updatedAt], 
              [profession].[id], [profession].[title], [profession].[image], 
              [profession].[sectorId], [profession->sector].[id], 
              [profession->sector].[title], [profession->sector].[image] 
      
          ${minRating ? `HAVING AVG([profile->user->professionalReviews].[rating]) >= ${minRating}` : ''}
          
          ORDER BY [Professional].[id] ASC
          OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY;
        `,
        {
            type: QueryTypes.SELECT
        }
    );

    const nestedProfessionals = professionals.map(nestFlatKeys);


    return successResponse(res, 'success', nestedProfessionals);



    // } catch (error: any) {
    //     return errorResponse(res, 'error', error.message || 'Something went wrong');
    // }
};

export const getProfessionalById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const professional = await Professional.findByPk(id, {
            include: [
                {
                    model: Profile,
                    include: [
                        {
                            model: User,
                            attributes: ['id', 'email', 'phone', 'status', 'role', 'createdAt', 'updatedAt'],
                            include: [
                                {
                                    model: Location,
                                    attributes: ['id', 'address', 'lga', 'state', 'latitude', 'longitude', 'zipcode'],
                                },
                                {
                                    model: Review,
                                    as: 'professionalReviews',

                                }
                            ]

                        }
                    ]
                }
            ]
        })

        if (!professional) {
            return errorResponse(res, 'Professional not found');
        }

        return successResponse(res, 'success', professional);
    } catch (error: any) {
        return errorResponse(res, 'error', error.message || 'Something went wrong');
    }
}





