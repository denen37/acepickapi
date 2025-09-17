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
exports.getTopPerformers = exports.getActivities = exports.overviewStat = void 0;
const Models_1 = require("../../models/Models");
const enum_1 = require("../../utils/enum");
const sequelize_1 = require("sequelize");
const modules_1 = require("../../utils/modules");
const query_1 = require("../../validation/query");
const db_1 = __importDefault(require("../../config/db"));
const zod_1 = __importDefault(require("zod"));
const overviewStat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalUsers = yield Models_1.User.count();
        const clients = yield Models_1.User.count({
            where: {
                role: enum_1.UserRole.CLIENT
            }
        });
        const professionals = yield Models_1.User.count({
            where: {
                role: enum_1.UserRole.PROFESSIONAL
            }
        });
        const riders = yield Models_1.User.count({
            where: {
                role: enum_1.UserRole.DELIVERY
            }
        });
        const corperates = yield Models_1.User.count({
            where: {
                role: enum_1.UserRole.CORPERATE
            }
        });
        const admins = yield Models_1.User.count({
            where: {
                role: enum_1.UserRole.ADMIN
            }
        });
        const activeOrders = yield Models_1.Order.count({
            where: {
                status: {
                    [sequelize_1.Op.notIn]: [enum_1.OrderStatus.CONFIRM_DELIVERY, enum_1.OrderStatus.CANCELLED]
                }
            }
        });
        const activeDeliveries = yield Models_1.Order.count({
            where: {
                status: {
                    [sequelize_1.Op.notIn]: [enum_1.OrderStatus.PAID, enum_1.OrderStatus.CONFIRM_DELIVERY, enum_1.OrderStatus.CANCELLED]
                }
            }
        });
        //check it later error here
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const monthlyRevenue = yield Models_1.Transaction.sum('amount', {
            where: {
                status: enum_1.TransactionStatus.SUCCESS,
                type: enum_1.TransactionType.CREDIT,
                createdAt: {
                    [sequelize_1.Op.gte]: startOfMonth,
                    [sequelize_1.Op.lte]: new Date()
                }
            }
        });
        return (0, modules_1.successResponse)(res, 'success', {
            totalUsers,
            clients,
            professionals,
            riders,
            corperates,
            admins,
            activeOrders,
            activeDeliveries,
            monthlyRevenue: monthlyRevenue ? monthlyRevenue : 0
        });
    }
    catch (error) {
        console.log(error);
        return (0, modules_1.errorResponse)(res, 'error', 'Internal Server Error');
    }
});
exports.overviewStat = overviewStat;
const getActivities = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = query_1.activitySchema.safeParse(req.query);
    if (!result.success) {
        return res.status(400).json({
            status: false,
            message: 'Validation error',
            errors: result.error.flatten().fieldErrors,
        });
    }
    const { page, limit, search, type, status } = result.data;
    try {
        const activities = yield Models_1.Activity.findAndCountAll({
            where: Object.assign(Object.assign(Object.assign({}, (type && { type })), (search && {
                [sequelize_1.Op.or]: [
                    { type: { [sequelize_1.Op.like]: `%${search}%` } },
                    { action: { [sequelize_1.Op.like]: `%${search}%` } },
                ],
            })), (status && (status === 'all' ? {} : { status }))),
            offset: (page - 1) * limit,
            limit
        });
        return (0, modules_1.successResponse)(res, 'success', Object.assign(Object.assign({}, activities), { page, limit }));
    }
    catch (error) {
        console.log(error);
        return (0, modules_1.errorResponse)(res, 'error', 'Something went wrong');
    }
});
exports.getActivities = getActivities;
function wilsonScore(avgRating, numRatings, maxRating = 5, confidence = 0.95) {
    if (numRatings === 0)
        return 0;
    const p = avgRating / maxRating;
    const z = confidence === 0.95 ? 1.96 : 1.64;
    const n = numRatings;
    const numerator = p +
        (z * z) / (2 * n) -
        z * Math.sqrt((p * (1 - p) + (z * z) / (4 * n)) / n);
    const denominator = 1 + (z * z) / n;
    return numerator / denominator * maxRating;
}
const getTopPerformers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = zod_1.default.object({
        page: zod_1.default.coerce.number().int().positive().default(1),
        limit: zod_1.default.coerce.number().int().positive().default(10),
    }).safeParse(req.query);
    if (!result.success) {
        return res.status(400).json({
            status: false,
            message: 'Validation error',
            errors: result.error.flatten().fieldErrors,
        });
    }
    const { page, limit } = result.data;
    try {
        const topPerformers = yield db_1.default.query(`
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
            type: sequelize_1.QueryTypes.SELECT
        });
        const nestedData = topPerformers.map(modules_1.nestFlatKeys);
        return (0, modules_1.successResponse)(res, 'success', nestedData);
    }
    catch (error) {
        console.log(error);
        return (0, modules_1.errorResponse)(res, 'error', 'Something went wrong');
    }
});
exports.getTopPerformers = getTopPerformers;
