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
exports.getActivities = exports.overviewStat = void 0;
const Models_1 = require("../../models/Models");
const enum_1 = require("../../utils/enum");
const sequelize_1 = require("sequelize");
const modules_1 = require("../../utils/modules");
const query_1 = require("../../validation/query");
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
