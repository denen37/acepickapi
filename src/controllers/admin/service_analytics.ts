import { Request, Response } from "express"
import { Job } from "../../models/Job"
import { JobStatus, OrderStatus } from "../../utils/enum";
import { errorResponse, successResponse } from "../../utils/modules";
import { Order, Rating } from "../../models/Models";
import sequelize from "../../config/db";

export const getJobStats = async (req: Request, res: Response) => {
    console.log("Fetching job statistics...");
    try {
        const totalJobs = await Job.count();

        const pendingJobs = await Job.count({
            where: {
                status: JobStatus.PENDING
            }
        });

        const ongoingJobs = await Job.count({
            where: {
                status: JobStatus.ONGOING
            }
        });

        const completedJobs = await Job.count({
            where: {
                status: JobStatus.COMPLETED
            }
        });

        const rejectedJobs = await Job.count({
            where: {
                status: JobStatus.REJECTED
            }
        });

        const approvedJobs = await Job.count({
            where: {
                status: JobStatus.APPROVED
            }
        });

        const disputedJobs = await Job.count({
            where: {
                status: JobStatus.DISPUTED
            }
        });

        return successResponse(res, 'success', {
            totalJobs,
            pendingJobs,
            ongoingJobs,
            completedJobs,
            rejectedJobs,
            approvedJobs,
            disputedJobs,
        });
    } catch (error) {
        console.log(error);
        return errorResponse(res, 'error', 'Internal server error')
    }
}

export const avgRating = async (req: Request, res: Response) => {
    try {
        const avgRating = await Rating.findOne({
            attributes: [[sequelize.fn('AVG', sequelize.col('value')), 'avgRating']],
            raw: true,
        });

        if (!avgRating || !avgRating.avgRating) {
            return successResponse(res, 'success', { avgRating: 0 });
        }

        return successResponse(res, 'success', { avgRating: parseFloat(Number(avgRating.avgRating).toFixed(2)) });
    } catch (error) {
        console.log(error);
        return errorResponse(res, 'error', 'Internal server error');
    }
}

export const getOrderStats = async (req: Request, res: Response) => {
    try {
        const totalOrders = await Order.count();

        const pendingOrders = await Order.count({
            where: {
                status: OrderStatus.PENDING
            }
        })

        const acceptedOrders = await Order.count({
            where: {
                status: OrderStatus.ACCEPTED
            }
        })

        const paidOrders = await Order.count({
            where: {
                status: OrderStatus.PAID
            }
        })

        const pickedUpOrders = await Order.count({
            where: {
                status: OrderStatus.PICKED_UP
            }
        })

        const inTransitOrders = await Order.count({
            where: {
                status: OrderStatus.IN_TRANSIT
            }
        })

        const deliveredOrders = await Order.count({
            where: {
                status: OrderStatus.DELIVERED
            }
        })

        const confirmedDeliveryOrders = await Order.count({
            where: {
                status: OrderStatus.CONFIRM_DELIVERY
            }
        })

        const cancelledOrders = await Order.count({
            where: {
                status: OrderStatus.CANCELLED
            }
        })

        return successResponse(res, 'success', {
            totalOrders,
            pendingOrders,
            paidOrders,
            acceptedOrders,
            pickedUpOrders,
            inTransitOrders,
            deliveredOrders,
            confirmedDeliveryOrders,
            cancelledOrders,
        })
    } catch (error) {
        console.log(error);
        return errorResponse(res, 'error', 'Internal server error');
    }
} 