import { Request, Response } from 'express';
const { Op } = require('sequelize');
import { Certification, Education, Experience, Location, Portfolio, Profession, Professional, Profile, Rating, Review, Sector, User } from '../models/Models';
import { successResponse, errorResponse, nestFlatKeys, handleResponse } from '../utils/modules';
import sequelize, { QueryTypes } from 'sequelize';
import dbsequelize from '../config/db';
import { professionalSearchQuerySchema } from '../validation/query';
import { profile } from 'console';
import { UserStatus } from '../utils/enum';




export const getProfessionals = async (req: Request, res: Response) => {
  try {

    const result = professionalSearchQuerySchema.safeParse(req.query);

    if (!result.success) {
      return res.status(400).json({
        error: "Invalid query parameters",
        issues: result.error.format(),
      });
    }

    const { professionId, profession, sector, span, state, lga, rating, page, limit, chargeFrom, allowUnverified = false } = result.data;
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
    }


    distanceQuery = `
  6371 * acos(
    cos(radians(${userLocation?.latitude})) * cos(radians(location.latitude)) *
    cos(radians(location.longitude) - radians(${userLocation?.longitude})) +
    sin(radians(${userLocation?.latitude})) * sin(radians(location.latitude))
  )
`;

    const professionals = await dbsequelize.query(
      `
    SELECT 
      Professional.id,
      Professional.chargeFrom,
      Professional.available,
      AVG(professionalRatings.value) AS avgRating,

      profile.id AS 'profile.id',
      profile.firstName AS 'profile.firstName',
      profile.lastName AS 'profile.lastName',
      profile.avatar AS 'profile.avatar',
      profile.verified AS 'profile.verified',
      profile.bvnVerified AS 'profile.bvnVerified',
      profile.userId AS 'profile.userId',

      user.id AS 'profile.user.id',
      user.email AS 'profile.user.email',
      user.phone AS 'profile.user.phone',
      user.status AS 'profile.user.status',
      user.role AS 'profile.user.role',
      user.createdAt AS 'profile.user.createdAt',
      user.updatedAt AS 'profile.user.updatedAt',

      location.id AS 'profile.user.location.id',
      location.address AS 'profile.user.location.address',
      location.lga AS 'profile.user.location.lga',
      location.state AS 'profile.user.location.state',
      location.latitude AS 'profile.user.location.latitude',
      location.longitude AS 'profile.user.location.longitude',
      location.zipcode AS 'profile.user.location.zipcode',
      location.userId AS 'profile.user.location.userId',
      location.createdAt AS 'profile.user.location.createdAt',
      location.updatedAt AS 'profile.user.location.updatedAt',
      ${span ? `(${distanceQuery}) AS 'profile.user.location.distance',` : ''}

      profession.id AS 'profession.id',
      profession.title AS 'profession.title',
      profession.image AS 'profession.image',
      profession.sectorId AS 'profession.sectorId',

      sector.id AS 'profession.sector.id',
      sector.title AS 'profession.sector.title',
      sector.image AS 'profession.sector.image'

    FROM professionals AS Professional
    LEFT JOIN profiles AS profile ON Professional.profileId = profile.id ${!allowUnverified ? 'AND profile.bvnVerified = true' : ''}
    LEFT JOIN users AS user ON profile.userId = user.id AND user.status = '${UserStatus.ACTIVE}'
    LEFT JOIN review AS professionalReviews ON user.id = professionalReviews.professionalUserId
    LEFT JOIN rating AS professionalRatings ON user.id = professionalRatings.professionalUserId
    INNER JOIN location AS location ON user.id = location.userId
      ${span || state || lga ? `
        AND (
          ${span ? `(${distanceQuery} <= ${span})` : '1=1'}
          ${state ? `AND location.state LIKE '%${state}%'` : ''}
          ${lga ? `AND location.lga LIKE '%${lga}%'` : ''}
        )
      ` : ''}
    INNER JOIN professions AS profession ON Professional.professionId = profession.id
      ${profession ? `AND profession.title LIKE '%${profession}%'` : ''}
    INNER JOIN sectors AS sector ON profession.sectorId = sector.id
      ${sector ? `AND sector.title LIKE '%${sector}%'` : ''}

    ${chargeFrom || professionId ? `WHERE ` : ''}
    ${chargeFrom ? `Professional.chargeFrom >= ${chargeFrom}` : ''}
    ${chargeFrom && professionId ? ' AND ' : ''}
    ${professionId ? `Professional.professionId = ${professionId}` : ''}

    GROUP BY 
      Professional.id,
      profile.id,
      profile.firstName,
      profile.lastName,
      profile.avatar,
      profile.verified,
      profile.userId,
      user.id,
      user.email,
      user.phone,
      user.status,
      user.role,
      user.createdAt,
      user.updatedAt,
      location.id,
      location.address,
      location.lga,
      location.state,
      location.latitude,
      location.longitude,
      location.zipcode,
      location.userId,
      location.createdAt,
      location.updatedAt,
      profession.id,
      profession.title,
      profession.image,
      profession.sectorId,
      sector.id,
      sector.title,
      sector.image

    ${minRating ? `HAVING avgRating >= ${minRating}` : ''}
    ORDER BY Professional.id ASC
    LIMIT ${limit} OFFSET ${offset};
  `,
      { type: QueryTypes.SELECT }
    );

    const nestedProfessionals = professionals.map(nestFlatKeys);


    return successResponse(res, 'success', nestedProfessionals);
  } catch (error: any) {
    console.log(error);
    return errorResponse(res, 'error', error.message || 'Something went wrong');
  }
}


export const getProfessionalById = async (req: Request, res: Response) => {
  try {
    const { professionalId } = req.params;

    const professional = await Professional.findOne({
      where: { id: professionalId },
      include: [
        {
          model: Profession,
          as: 'profession',
          include: [
            {
              model: Sector,
              as: 'sector',
            }
          ]
        },
        {
          model: Profile,
          as: 'profile',
          attributes: [
            'id', 'firstName', 'lastName', 'fcmToken', 'avatar', 'verified', 'notified',
            'totalJobs', 'totalExpense', 'rate', 'totalJobsDeclined', 'totalJobsPending',
            'count', 'totalJobsOngoing', 'totalJobsCompleted', 'totalReview',
            'totalJobsApproved', 'totalJobsCanceled', 'totalDisputes', 'bvn',
            'bvnVerified', 'switch', 'store', 'position', 'userId', 'createdAt', 'updatedAt'
          ],
          // where:{

          // },
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'email', 'phone', 'status', 'role', 'createdAt', 'updatedAt'],
              // where: {
              //   status: UserStatus.ACTIVE
              // },
              include: [
                {
                  model: Location,
                  as: 'location',
                  attributes: ['id', 'address', 'lga', 'state', 'latitude', 'longitude', 'zipcode']
                },
                {
                  model: Review,
                  as: 'professionalReviews',
                  attributes: ['id', 'text', 'professionalUserId', 'clientUserId', 'createdAt', 'updatedAt'],// used only for aggregation
                  include: [
                    {
                      model: User,
                      as: 'clientUser',
                      attributes: ['id', 'email', 'phone', 'status', 'role'],
                      include: [
                        {
                          model: Profile,
                          as: 'profile',
                          attributes: ['id', 'firstName', 'lastName', 'birthDate', 'avatar']
                        }
                      ]
                    }
                  ]
                },

              ]
            },
            {
              model: Education,
              as: 'education',
            },
            {
              model: Certification,
              as: 'certification'
            },
            {
              model: Portfolio,
              as: 'portfolio'
            },
            {
              model: Experience,
              as: 'experience'
            }
          ]
        }
      ],
      attributes: {
        include: [
          [
            dbsequelize.literal(`(
              SELECT AVG(value)
              FROM rating
              WHERE rating.professionalUserId = Profile.userId
            )`),
            'avgRating'
          ],
          [
            dbsequelize.literal(`(
              SELECT COUNT(*)
              FROM rating
              WHERE rating.professionalUserId = Profile.userId
            )`),
            'numRatings'
          ]
        ]
      },
      group: [
        'Professional.id',
        'Professional.file',
        'Professional.intro',
        'Professional.chargeFrom',
        'Professional.language',
        'Professional.available',
        'Professional.workType',
        'Professional.totalEarning',
        'Professional.completedAmount',
        'Professional.pendingAmount',
        'Professional.rejectedAmount',
        'Professional.availableWithdrawalAmount',
        'Professional.regNum',
        'Professional.yearsOfExp',
        'Professional.online',
        'Professional.profileId',
        'Professional.professionId',
        'Professional.createdAt',
        'Professional.updatedAt',

        'profession.id',
        'profession.title',
        'profession.image',
        'profession.sectorId',
        'profession.sector.id',
        'profession.sector.title',
        'profession.sector.image',

        'profile.id',
        'profile.firstName',
        'profile.lastName',
        'profile.fcmToken',
        'profile.avatar',
        'profile.verified',
        'profile.notified',
        'profile.totalJobs',
        'profile.totalExpense',
        'profile.rate',
        'profile.totalJobsDeclined',
        'profile.totalJobsPending',
        'profile.count',
        'profile.totalJobsOngoing',
        'profile.totalJobsCompleted',
        'profile.totalReview',
        'profile.totalJobsApproved',
        'profile.totalJobsCanceled',
        'profile.totalDisputes',
        'profile.bvn',
        'profile.bvnVerified',
        'profile.switch',
        'profile.store',
        'profile.position',
        // 'profile.userId',
        'profile.createdAt',
        'profile.updatedAt',

        'profile.user.id',
        'profile.user.email',
        'profile.user.phone',
        'profile.user.status',
        'profile.user.role',
        'profile.user.createdAt',
        'profile.user.updatedAt',

        'profile.user.location.id',
        'profile.user.location.address',
        'profile.user.location.lga',
        'profile.user.location.state',
        'profile.user.location.latitude',
        'profile.user.location.longitude',
        'profile.user.location.zipcode',
        'profile.user.professionalReviews.id',
        'profile.user.professionalReviews.text',
        'profile.user.professionalReviews.professionalUserId',
        'profile.user.professionalReviews.clientUserId',
        'profile.user.professionalReviews.createdAt',
        'profile.user.professionalReviews.updatedAt',

        'profile.user.professionalReviews.clientUser.id',
        'profile.user.professionalReviews.clientUser.email',
        'profile.user.professionalReviews.clientUser.phone',
        'profile.user.professionalReviews.clientUser.status',
        'profile.user.professionalReviews.clientUser.role',

        'profile.user.professionalReviews.clientUser.profile.id',
        'profile.user.professionalReviews.clientUser.profile.firstName',
        'profile.user.professionalReviews.clientUser.profile.lastName',
        'profile.user.professionalReviews.clientUser.profile.birthDate',
        'profile.user.professionalReviews.clientUser.profile.avatar',

        'profile.education.id',
        'profile.education.school',
        'profile.education.degreeType',
        'profile.education.course',
        'profile.education.startDate',
        'profile.education.gradDate',
        'profile.education.isCurrent',
        'profile.education.profileId',
        'profile.education.createdAt',
        'profile.education.updatedAt',

        'profile.certification.id',
        'profile.certification.title',
        'profile.certification.companyIssue',
        'profile.certification.date',
        'profile.certification.profileId',
        'profile.certification.createdAt',
        'profile.certification.updatedAt',

        'profile.portfolio.id',
        'profile.portfolio.title',
        'profile.portfolio.description',
        'profile.portfolio.duration',
        'profile.portfolio.date',
        'profile.portfolio.file',
        'profile.portfolio.profileId',
        'profile.portfolio.createdAt',
        'profile.portfolio.updatedAt',

        'profile.experience.id',
        'profile.experience.postHeld',
        'profile.experience.workPlace',
        'profile.experience.startDate',
        'profile.experience.endDate',
        'profile.experience.isCurrent',
        'profile.experience.description',
        'profile.experience.profileId',
        'profile.experience.createdAt',
        'profile.experience.updatedAt',
      ]
    });


    if (!professional) {
      return handleResponse(res, 404, false, 'Professional not found');
    }

    return successResponse(res, 'success', professional);
  } catch (error: any) {
    console.log(error)
    return errorResponse(res, 'error', error.message || 'Something went wrong');
  }
}



export const getProfessionalByUserId = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'fcmToken'] },
      include: [
        {
          model: Profile,
          include: [
            {
              model: Professional,
              include: [
                {
                  model: Profession,
                  include: [Sector]
                }
              ]
            },
            Education,
            Experience,
            Certification,
            Portfolio
          ]
        },
        {
          model: Location,
        }, {
          model: Review,
          as: 'professionalReviews',
          include: [
            {
              model: User,
              as: 'clientUser',
              include: [Profile]
            }
          ]
        }
      ]
    });


    if (!user) {
      return handleResponse(res, 404, false, 'Professional not found');
    }

    return successResponse(res, 'success', user);
  } catch (error: any) {
    return errorResponse(res, 'error', error.message || 'Something went wrong');
  }
}



export const getDeliveryMen = async (req: Request, res: Response) => {

}

export const toggleAvailable = async (req: Request, res: Response) => {
  const { id, role } = req.user

  const { available } = req.body

  try {
    const user = await User.findByPk(id, {
      attributes: ['id'],
      include: [{
        model: Profile,
        attributes: ['id', 'userId'],
        include: [Professional]
      }]
    })

    if (!user) {
      return handleResponse(res, 404, false, 'User not found');
    }

    if (!user.profile.professional) {
      return handleResponse(res, 404, false, 'User is not a professional');
    }

    user.profile.professional.available = available

    await user.profile.professional.save()
  } catch (error: any) {
    return errorResponse(res, 'error', error.message || 'Something went wrong');
  }
}


