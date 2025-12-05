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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderStats = exports.avgRating = exports.getJobStats = void 0;
const Job_1 = require("../../models/Job");
const enum_1 = require("../../utils/enum");
const modules_1 = require("../../utils/modules");
const Models_1 = require("../../models/Models");
const db_1 = __importDefault(require("../../config/db"));
const getJobStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Fetching job statistics...");
    try {
        const totalJobs = yield Job_1.Job.count();
        const pendingJobs = yield Job_1.Job.count({
            where: {
                status: enum_1.JobStatus.PENDING
            }
        });
        const ongoingJobs = yield Job_1.Job.count({
            where: {
                status: enum_1.JobStatus.ONGOING
            }
        });
        const completedJobs = yield Job_1.Job.count({
            where: {
                status: enum_1.JobStatus.COMPLETED
            }
        });
        const rejectedJobs = yield Job_1.Job.count({
            where: {
                status: enum_1.JobStatus.REJECTED
            }
        });
        const approvedJobs = yield Job_1.Job.count({
            where: {
                status: enum_1.JobStatus.APPROVED
            }
        });
        const disputedJobs = yield Job_1.Job.count({
            where: {
                status: enum_1.JobStatus.DISPUTED
            }
        });
        return (0, modules_1.successResponse)(res, 'success', {
            totalJobs,
            pendingJobs,
            ongoingJobs,
            completedJobs,
            rejectedJobs,
            approvedJobs,
            disputedJobs,
        });
    }
    catch (error) {
        console.log(error);
        return (0, modules_1.errorResponse)(res, 'error', 'Internal server error');
    }
});
exports.getJobStats = getJobStats;
const avgRating = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const avgRating = yield Models_1.Rating.findOne({
            attributes: [[db_1.default.fn('AVG', db_1.default.col('value')), 'avgRating']],
            raw: true,
        });
        if (!avgRating || !avgRating.avgRating) {
            return (0, modules_1.successResponse)(res, 'success', { avgRating: 0 });
        }
        return (0, modules_1.successResponse)(res, 'success', { avgRating: parseFloat(Number(avgRating.avgRating).toFixed(2)) });
    }
    catch (error) {
        console.log(error);
        return (0, modules_1.errorResponse)(res, 'error', 'Internal server error');
    }
});
exports.avgRating = avgRating;
const getOrderStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalOrders = yield Models_1.Order.count();
        const pendingOrders = yield Models_1.Order.count({
            where: {
                status: enum_1.OrderStatus.PENDING
            }
        });
        const acceptedOrders = yield Models_1.Order.count({
            where: {
                status: enum_1.OrderStatus.ACCEPTED
            }
        });
        const paidOrders = yield Models_1.Order.count({
            where: {
                status: enum_1.OrderStatus.PAID
            }
        });
        const pickedUpOrders = yield Models_1.Order.count({
            where: {
                status: enum_1.OrderStatus.PICKED_UP
            }
        });
        const inTransitOrders = yield Models_1.Order.count({
            where: {
                status: enum_1.OrderStatus.IN_TRANSIT
            }
        });
        const deliveredOrders = yield Models_1.Order.count({
            where: {
                status: enum_1.OrderStatus.DELIVERED
            }
        });
        const confirmedDeliveryOrders = yield Models_1.Order.count({
            where: {
                status: enum_1.OrderStatus.CONFIRM_DELIVERY
            }
        });
        const cancelledOrders = yield Models_1.Order.count({
            where: {
                status: enum_1.OrderStatus.CANCELLED
            }
        });
        return (0, modules_1.successResponse)(res, 'success', {
            totalOrders,
            pendingOrders,
            paidOrders,
            acceptedOrders,
            pickedUpOrders,
            inTransitOrders,
            deliveredOrders,
            confirmedDeliveryOrders,
            cancelledOrders,
        });
    }
    catch (error) {
        console.log(error);
        return (0, modules_1.errorResponse)(res, 'error', 'Internal server error');
    }
});
exports.getOrderStats = getOrderStats;
