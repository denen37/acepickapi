"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRated = exports.giveRating = void 0;
const body_1 = require("../validation/body");
const Rating_1 = require("../models/Rating");
const Models_1 = require("../models/Models");
const enum_1 = require("../utils/enum");
const modules_1 = require("../utils/modules");
const query_1 = require("../validation/query");
const giveRating = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.user;
        const result = body_1.addRatingSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                message: "Invalid data",
                error: result.error.format()
            });
        }
        const { rating, jobId, orderId } = result.data;
        let user;
        let job;
        let order;
        if (jobId) {
            const existingRating = yield Rating_1.Rating.findOne({
                where: {
                    jobId,
                    clientUserId: id
                }
            });
            if (existingRating) {
                return (0, modules_1.handleResponse)(res, 400, false, 'You have already rated this job');
            }
            job = yield Models_1.Job.findByPk(jobId, {
                include: [{
                        model: Models_1.User,
                        as: "professional"
                    }]
            });
            if (!job) {
                return (0, modules_1.handleResponse)(res, 404, false, "Job not found");
            }
            if (job.status !== enum_1.JobStatus.APPROVED) {
                return (0, modules_1.handleResponse)(res, 400, false, "You can only rate approved jobs");
            }
            if (job.clientId != id) {
                return (0, modules_1.handleResponse)(res, 403, false, "You are not authorized to rate this job");
            }
            user = job.professional;
        }
        if (orderId) {
            const existingRating = yield Rating_1.Rating.findOne({
                where: {
                    orderId,
                    clientUserId: id
                }
            });
            if (existingRating) {
                return (0, modules_1.handleResponse)(res, 400, false, 'You have already rated this order');
            }
            order = yield Models_1.Order.findByPk(orderId, {
                include: [{
                        model: Models_1.User,
                        as: "rider"
                    }, {
                        model: Models_1.ProductTransaction
                    }]
            });
            if (!order) {
                return (0, modules_1.handleResponse)(res, 404, false, "Order not found");
            }
            if (order.status !== enum_1.OrderStatus.CONFIRM_DELIVERY) {
                return (0, modules_1.handleResponse)(res, 400, false, "You can only rate orders that have been confirmed as delivered");
            }
            if (order.productTransaction.buyerId != id) {
                return (0, modules_1.handleResponse)(res, 403, false, "You are not authorized to rate this order");
            }
            user = order.rider;
        }
        if (!user) {
            return (0, modules_1.handleResponse)(res, 404, false, "User not found");
        }
        if (!(user.role === enum_1.UserRole.PROFESSIONAL || user.role === enum_1.UserRole.DELIVERY)) {
            return (0, modules_1.handleResponse)(res, 400, false, "User is neither a professional nor delivery");
        }
        const ratingObj = yield Rating_1.Rating.create(Object.assign(Object.assign({ value: rating, professionalUserId: user.id, clientUserId: id }, (user.role === enum_1.UserRole.DELIVERY ? { orderId } : {})), (user.role === enum_1.UserRole.PROFESSIONAL ? { jobId } : {})));
        return (0, modules_1.successResponse)(res, 'success', ratingObj);
    }
    catch (error) {
        console.log(error);
        return (0, modules_1.errorResponse)(res, 'error', "Internal server error");
    }
});
exports.giveRating = giveRating;
const isRated = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = query_1.isRatedSchema.safeParse(req.query);
    if (!result.success) {
        return res.status(400).json({
            message: "Invalid data",
            error: result.error.format()
        });
    }
    const { jobId, orderId } = result.data;
    try {
        const rating = yield Rating_1.Rating.findOne({
            where: Object.assign(Object.assign({ clientUserId: req.user.id }, (jobId ? { jobId } : {})), (orderId ? { orderId } : {}))
        });
        return (0, modules_1.successResponse)(res, 'success', { rated: !!rating });
    }
    catch (error) {
        console.log(error);
        return (0, modules_1.errorResponse)(res, 'error', "Internal server error");
    }
});
exports.isRated = isRated;
