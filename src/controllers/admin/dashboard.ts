import { Request, Response } from "express"
import { Order, User, Transaction, Activity, Profile } from '../../models/Models'
import { OrderStatus, TransactionStatus, TransactionType, UserRole } from "../../utils/enum";
import { Op, QueryTypes } from "sequelize";
import { errorResponse, successResponse, nestFlatKeys } from "../../utils/modules";
import { activitySchema } from "../../validation/query";
import dbsequelize from '../../config/db'
import z from "zod";

export const overviewStat = async (req: Request, res: Response) => {

    try {
        const totalUsers = await User.count();

        const clients = await User.count({
            where: {
                role: UserRole.CLIENT
            }
        })

        const professionals = await User.count({
            where: {
                role: UserRole.PROFESSIONAL
            }
        })

        const riders = await User.count({
            where: {
                role: UserRole.DELIVERY
            }
        })

        const corperates = await User.count({
            where: {
                role: UserRole.CORPERATE
            }
        })

        const admins = await User.count({
            where: {
                role: UserRole.ADMIN
            }
        })

        const activeOrders = await Order.count({
            where: {
                status: {
                    [Op.notIn]: [OrderStatus.CONFIRM_DELIVERY, OrderStatus.CANCELLED]
                }
            }
        });

        const activeDeliveries = await Order.count({
            where: {
                status: {
                    [Op.notIn]: [OrderStatus.PAID, OrderStatus.CONFIRM_DELIVERY, OrderStatus.CANCELLED]
                }
            }
        });

        //check it later error here

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const monthlyRevenue = await Transaction.sum('amount', {
            where: {
                status: TransactionStatus.SUCCESS,
                type: TransactionType.CREDIT,
                createdAt: {
                    [Op.gte]: startOfMonth,
                    [Op.lte]: new Date()
                }
            }
        });


        return successResponse(res, 'success', {
            totalUsers,
            clients,
            professionals,
            riders,
            corperates,
            admins,
            activeOrders,
            activeDeliveries,
            monthlyRevenue: monthlyRevenue ? monthlyRevenue : 0
        })
    } catch (error) {
        console.log(error)
        return errorResponse(res, 'error', 'Internal Server Error')
    }
}

export const getActivities = async (req: Request, res: Response) => {
    const result = activitySchema.safeParse(req.query);

    if (!result.success) {
        return res.status(400).json({
            status: false,
            message: 'Validation error',
            errors: result.error.flatten().fieldErrors,
        });
    }

    const { page, limit, search, type, status } = result.data;

    try {
        const activities = await Activity.findAndCountAll({
            where: {
                ...(type && { type }),
                ...(search && {
                    [Op.or]: [
                        { type: { [Op.like]: `%${search}%` } },
                        { action: { [Op.like]: `%${search}%` } },
                    ],
                }),
                ...(status && (status === 'all' ? {} : { status })),
            },
            offset: (page - 1) * limit,
            limit
        })

        return successResponse(res, 'success', { ...activities, page, limit })
    } catch (error) {
        console.log(error);
        return errorResponse(res, 'error', 'Something went wrong')
    }
}


function wilsonScore(
    avgRating: number,
    numRatings: number,
    maxRating: number = 5,
    confidence: number = 0.95
): number {
    if (numRatings === 0) return 0;

    const p = avgRating / maxRating;

    const z = confidence === 0.95 ? 1.96 : 1.64;
    const n = numRatings;

    const numerator =
        p +
        (z * z) / (2 * n) -
        z * Math.sqrt((p * (1 - p) + (z * z) / (4 * n)) / n);

    const denominator = 1 + (z * z) / n;

    return numerator / denominator * maxRating;
}



export const getTopPerformers = async (req: Request, res: Response) => {
    const result = z.object({
        page: z.coerce.number().int().positive().default(1),
        limit: z.coerce.number().int().positive().default(10),
    }).safeParse(req.query)

    if (!result.success) {
        return res.status(400).json({
            status: false,
            message: 'Validation error',
            errors: result.error.flatten().fieldErrors,
        });
    }

    const { page, limit } = result.data;

    try {
        const topPerformers = await dbsequelize.query(`
            WITH rating_stats AS (
              SELECT 
                professionalUserId,
                AVG(value) AS avgValue,
                COUNT(*) AS numRatings
              FROM rating
              GROUP BY professionalUserId
            )
            SELECT 
              u.id,
              u.email,
              u.phone,
              u.status,
              u.role,
              u.agreed,
              u.createdAt,
              u.updatedAt,
          
              p.id AS "profile.id",
              p.firstName AS "profile.firstName",
              p.lastName AS "profile.lastName",
              p.fcmToken AS "profile.fcmToken",
              p.avatar AS "profile.avatar",
              p.birthDate AS "profile.birthDate",
              p.verified AS "profile.verified",
              p.notified AS "profile.notified",
              p.totalJobs AS "profile.totalJobs",
              p.totalExpense AS "profile.totalExpense",
              p.rate AS "profile.rate",
              p.totalJobsDeclined AS "profile.totalJobsDeclined",
              p.totalJobsPending AS "profile.totalJobsPending",
              p.count AS "profile.count",
              p.totalJobsOngoing AS "profile.totalJobsOngoing",
              p.totalJobsCompleted AS "profile.totalJobsCompleted",
              p.totalReview AS "profile.totalReview",
              p.totalJobsApproved AS "profile.totalJobsApproved",
              p.totalJobsCanceled AS "profile.totalJobsCanceled",
              p.totalDisputes AS "profile.totalDisputes",
              p.bvn AS "profile.bvn",
              p.bvnVerified AS "profile.bvnVerified",
              p.switch AS "profile.switch",
              p.store AS "profile.store",
              p.position AS "profile.position",
              p.userId AS "profile.userId",
              p.createdAt AS "profile.createdAt",
              p.updatedAt AS "profile.updatedAt",
          
              IFNULL(ROUND(rs.avgValue, 1), 0) AS avgRating,
              IFNULL(rs.numRatings, 0) AS numRatings,
          
              (
                (
                  ( (IFNULL(rs.avgValue, 0) / 5)
                    + (POW(1.96,2) / (2 * rs.numRatings))
                    - 1.96 * SQRT((
                        ( (IFNULL(rs.avgValue, 0) / 5)
                          * (1 - (IFNULL(rs.avgValue, 0) / 5))
                        + POW(1.96,2) / (4 * rs.numRatings)
                      ) / rs.numRatings))
                  ) / (1 + POW(1.96,2)/rs.numRatings)
                ) * 5
              ) AS wilsonScore
          
            FROM users u
            LEFT JOIN profiles p ON u.id = p.userId
            LEFT JOIN rating_stats rs ON rs.professionalUserId = u.id
            WHERE u.role IN ('professional', 'delivery')
            ORDER BY wilsonScore DESC
            LIMIT ${limit} OFFSET ${(page - 1) * limit}
          `, {
            type: QueryTypes.SELECT
        });


        const nestedData = topPerformers.map(nestFlatKeys);

        return successResponse(res, 'success', nestedData)
    } catch (error) {
        console.log(error)
        return errorResponse(res, 'error', 'Something went wrong')
    }
}