import { Request, Response } from "express";
import { addRatingSchema } from "../validation/body";
import { Rating } from "../models/Rating";
import { Job, Order, ProductTransaction, User } from "../models/Models";
import { JobStatus, OrderStatus, UserRole } from "../utils/enum";
import { errorResponse, handleResponse, successResponse } from "../utils/modules";
import z from "zod";
import { isRatedSchema } from "../validation/query";

export const giveRating = async (req: Request, res: Response) => {
    try {
        const { id } = req.user;

        const result = addRatingSchema.safeParse(req.body)

        if (!result.success) {
            return res.status(400).json({
                message: "Invalid data",
                error: result.error.format()
            })
        }

        const { rating, jobId, orderId } = result.data

        let user;
        let job;
        let order;

        if (jobId) {
            const existingRating = await Rating.findOne({
                where: {
                    jobId,
                    clientUserId: id
                }
            })

            if (existingRating) {
                return handleResponse(res, 400, false, 'You have already rated this job')
            }

            job = await Job.findByPk(jobId, {
                include: [{
                    model: User,
                    as: "professional"
                }]
            })

            if (!job) {
                return handleResponse(res, 404, false, "Job not found");
            }

            if (job.status !== JobStatus.APPROVED) {
                return handleResponse(res, 400, false, "You can only rate approved jobs");
            }

            if (job.clientId != id) {
                return handleResponse(res, 403, false, "You are not authorized to rate this job");
            }

            user = job.professional;
        }

        if (orderId) {
            const existingRating = await Rating.findOne({
                where: {
                    orderId,
                    clientUserId: id
                }
            })

            if (existingRating) {
                return handleResponse(res, 400, false, 'You have already rated this order')
            }

            order = await Order.findByPk(orderId, {
                include: [{
                    model: User,
                    as: "rider"
                }, {
                    model: ProductTransaction
                }]
            })

            if (!order) {
                return handleResponse(res, 404, false, "Order not found");
            }

            if (order.status !== OrderStatus.CONFIRM_DELIVERY) {
                return handleResponse(res, 400, false, "You can only rate orders that have been confirmed as delivered");
            }

            if (order.productTransaction.buyerId != id) {
                return handleResponse(res, 403, false, "You are not authorized to rate this order");
            }

            user = order.rider;
        }

        if (!user) {
            return handleResponse(res, 404, false, "User not found");
        }

        if (!(user.role === UserRole.PROFESSIONAL || user.role === UserRole.DELIVERY)) {
            return handleResponse(res, 400, false, "User is neither a professional nor delivery");
        }

        const ratingObj = await Rating.create({
            value: rating,
            professionalUserId: user.id,
            clientUserId: id,
            ...(user.role === UserRole.DELIVERY ? { orderId } : {}),
            ...(user.role === UserRole.PROFESSIONAL ? { jobId } : {})
        });


        return successResponse(res, 'success', ratingObj)
    } catch (error) {
        console.log(error)
        return errorResponse(res, 'error', "Internal server error")
    }
}

export const isRated = async (req: Request, res: Response) => {
    const result = isRatedSchema.safeParse(req.query);

    if (!result.success) {
        return res.status(400).json({
            message: "Invalid data",
            error: result.error.format()
        })
    }

    const { jobId, orderId } = result.data;

    try {
        const rating = await Rating.findOne({
            where: {
                clientUserId: req.user.id,
                ...(jobId ? { jobId } : {}),
                ...(orderId ? { orderId } : {})
            }
        })

        return successResponse(res, 'success', { rated: !!rating })
    } catch (error) {
        console.log(error)
        return errorResponse(res, 'error', "Internal server error")
    }
}