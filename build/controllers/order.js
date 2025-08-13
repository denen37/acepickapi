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
exports.cancelOrder = exports.confirmDelivery = exports.deliverOrder = exports.transportOrder = exports.confirmPickup = exports.pickupOrder = exports.acceptOrder = exports.getOrdersClient = exports.getOrdersRider = exports.getNearestPaidOrders = exports.createOrder = void 0;
const body_1 = require("../validation/body");
const Models_1 = require("../models/Models");
const enum_1 = require("../utils/enum");
const modules_1 = require("../utils/modules");
const DeliveryPricing_1 = require("../models/DeliveryPricing");
const query_1 = require("../validation/query");
const db_1 = __importDefault(require("../config/db"));
const createOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    try {
        const parsed = body_1.deliverySchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ errors: parsed.error.flatten() });
        }
        const { productTransactionId, receiverLat, receiverLong, address, locationId, vehicleType } = parsed.data;
        const productTransaction = yield Models_1.ProductTransaction.findOne({
            where: {
                id: productTransactionId,
                buyerId: id,
                // orderMethod: OrderMethod.DELIVERY,
                // status: ProductTransactionStatus.PENDING
            },
            include: [
                {
                    model: Models_1.Product,
                    include: [Models_1.Location]
                }
            ]
        });
        if (!productTransaction) {
            return res.status(400).json({ errors: 'Product transaction not found' });
        }
        // if (productTransaction.status !== ProductTransactionStatus.PENDING) {
        //     return res.status(400).json({ errors: 'Product transaction not pending' });
        // }
        if (productTransaction.orderMethod !== enum_1.OrderMethod.DELIVERY) {
            return res.status(400).json({ errors: 'Product transaction not meant for delivery' });
        }
        let existingLocation = null;
        console.log('lat', receiverLat, 'long', receiverLong);
        if (locationId) {
            existingLocation = yield Models_1.Location.findOne({
                where: {
                    id: locationId,
                    userId: id
                }
            });
        }
        else {
            existingLocation = yield Models_1.Location.create({
                latitude: receiverLat,
                longitude: receiverLong,
                address,
                userId: id
            });
        }
        if (!existingLocation) {
            return res.status(400).json({ errors: 'Location not found' });
        }
        const vendorLat = productTransaction.product.pickupLocation.latitude;
        const vendorLong = productTransaction.product.pickupLocation.longitude;
        const clientLat = existingLocation === null || existingLocation === void 0 ? void 0 : existingLocation.latitude;
        const clientLong = existingLocation === null || existingLocation === void 0 ? void 0 : existingLocation.longitude;
        let distance = (0, modules_1.getDistanceFromLatLonInKm)(vendorLat, vendorLong, clientLat, clientLong);
        const pricing = yield DeliveryPricing_1.DeliveryPricing.findOne({
            where: {
                vehicleType: vehicleType,
            }
        });
        if (!pricing) {
            return res.status(400).json({ errors: 'Delivery pricing not found for the vehicle type' });
        }
        const distanceCost = distance * Number(pricing === null || pricing === void 0 ? void 0 : pricing.costPerKm);
        const totalWeight = Number(productTransaction.product.weightPerUnit) * Number(productTransaction.quantity);
        const weightCost = totalWeight * Number(pricing === null || pricing === void 0 ? void 0 : pricing.costPerKg);
        const baseCost = Number(pricing === null || pricing === void 0 ? void 0 : pricing.baseCost);
        const totalCost = distanceCost + weightCost + baseCost;
        const order = yield Models_1.Order.create({
            productTransactionId,
            cost: totalCost,
            distance: distance,
            weight: totalWeight,
            locationId: existingLocation === null || existingLocation === void 0 ? void 0 : existingLocation.id,
        });
        return (0, modules_1.successResponse)(res, 'success', order);
    }
    catch (error) {
        console.log(error);
        return (0, modules_1.errorResponse)(res, 'error', 'Error creating order');
    }
});
exports.createOrder = createOrder;
const getNearestPaidOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    try {
        const rider = yield Models_1.Rider.findOne({
            where: { userId: id },
            include: [
                {
                    model: Models_1.User,
                    include: [Models_1.Location]
                }
            ]
        });
        if (!rider) {
            return (0, modules_1.handleResponse)(res, 404, false, 'You are not a rider');
        }
        const riderLat = rider.user.location.latitude;
        const riderLong = rider.user.location.longitude;
        if (!riderLat || !riderLong) {
            return (0, modules_1.handleResponse)(res, 400, false, 'Please update your location');
        }
        const orders = yield Models_1.Order.findAll({
            where: {
                riderId: null,
                status: enum_1.OrderStatus.PAID,
            },
            include: [
                {
                    model: Models_1.ProductTransaction,
                    include: [
                        {
                            model: Models_1.Product,
                            include: [
                                {
                                    model: Models_1.Location,
                                    as: 'pickupLocation',
                                    attributes: ['latitude', 'longitude'],
                                },
                            ],
                        },
                    ],
                },
            ],
        });
        const ordersWithDistance = orders.map((order) => {
            var _a, _b;
            const pickup = (_b = (_a = order.productTransaction) === null || _a === void 0 ? void 0 : _a.product) === null || _b === void 0 ? void 0 : _b.pickupLocation;
            if (pickup && pickup.latitude && pickup.longitude) {
                const distance = (0, modules_1.getDistanceFromLatLonInKm)(riderLat, riderLong, pickup.latitude, pickup.longitude);
                return Object.assign(Object.assign({}, order.toJSON()), { distance });
            }
            return Object.assign(Object.assign({}, order.toJSON()), { distance: null });
        });
        ordersWithDistance.sort((a, b) => a.distance - b.distance);
        return (0, modules_1.successResponse)(res, 'success', ordersWithDistance);
    }
    catch (error) {
        console.log(error);
        return (0, modules_1.errorResponse)(res, 'error', 'Error fetching orders');
    }
});
exports.getNearestPaidOrders = getNearestPaidOrders;
const getOrdersRider = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const parsed = query_1.getOrdersSchema.safeParse(req.query);
    if (!parsed.success) {
        return res.status(400).json({ errors: parsed.error.flatten() });
    }
    const { status, page, limit } = parsed.data;
    try {
        const orders = yield Models_1.Order.findAll({
            where: Object.assign({ riderId: id }, (status ? { status: status } : {})),
            include: [
                {
                    model: Models_1.ProductTransaction,
                    include: [{
                            model: Models_1.Product,
                            include: [{
                                    model: Models_1.Location,
                                }]
                        }]
                },
                {
                    model: Models_1.Location,
                }
            ]
        });
        return (0, modules_1.successResponse)(res, 'success', orders);
    }
    catch (error) {
        console.log(error);
        return (0, modules_1.errorResponse)(res, 'error', 'Error fetching orders');
    }
});
exports.getOrdersRider = getOrdersRider;
const getOrdersClient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const parsed = query_1.getOrdersSchema.safeParse(req.query);
    if (!parsed.success) {
        return res.status(400).json({ errors: parsed.error.flatten() });
    }
    const { status, page, limit } = parsed.data;
    try {
        const orders = yield Models_1.Order.findAll({
            where: Object.assign({}, (status ? { status: status } : {})),
            include: [
                {
                    model: Models_1.ProductTransaction,
                    where: {
                        buyerId: id
                    },
                    include: [{
                            model: Models_1.Product,
                            include: [{
                                    model: Models_1.Location,
                                }]
                        }]
                },
                {
                    model: Models_1.Location,
                }
            ]
        });
        return (0, modules_1.successResponse)(res, 'success', orders);
    }
    catch (error) {
        console.log(error);
        return (0, modules_1.errorResponse)(res, 'error', 'Error fetching orders');
    }
});
exports.getOrdersClient = getOrdersClient;
const acceptOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const { orderId } = req.params;
    try {
        const order = yield Models_1.Order.findByPk(orderId);
        if (!order) {
            return (0, modules_1.handleResponse)(res, 404, false, 'Order not found');
        }
        if (order.status !== enum_1.OrderStatus.PAID) {
            return (0, modules_1.handleResponse)(res, 400, false, 'Order has not been paid yet');
        }
        order.status = enum_1.OrderStatus.ACCEPTED;
        order.riderId = id;
        yield order.save();
        return (0, modules_1.successResponse)(res, 'success', order);
    }
    catch (error) {
        console.log(error);
        return (0, modules_1.errorResponse)(res, 'error', 'Error accepting order');
    }
});
exports.acceptOrder = acceptOrder;
const pickupOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const { orderId } = req.params;
    try {
        const order = yield Models_1.Order.findByPk(orderId);
        if (!order) {
            return (0, modules_1.handleResponse)(res, 404, false, 'Order not found');
        }
        if (order.status !== enum_1.OrderStatus.ACCEPTED) {
            return (0, modules_1.handleResponse)(res, 400, false, 'Order not accepted');
        }
        order.status = enum_1.OrderStatus.PICKED_UP;
        yield order.save();
        return (0, modules_1.successResponse)(res, 'success', order);
    }
    catch (error) {
        console.log(error);
        return (0, modules_1.errorResponse)(res, 'error', 'Error reporting pickup');
    }
});
exports.pickupOrder = pickupOrder;
const confirmPickup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const { orderId } = req.params;
    try {
        const order = yield Models_1.Order.findByPk(orderId);
        if (!order) {
            return (0, modules_1.handleResponse)(res, 404, false, 'Order not found');
        }
        if (order.status !== enum_1.OrderStatus.PICKED_UP) {
            return (0, modules_1.handleResponse)(res, 400, false, 'Order not picked up');
        }
        order.status = enum_1.OrderStatus.CONFIRM_PICKUP;
        yield order.save();
        return (0, modules_1.successResponse)(res, 'success', order);
    }
    catch (error) {
        console.log(error);
        return (0, modules_1.errorResponse)(res, 'error', 'Error confirming pickup');
    }
});
exports.confirmPickup = confirmPickup;
const transportOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const { orderId } = req.params;
    try {
        const order = yield Models_1.Order.findByPk(orderId);
        if (!order) {
            return (0, modules_1.handleResponse)(res, 404, false, 'Order not found');
        }
        if (order.status !== enum_1.OrderStatus.CONFIRM_PICKUP) {
            return (0, modules_1.handleResponse)(res, 400, false, 'Order not confirmed for pickup');
        }
        order.status = enum_1.OrderStatus.IN_TRANSIT;
        yield order.save();
        return (0, modules_1.successResponse)(res, 'success', order);
    }
    catch (error) {
        console.log(error);
        return (0, modules_1.errorResponse)(res, 'error', 'Error transporting pickup');
    }
});
exports.transportOrder = transportOrder;
const deliverOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const { orderId } = req.params;
    try {
        const order = yield Models_1.Order.findByPk(orderId);
        if (!order) {
            return (0, modules_1.handleResponse)(res, 404, false, 'Order not found');
        }
        if (order.status !== enum_1.OrderStatus.IN_TRANSIT) {
            return (0, modules_1.handleResponse)(res, 400, false, 'Order not in transit');
        }
        order.status = enum_1.OrderStatus.DELIVERED;
        yield order.save();
        return (0, modules_1.successResponse)(res, 'success', order);
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, 'error', 'Error delivering order');
    }
});
exports.deliverOrder = deliverOrder;
const confirmDelivery = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const { orderId } = req.params;
    const t = yield db_1.default.transaction();
    try {
        const order = yield Models_1.Order.findByPk(orderId);
        if (!order) {
            return (0, modules_1.handleResponse)(res, 404, false, 'Order not found');
        }
        if (order.status !== enum_1.OrderStatus.DELIVERED) {
            return (0, modules_1.handleResponse)(res, 400, false, 'Order not delivered');
        }
        order.status = enum_1.OrderStatus.CONFIRM_DELIVERY;
        yield order.save();
        const rider = yield Models_1.User.findOne({
            where: {
                id: order.riderId
            },
            include: [Models_1.Wallet]
        });
        if (!rider) {
            throw new Error('Rider not found');
        }
        rider.wallet.previousBalance = rider.wallet.currentBalance;
        rider.wallet.currentBalance = Number(rider.wallet.currentBalance) + Number(order.cost);
        yield rider.wallet.save();
        yield t.commit();
        return (0, modules_1.successResponse)(res, 'success', order);
    }
    catch (error) {
        console.log(error);
        yield t.rollback();
        return (0, modules_1.errorResponse)(res, 'error', 'Error confirming delivery');
    }
});
exports.confirmDelivery = confirmDelivery;
const cancelOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const { orderId } = req.params;
    try {
        const order = yield Models_1.Order.findByPk(orderId);
        if (!order) {
            return (0, modules_1.handleResponse)(res, 404, false, 'Order not found');
        }
        if (order.status !== enum_1.OrderStatus.PENDING) {
            return (0, modules_1.handleResponse)(res, 400, false, 'Order not pending');
        }
        order.status = enum_1.OrderStatus.CANCELLED;
        yield order.save();
        return (0, modules_1.successResponse)(res, 'success', order);
    }
    catch (error) {
        console.log(error);
        return (0, modules_1.errorResponse)(res, 'error', 'Error cancelling order');
    }
});
exports.cancelOrder = cancelOrder;
