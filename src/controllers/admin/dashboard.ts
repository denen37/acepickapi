import { Request, Response } from "express"
import { Order, User, Transaction, Activity } from '../../models/Models'
import { OrderStatus, TransactionStatus, TransactionType, UserRole } from "../../utils/enum";
import { Op } from "sequelize";
import { errorResponse, successResponse } from "../../utils/modules";
import { activitySchema } from "../../validation/query";

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