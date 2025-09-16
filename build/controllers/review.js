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
exports.deleteReview = exports.editReview = exports.giveReview = void 0;
const body_1 = require("../validation/body");
const Models_1 = require("../models/Models");
const enum_1 = require("../utils/enum");
const modules_1 = require("../utils/modules");
const zod_1 = require("zod");
const giveReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.user;
        const result = body_1.addReviewSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                message: "Invalid data",
                error: result.error.format()
            });
        }
        const { review, jobId, orderId } = result.data;
        let user;
        let job;
        let order;
        if (jobId) {
            const existingReview = yield Models_1.Review.findOne({
                where: {
                    jobId,
                    clientUserId: id
                }
            });
            if (existingReview) {
                return (0, modules_1.handleResponse)(res, 400, false, 'You have already reviewed this job');
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
                return (0, modules_1.handleResponse)(res, 400, false, "You can only review approved jobs");
            }
            if (job.clientId != id) {
                return (0, modules_1.handleResponse)(res, 403, false, "You are not authorized to review this job");
            }
            user = job.professional;
        }
        if (orderId) {
            const existingReview = yield Models_1.Review.findOne({
                where: {
                    orderId,
                    clientUserId: id
                }
            });
            if (existingReview) {
                return (0, modules_1.handleResponse)(res, 400, false, 'You have already reviewed this order');
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
                return (0, modules_1.handleResponse)(res, 400, false, "You can only review orders that have been confirmed as delivered");
            }
            if (order.productTransaction.buyerId != id) {
                return (0, modules_1.handleResponse)(res, 403, false, "You are not authorized to review this order");
            }
            user = order.rider;
        }
        if (!user) {
            return (0, modules_1.handleResponse)(res, 404, false, "User not found");
        }
        if (!(user.role === enum_1.UserRole.PROFESSIONAL || user.role === enum_1.UserRole.DELIVERY)) {
            return (0, modules_1.handleResponse)(res, 400, false, "User is neither a professional nor delivery");
        }
        const reviewObj = yield Models_1.Review.create(Object.assign(Object.assign({ text: review, professionalUserId: user.id, clientUserId: id }, (user.role === enum_1.UserRole.DELIVERY ? { orderId } : {})), (user.role === enum_1.UserRole.PROFESSIONAL ? { jobId } : {})));
        return (0, modules_1.successResponse)(res, 'success', { reviewObj });
    }
    catch (error) {
        console.log(error);
        return (0, modules_1.errorResponse)(res, 'error', "Internal server error");
    }
});
exports.giveReview = giveReview;
const editReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { reviewId } = req.params;
        const { id } = req.user;
        const result = zod_1.z.object({
            review: zod_1.z.string().min(1)
        }).safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                message: "Invalid data",
                error: result.error.format()
            });
        }
        const { review } = result.data;
        const reviewObj = yield Models_1.Review.findByPk(reviewId);
        if (!reviewObj) {
            return (0, modules_1.errorResponse)(res, 'error', "Review not found");
        }
        if (reviewObj.clientUserId !== id) {
            return (0, modules_1.errorResponse)(res, 'error', "You are not authorized to edit this review");
        }
        reviewObj.text = review;
        yield reviewObj.save();
        return (0, modules_1.successResponse)(res, 'success', { reviewObj });
    }
    catch (error) {
        console.log(error);
        return (0, modules_1.errorResponse)(res, 'error', "Internal server error");
    }
});
exports.editReview = editReview;
const deleteReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { reviewId } = req.params;
        const { id } = req.user;
        const reviewObj = yield Models_1.Review.findByPk(reviewId);
        if (!reviewObj) {
            return (0, modules_1.errorResponse)(res, 'error', "Review not found");
        }
        if (reviewObj.clientUserId !== id) {
            return (0, modules_1.errorResponse)(res, 'error', "You are not authorized to delete this review");
        }
        yield reviewObj.destroy();
        return (0, modules_1.successResponse)(res, 'success', { message: "Review deleted successfully" });
    }
    catch (error) {
        console.log(error);
        return (0, modules_1.errorResponse)(res, 'error', "Internal server error");
    }
});
exports.deleteReview = deleteReview;
