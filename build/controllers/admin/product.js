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
exports.rejectProducts = exports.approveProducts = exports.getProducts = void 0;
const query_1 = require("../../validation/query");
const modules_1 = require("../../utils/modules");
const sequelize_1 = require("sequelize");
const Models_1 = require("../../models/Models");
const notification_1 = require("../../services/notification");
const messages_1 = require("../../utils/messages");
const gmail_1 = require("../../services/gmail");
const getProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = query_1.getProductSchema.safeParse(req.query);
    if (!result.success) {
        return res.status(400).json({
            status: false,
            message: 'Validation error',
            errors: result.error.flatten().fieldErrors,
        });
    }
    const { approved, categoryId, category, search, state, lga, locationId, page, limit, orderBy, orderDir } = result.data;
    try {
        const data = yield Models_1.Product.findAndCountAll({
            where: Object.assign(Object.assign(Object.assign(Object.assign({}, (approved !== undefined && { approved })), (categoryId && { categoryId })), (search && { name: { [sequelize_1.Op.like]: `%${search}%` } })), (locationId && { locationId })),
            limit: limit,
            offset: (page - 1) * limit,
            include: [
                {
                    model: Models_1.Category,
                    attributes: ['id', 'name', 'description'],
                    where: Object.assign({}, (category && { name: { [sequelize_1.Op.like]: `%${category}%` } }))
                },
                {
                    model: Models_1.Location,
                    where: Object.assign(Object.assign({}, (state && { state: { [sequelize_1.Op.like]: `%${state}%` } })), (lga && { lga: { [sequelize_1.Op.like]: `%${lga}%` } }))
                    //attributes: ['id', 'name', 'description'],
                },
            ],
            order: [[orderBy || 'createdAt', orderDir || 'DESC']]
        });
        return (0, modules_1.successResponse)(res, 'success', {
            products: data.rows.map((product) => {
                const plainProduct = product.toJSON();
                return Object.assign(Object.assign({}, plainProduct), { images: JSON.parse(plainProduct.images || '[]') });
            }),
            page: page,
            limit: limit,
            total: data.count
        });
    }
    catch (error) {
        console.log(error);
        return (0, modules_1.errorResponse)(res, 'error', 'Failed to retrieve products');
    }
});
exports.getProducts = getProducts;
const approveProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const product = yield Models_1.Product.findByPk(req.params.productId, {
            include: [
                {
                    model: Models_1.User,
                    include: [Models_1.Profile]
                }
            ]
        });
        if (!product) {
            return (0, modules_1.handleResponse)(res, 404, false, 'Product not found');
        }
        if (product.approved) {
            return (0, modules_1.handleResponse)(res, 400, false, 'Product already approved');
        }
        product.approved = true;
        yield product.save();
        const prod = product.toJSON();
        const email = (0, messages_1.approveProductEmail)(prod);
        const { success, error } = yield (0, gmail_1.sendEmail)(prod.user.email, email.title, email.body, prod.user.profile.firstName);
        if ((_a = prod.user) === null || _a === void 0 ? void 0 : _a.fcmToken) {
            yield (0, notification_1.sendPushNotification)(prod.user.fcmToken, 'Product approved', `Your product - ${prod.name} has been approved by admin`, {});
        }
        return (0, modules_1.successResponse)(res, 'success', { message: 'Product approved successfully', emailSentStatus: success });
    }
    catch (error) {
        console.log(error);
        return (0, modules_1.errorResponse)(res, 'error', 'Failed to approve product');
    }
});
exports.approveProducts = approveProducts;
const rejectProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const product = yield Models_1.Product.findByPk(req.params.productId, {
            include: [
                {
                    model: Models_1.User,
                    include: [Models_1.Profile]
                }
            ]
        });
        if (!product) {
            return (0, modules_1.handleResponse)(res, 404, false, 'Product not found');
        }
        if (product.approved === false) {
            return (0, modules_1.handleResponse)(res, 400, false, 'Product already rejected');
        }
        product.approved = false;
        yield product.save();
        const prod = product.toJSON();
        const email = (0, messages_1.rejectProductEmail)(prod);
        const { success, error } = yield (0, gmail_1.sendEmail)(prod.user.email, email.title, email.body, prod.user.profile.firstName);
        if ((_a = prod.user) === null || _a === void 0 ? void 0 : _a.fcmToken) {
            yield (0, notification_1.sendPushNotification)(prod.user.fcmToken, 'Product rejected', `Your product - ${prod.name} has been rejected by admin`, {});
        }
        return (0, modules_1.successResponse)(res, 'success', { message: 'Product rejected successfully', emailSentStatus: success });
    }
    catch (error) {
        console.log(error);
        return (0, modules_1.errorResponse)(res, 'error', 'Failed to reject product');
    }
});
exports.rejectProducts = rejectProducts;
