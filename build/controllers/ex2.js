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
exports.createDelivery = createDelivery;
exports.createDeliveryReturn = createDeliveryReturn;
exports.riderDashboard = riderDashboard;
exports.updateStatus = updateStatus;
exports.confirmPickupCode = confirmPickupCode;
exports.confirmDeliveryCode = confirmDeliveryCode;
exports.currentOrder = currentOrder;
exports.getRiderDeliveryStats = getRiderDeliveryStats;
exports.getRiderStats = getRiderStats;
exports.pendingDeliveries = pendingDeliveries;
exports.attachItemCountToDeliveries = attachItemCountToDeliveries;
exports.getRiderStats = getRiderStats;
exports.getActiveOrders = getActiveOrders;
exports.getOrderHistory = getOrderHistory;
exports.getOrderManagementSummary = getOrderManagementSummary;
exports.getVendorFinancialInfo = getVendorFinancialInfo;
exports.isRiderAvailable = isRiderAvailable;
exports.resendDeliveryCode = resendDeliveryCode;
exports.getRiderStats = getRiderStats;
const Order_1 = require("../models/Order");
const Vendor_1 = require("../models/Vendor");
const Delivery_1 = require("../models/Delivery");
const Location_1 = require("../models/Location");
const geoUtils_1 = require("../utils/geoUtils");
const random_1 = require("../utils/random");
const response_1 = require("../utils/response");
const database_1 = __importDefault(require("../database")); // Sequelize or TypeORM transaction manager
const logger_1 = __importDefault(require("../utils/logger"));
const User_1 = require("../models/User");
const sequelize_1 = require("sequelize");
const zod_1 = require("zod");
const smsNotifier_1 = require("../services/smsNotifier"); // hypothetical SMS notifier service
const VendorWallet_1 = require("../models/VendorWallet");
const WalletHistory_1 = require("../models/WalletHistory");
const RiderAvailability_1 = require("../models/RiderAvailability");
const dayjs_1 = __importDefault(require("dayjs"));
function createDelivery(orderNo, vendorId) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.transaction((transaction) => __awaiter(this, void 0, void 0, function* () {
            const orders = yield Order_1.Order.findAll({
                where: { order_no: orderNo, vendor_id: vendorId },
                transaction,
            });
            if (!orders.length) {
                return (0, response_1.responseData)(false, 400, `No orders found for order_no: ${orderNo}`);
            }
            const firstOrder = orders[0];
            const vendor = yield Vendor_1.Vendor.findByPk(vendorId, { transaction });
            if (!vendor) {
                return (0, response_1.responseData)(false, 400, `Vendor not found for ID: ${vendorId}`);
            }
            const buyerLocation = yield Location_1.Location.findOne({
                where: { user_id: firstOrder.buyer_id },
                order: [['createdAt', 'DESC']],
                transaction,
            });
            if (!buyerLocation) {
                return (0, response_1.responseData)(false, 400, `Buyer location not found for user ID: ${firstOrder.buyer_id}`);
            }
            // Validate coordinates
            if (!vendor.map_lat || !vendor.map_long ||
                !buyerLocation.map_lat || !buyerLocation.map_long) {
                logger_1.default.error("Missing coordinates for delivery creation", {
                    vendor_id: vendorId,
                    vendor_coords: [vendor.map_lat, vendor.map_long],
                    buyer_coords: [buyerLocation.map_lat, buyerLocation.map_long],
                });
                return (0, response_1.responseData)(false, 400, "Missing coordinates for delivery calculation.");
            }
            // Reuse shipping number if delivery already exists
            const existingDelivery = yield Delivery_1.Delivery.findOne({
                where: { order_no: orderNo, vendor_id: vendorId },
                transaction,
            });
            const shippingNo = existingDelivery
                ? existingDelivery.shipping_number
                : 'A' + Math.floor(Math.random() * 90000000 + 10000000); // A + 8-digit random number
            // Calculate distance
            const distance = (0, geoUtils_1.calculateDistance)(parseFloat(vendor.map_lat), parseFloat(vendor.map_long), parseFloat(buyerLocation.map_lat), parseFloat(buyerLocation.map_long));
            if (distance === null || isNaN(distance)) {
                logger_1.default.warn("Distance calculation returned null", {
                    vendor_lat: vendor.map_lat,
                    vendor_lng: vendor.map_long,
                    buyer_lat: buyerLocation.map_lat,
                    buyer_lng: buyerLocation.map_long,
                });
            }
            const [delivery, created] = yield Delivery_1.Delivery.upsert({
                order_no: orderNo,
                vendor_id: vendorId,
                user_id: firstOrder.buyer_id,
                pickup_location: vendor.address,
                pickup_lat: vendor.map_lat,
                pickup_lng: vendor.map_long,
                delivery_location: buyerLocation.address,
                destination_lat: buyerLocation.map_lat,
                destination_lng: buyerLocation.map_long,
                distance_km: distance,
                fare: firstOrder.delivery_cost,
                pickup_confirmation_code: (0, random_1.randomString)(6).toUpperCase(),
                delivery_confirmation_code: (0, random_1.randomString)(6).toUpperCase(),
                shipping_number: shippingNo,
                vendor_business: vendor.business_name,
                vendor_contact: vendor.phone,
            }, { transaction });
            if (!delivery) {
                logger_1.default.error('Failed to create or update delivery', { order_no: orderNo });
                return (0, response_1.responseData)(false, 400, `Failed to create or update delivery for order_no: ${orderNo}`);
            }
            // Optional: trigger additional logic like rebroadcasting to riders
            return {
                shipping_number: shippingNo,
            };
        }));
    });
}
function createDeliveryReturn(orderNo, vendorId) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.transaction((transaction) => __awaiter(this, void 0, void 0, function* () {
            const orders = yield Order_1.Order.findAll({
                where: { order_no: orderNo, vendor_id: vendorId },
                transaction,
            });
            if (!orders.length) {
                return (0, response_1.responseData)(false, 400, `No orders found for order_no: ${orderNo}`);
            }
            const firstOrder = orders[0];
            const vendor = yield Vendor_1.Vendor.findByPk(vendorId, { transaction });
            if (!vendor) {
                return (0, response_1.responseData)(false, 400, `Vendor not found for ID: ${vendorId}`);
            }
            const buyerLocation = yield Location_1.Location.findOne({
                where: { user_id: firstOrder.buyer_id },
                order: [['createdAt', 'DESC']],
                transaction,
            });
            if (!buyerLocation) {
                return (0, response_1.responseData)(false, 400, `Buyer location not found for user ID: ${firstOrder.buyer_id}`);
            }
            // Validate coordinates
            if (!vendor.map_lat || !vendor.map_long ||
                !buyerLocation.map_lat || !buyerLocation.map_long) {
                logger_1.default.error("Missing coordinates for delivery creation", {
                    vendor_id: vendorId,
                    vendor_coords: [vendor.map_lat, vendor.map_long],
                    buyer_coords: [buyerLocation.map_lat, buyerLocation.map_long],
                });
                return (0, response_1.responseData)(false, 400, "Missing coordinates for delivery calculation.");
            }
            // Reuse shipping number if it exists
            const existingDelivery = yield Delivery_1.Delivery.findOne({
                where: { order_no: orderNo, vendor_id: vendorId },
                transaction,
            });
            const shippingNo = existingDelivery
                ? existingDelivery.shipping_number
                : 'A' + Math.floor(Math.random() * 90000000 + 10000000); // 8-digit number with 'A' prefix
            // Distance: from buyer back to vendor
            const distance = (0, geoUtils_1.calculateDistance)(parseFloat(buyerLocation.map_lat), parseFloat(buyerLocation.map_long), parseFloat(vendor.map_lat), parseFloat(vendor.map_long));
            if (distance === null || isNaN(distance)) {
                logger_1.default.warn("Distance calculation returned null", {
                    vendor_lat: vendor.map_lat,
                    vendor_lng: vendor.map_long,
                    buyer_lat: buyerLocation.map_lat,
                    buyer_lng: buyerLocation.map_long,
                });
            }
            // Reverse pickup/delivery addresses (for return)
            const [delivery, created] = yield Delivery_1.Delivery.upsert({
                order_no: orderNo,
                vendor_id: vendorId,
                user_id: firstOrder.buyer_id,
                pickup_location: buyerLocation.address,
                pickup_lat: buyerLocation.map_lat,
                pickup_lng: buyerLocation.map_long,
                delivery_location: vendor.address,
                destination_lat: vendor.map_lat,
                destination_lng: vendor.map_long,
                distance_km: distance,
                fare: firstOrder.delivery_cost,
                pickup_confirmation_code: (0, random_1.randomString)(6).toUpperCase(),
                delivery_confirmation_code: (0, random_1.randomString)(6).toUpperCase(),
                shipping_number: shippingNo,
                vendor_business: vendor.business_name,
                vendor_contact: vendor.phone,
            }, { transaction });
            if (!delivery) {
                logger_1.default.error('Failed to create or update return delivery', { order_no: orderNo });
                return (0, response_1.responseData)(false, 400, `Failed to create or update delivery for order_no: ${orderNo}`);
            }
            // Optional: Notify system/riders about return
            return {
                shipping_number: shippingNo,
            };
        }));
    });
}
function riderDashboard(rider_1) {
    return __awaiter(this, arguments, void 0, function* (rider, recentOfferCount = 5) {
        const riderId = rider.id;
        // ───────────────────────────────────────
        // Basic delivery statistics
        // ───────────────────────────────────────
        const totalDeliveries = yield Delivery_1.Delivery.count({
            where: { rider_id: riderId }
        });
        const activeDeliveries = yield Delivery_1.Delivery.count({
            where: {
                rider_id: riderId,
                delivery_status: {
                    [sequelize_1.Op.in]: ['awaitingPickup', 'pickup', 'onTheWay'],
                },
                provider: 'alabaster',
            }
        });
        const completedDeliveries = yield Delivery_1.Delivery.count({
            where: {
                rider_id: riderId,
                delivery_status: 'delivered',
                provider: 'alabaster',
            }
        });
        // ───────────────────────────────────────
        // Current active deliveries (limit not enforced unless needed)
        // ───────────────────────────────────────
        const currentDelivery = yield Delivery_1.Delivery.findAll({
            where: {
                rider_id: riderId,
                delivery_status: {
                    [sequelize_1.Op.in]: ['awaitingPickup', 'pickup', 'onTheWay'],
                },
                provider: 'alabaster',
            },
            order: [['created_at', 'DESC']]
        });
        // ───────────────────────────────────────
        // Recent completed deliveries with pagination
        // ───────────────────────────────────────
        const page = 1;
        const limit = recentOfferCount;
        const offset = (page - 1) * limit;
        const { count, rows } = yield Delivery_1.Delivery.findAndCountAll({
            where: {
                rider_id: riderId,
                delivery_status: 'delivered',
                provider: 'alabaster',
            },
            order: [['created_at', 'DESC']],
            limit,
            offset,
        });
        const recentDeliveries = {
            data: rows,
            pagination: {
                currentPage: page,
                perPage: limit,
                total: count,
                lastPage: Math.ceil(count / limit),
            },
        };
        // ───────────────────────────────────────
        // Final dashboard structure
        // ───────────────────────────────────────
        return {
            total_deliveries: totalDeliveries,
            active_deliveries: activeDeliveries,
            completed_deliveries: completedDeliveries,
            ongoing_deliveries: currentDelivery,
            recent_deliveries: recentDeliveries,
        };
    });
}
// Zod schema for validation
const updateStatusSchema = zod_1.z.object({
    delivery_status: zod_1.z.enum([
        'pending',
        'awaitingPickup',
        'pickup',
        'onTheWay',
        'delivered',
        'rejected'
    ])
});
function updateStatus(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // Validate request body using Zod
        const parseResult = updateStatusSchema.safeParse(req.body);
        if (!parseResult.success) {
            const formattedErrors = parseResult.error.flatten().fieldErrors;
            return res.status(422).json((0, response_1.responseData)(false, 422, 'Validation failed.', { values: formattedErrors }));
        }
        const { delivery_status } = parseResult.data;
        const id = parseInt(req.params.id, 10);
        try {
            const delivery = yield Delivery_1.Delivery.findByPk(id);
            if (!delivery) {
                return res.status(404).json((0, response_1.responseData)(false, 404, `Delivery with ID ${id} not found.`));
            }
            delivery.delivery_status = delivery_status;
            delivery.is_delivered = delivery_status === 'delivered';
            if (delivery_status === 'delivered') {
                delivery.time_of_delivery = new Date();
            }
            yield delivery.save();
            return res.status(200).json((0, response_1.responseData)(true, 200, 'Delivery status updated', {
                values: {
                    data: delivery
                }
            }));
        }
        catch (err) {
            console.error(err);
            return res.status(500).json((0, response_1.responseData)(false, 500, 'Server error.'));
        }
    });
}
function confirmPickupCode(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const id = parseInt(req.params.id, 10);
        try {
            const delivery = yield Delivery_1.Delivery.findByPk(id);
            if (!delivery) {
                return res.status(404).json((0, response_1.responseData)(false, 404, `Delivery with ID ${id} not found.`));
            }
            const { order_no, vendor_id } = delivery;
            const isPickedUp = yield Order_1.Order.findOne({
                where: {
                    order_no,
                    vendor_id,
                    status: 'pickedup'
                }
            });
            if (!isPickedUp) {
                return res.status(200).json((0, response_1.responseData)(true, 200, 'Pickup Denial.', {
                    order_has_pickedup_status: false
                }));
            }
            // Confirm delivery pickup
            delivery.is_pickup_confirmed = true;
            delivery.delivery_status = 'pickup';
            yield delivery.save();
            // Notify the user
            const user = yield User_1.User.findByPk(delivery.user_id);
            if (user) {
                const message = `Your delivery confirmation code is: ${delivery.delivery_confirmation_code}`;
                yield (0, smsNotifier_1.sendSms)(user.phone, message);
                // Optionally, send a second detailed SMS:
                // const message2 = `Dear ${user.first_name}, Your shipment ${delivery.shipping_number} was created successfully. A delivery partner has picked up your goods. Please present this code to the delivery partner at the point of delivery.`;
                // await sendSms(user.phone, message2);
            }
            return res.status(200).json((0, response_1.responseData)(true, 200, 'Pickup confirmed successfully.', {
                order_has_pickedup_status: true,
                delivery,
            }));
        }
        catch (err) {
            console.error(err);
            return res.status(500).json((0, response_1.responseData)(false, 500, 'Server error.'));
        }
    });
}
const confirmDeliveryCodeSchema = zod_1.z.object({
    delivery_confirmation_code: zod_1.z.string().nonempty()
});
function confirmDeliveryCode(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const id = parseInt(req.params.id, 10);
        // Validate request
        const parseResult = confirmDeliveryCodeSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(422).json((0, response_1.responseData)(false, 422, 'Validation failed.', {
                values: parseResult.error.flatten().fieldErrors
            }));
        }
        const { delivery_confirmation_code } = parseResult.data;
        try {
            const delivery = yield Delivery_1.Delivery.findByPk(id);
            if (!delivery) {
                return res.status(404).json((0, response_1.responseData)(false, 404, `Delivery with ID ${id} not found.`));
            }
            const result = yield database_1.default.transaction((transaction) => __awaiter(this, void 0, void 0, function* () {
                const orders = yield Order_1.Order.findAll({
                    where: {
                        vendor_id: delivery.vendor_id,
                        order_no: delivery.order_no,
                        delivery_code: delivery_confirmation_code
                    },
                    transaction
                });
                if (!orders.length) {
                    return (0, response_1.responseData)(false, 400, 'Invalid code', []);
                }
                const riderVendor = yield Vendor_1.Vendor.findOne({
                    where: { user_id: delivery.rider_id },
                    transaction
                });
                if (!riderVendor) {
                    return (0, response_1.responseData)(false, 400, 'Rider\'s vendor record not found.');
                }
                // Update delivery
                yield delivery.update({
                    is_delivery_confirmed: true,
                    delivery_status: 'delivered',
                    is_delivered: true,
                    time_of_delivery: new Date(),
                }, { transaction });
                // Update each order
                for (const order of orders) {
                    yield order.update({
                        status: 'delivered',
                        is_active: false,
                        delivered_at: new Date(),
                    }, { transaction });
                }
                const wallet = yield updateWallet(orders[0].order_no, riderVendor.id, delivery.fare, true);
                return (0, response_1.responseData)(true, 200, 'Delivery confirmed successfully', {
                    values: {
                        delivery,
                        updated_orders_count: orders.length,
                        wallet
                    }
                });
            }));
            return res.status(result.status).json(result);
        }
        catch (e) {
            console.error("Unexpected error while confirming delivery code", {
                error: e.message,
                stack: e.stack
            });
            return res.status(500).json((0, response_1.responseData)(false, 500, 'Server error occurred.', []));
        }
    });
}
function currentOrder(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const riderId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        try {
            const delivery = yield Delivery_1.Delivery.findOne({
                where: {
                    rider_id: riderId,
                    delivery_status: ['awaitingPickup', 'pickup', 'onTheWay'],
                    provider: 'alabaster',
                },
                order: [['created_at', 'DESC']]
            });
            if (!delivery) {
                return res.status(404).json((0, response_1.responseData)(false, 404, 'No active delivery order found', []));
            }
            return res.status(200).json((0, response_1.responseData)(true, 200, 'Active delivery order retrieved successfully', {
                values: { data: delivery }
            }));
        }
        catch (error) {
            console.error(error);
            return res.status(500).json((0, response_1.responseData)(false, 500, 'Server error', []));
        }
    });
}
function getRiderDeliveryStats(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const riderId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        try {
            const [totalDeliveries, activeDeliveries, completedDeliveries] = yield Promise.all([
                Delivery_1.Delivery.count({ where: { rider_id: riderId } }),
                Delivery_1.Delivery.count({
                    where: {
                        rider_id: riderId,
                        delivery_status: ['awaitingPickup', 'pickup', 'onTheWay'],
                        provider: 'alabaster'
                    }
                }),
                Delivery_1.Delivery.count({
                    where: {
                        rider_id: riderId,
                        delivery_status: 'delivered',
                        provider: 'alabaster'
                    }
                })
            ]);
            return res.status(200).json((0, response_1.responseData)(true, 200, 'Rider delivery statistics retrieved successfully', {
                values: {
                    total_deliveries: totalDeliveries,
                    active_deliveries: activeDeliveries,
                    completed_deliveries: completedDeliveries
                }
            }));
        }
        catch (error) {
            console.error(error);
            return res.status(500).json((0, response_1.responseData)(false, 500, 'Server error'));
        }
    });
}
function getRiderStats(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const deliveries = yield Delivery_1.Delivery.findAll({ where: { rider_id: userId } });
        const total = deliveries.length;
        const completed = deliveries.filter(d => d.delivery_status === 'delivered' && d.provider === 'alabaster').length;
        const active = deliveries.filter(d => ['awaitingPickup', 'pickup', 'onTheWay'].includes(d.delivery_status) &&
            d.provider === 'alabaster').length;
        return {
            total,
            completed,
            active
        };
    });
}
function pendingDeliveries(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const rider = req.user;
        const now = (0, dayjs_1.default)();
        const today = (0, dayjs_1.default)().startOf('day');
        console.info('Checking rider availability', {
            now: now.toISOString(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            rider_id: rider.id,
        });
        const currentTime = now.format('HH:mm');
        const isAvailable = yield RiderAvailability_1.RiderAvailability.findOne({
            where: {
                user_id: rider.id,
                updated_at: {
                    [sequelize_1.Op.gte]: today.toDate(),
                }
            },
            where: literal(`
        (
          (start_time <= end_time AND '${currentTime}' BETWEEN start_time AND end_time)
          OR
          (start_time > end_time AND ('${currentTime}' >= start_time OR '${currentTime}' <= end_time))
        )
      `)
        });
        if (!isAvailable) {
            return res.status(200).json((0, response_1.responseData)(false, 200, 'Rider is not available.'));
        }
        const location = yield Location_1.Location.findOne({
            where: { user_id: rider.id },
            order: [['created_at', 'DESC']]
        });
        if (!location || !location.map_lat || !location.map_long) {
            console.warn(`Missing location data for rider ${rider.id}`);
            return res.status(404).json((0, response_1.responseData)(false, 404, 'Location not found or incomplete.', {
                values: { data: [] }
            }));
        }
        const riderLat = parseFloat(location.map_lat);
        const riderLng = parseFloat(location.map_long);
        console.info(`Rider coordinates: ${riderLat}, ${riderLng}`);
        const distanceSql = `
      (6371 * acos(
        cos(radians(${riderLat})) *
        cos(radians(pickup_lat)) *
        cos(radians(pickup_lng) - radians(${riderLng})) +
        sin(radians(${riderLat})) *
        sin(radians(pickup_lat))
      )) AS distance_to_pickup
    `;
        const deliveries = yield Delivery_1.Delivery.findAll({
            attributes: {
                include: [literal(distanceSql)]
            },
            where: {
                rider_id: null,
                delivery_status: 'pending',
                is_delivered: false,
                provider: 'alabaster'
            },
            order: literal('distance_to_pickup ASC')
        });
        if (deliveries.length === 0) {
            console.log(`No deliveries found for rider ${rider.id}`);
        }
        const deliveriesWithCounts = yield attachItemCountToDeliveries(deliveries);
        return res.status(200).json((0, response_1.responseData)(true, 200, 'Nearby unassigned deliveries found.', {
            values: {
                stats: yield getRiderStats(rider.id),
                data: deliveriesWithCounts
            }
        }));
    });
}
function attachItemCountToDeliveries(deliveries) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const delivery of deliveries) {
            const count = yield Order_1.Order.count({
                where: {
                    order_no: delivery.order_no,
                    vendor_id: delivery.vendor_id
                }
            });
            // Attach new property dynamically
            delivery.item_count = count;
        }
        return deliveries;
    });
}
function getRiderStats(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const deliveries = yield Delivery_1.Delivery.findAll({ where: { rider_id: userId } });
        const total = deliveries.length;
        const completed = deliveries.filter(d => d.delivery_status === 'delivered' && d.provider === 'alabaster').length;
        const active = deliveries.filter(d => ['awaitingPickup', 'pickup', 'onTheWay'].includes(d.delivery_status) &&
            d.provider === 'alabaster').length;
        return { total, completed, active };
    });
}
// Utility function
// Active Orders
function getActiveOrders(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = req.user;
        const sort = req.query.sort === 'asc' ? 'asc' : 'desc';
        const perPage = Number(req.query.per_page || 10);
        const { count, rows } = yield Delivery_1.Delivery.findAndCountAll({
            where: {
                rider_id: user.id,
                delivery_status: ['awaitingPickup', 'pickup', 'onTheWay']
            },
            order: [['created_at', sort]],
            limit: perPage,
            offset: 0
        });
        const deliveries = yield Promise.all(rows.map((delivery) => __awaiter(this, void 0, void 0, function* () {
            const itemCount = yield Order_1.Order.count({
                where: {
                    order_no: delivery.order_no,
                    vendor_id: delivery.vendor_id
                }
            });
            return Object.assign(Object.assign({}, delivery.toJSON()), { item_count: itemCount });
        })));
        return res.json((0, response_1.responseData)(true, 200, 'Active orders retrieved.', {
            values: {
                stats: yield getRiderStats(user.id),
                active_order: deliveries,
                pagination: { total: count, per_page: perPage }
            }
        }));
    });
}
// Order History
function getOrderHistory(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = req.user;
        const sort = req.query.sort === 'asc' ? 'asc' : 'desc';
        const perPage = Number(req.query.per_page || 10);
        const { count, rows } = yield Delivery_1.Delivery.findAndCountAll({
            where: {
                rider_id: user.id,
                delivery_status: ['delivered', 'rejected']
            },
            order: [['created_at', sort]],
            limit: perPage,
            offset: 0
        });
        const history = yield Promise.all(rows.map((delivery) => __awaiter(this, void 0, void 0, function* () {
            const itemCount = yield Order_1.Order.count({
                where: {
                    order_no: delivery.order_no,
                    vendor_id: delivery.vendor_id
                }
            });
            return Object.assign(Object.assign({}, delivery.toJSON()), { item_count: itemCount });
        })));
        return res.json((0, response_1.responseData)(true, 200, 'Order history retrieved.', {
            values: {
                stats: yield getRiderStats(user.id),
                history,
                pagination: { total: count, per_page: perPage }
            }
        }));
    });
}
// Order Management
function getOrderManagementSummary(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = req.user;
        const sort = req.query.sort === 'asc' ? 'asc' : 'desc';
        const deliveries = yield Delivery_1.Delivery.findAll({
            where: { rider_id: user.id, provider: 'alabaster' },
            order: [['created_at', 'desc']]
        });
        const active = deliveries.filter(d => ['awaitingPickup', 'pickup', 'onTheWay'].includes(d.delivery_status));
        const completed = deliveries.filter(d => d.delivery_status === 'delivered');
        const history = deliveries.filter(d => ['delivered', 'rejected'].includes(d.delivery_status));
        const activeSorted = [...active].sort((a, b) => sort === 'asc' ? a.created_at - b.created_at : b.created_at - a.created_at);
        const historySorted = [...history].sort((a, b) => sort === 'asc' ? a.created_at - b.created_at : b.created_at - a.created_at);
        return res.json((0, response_1.responseData)(true, 200, 'Order management summary', {
            values: {
                stats: {
                    total: deliveries.length,
                    completed: completed.length,
                    active: active.length,
                },
                active_orders: activeSorted,
                history: historySorted
            }
        }));
    });
}
// Vendor Financial Info
function getVendorFinancialInfo(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = req.user;
        const vendor = yield Vendor_1.Vendor.findOne({ where: { user_id: user.id } });
        if (!vendor)
            return res.status(404).json((0, response_1.responseData)(false, 404, 'Vendor information not found'));
        const wallet = yield VendorWallet_1.VendorWallet.findOne({ where: { vendor_id: vendor.id } });
        if (!wallet)
            return res.status(404).json((0, response_1.responseData)(false, 404, 'Wallet not found'));
        const walletHistory = yield WalletHistory_1.WalletHistory.findAndCountAll({
            where: { vendor_id: vendor.id },
            order: [['created_at', 'desc']],
            limit: 10
        });
        return res.json((0, response_1.responseData)(true, 200, 'Wallet history data retrieved successfully', {
            values: {
                data: walletHistory.rows,
                wallet_info: wallet,
                pagination: { total: walletHistory.count, per_page: 10 }
            }
        }));
    });
}
// Is Rider Available
function isRiderAvailable(rider) {
    return __awaiter(this, void 0, void 0, function* () {
        const now = (0, dayjs_1.default)();
        const today = (0, dayjs_1.default)().startOf('day');
        const time = now.format('HH:mm');
        const availability = yield RiderAvailability_1.RiderAvailability.findOne({
            where: {
                user_id: rider.id,
                updated_at: {
                    [sequelize_1.Op.gte]: today.toDate()
                }
            },
            where: sequelize_1.Op.and([
                {
                    [sequelize_1.Op.or]: [
                        {
                            start_time: { [sequelize_1.Op.lte]: time },
                            end_time: { [sequelize_1.Op.gte]: time }
                        },
                        {
                            start_time: { [sequelize_1.Op.gt]: time },
                            end_time: { [sequelize_1.Op.lt]: time }
                        }
                    ]
                }
            ])
        });
        return !!availability;
    });
}
// Resend delivery code
function resendDeliveryCode(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const id = Number(req.params.id);
        const delivery = yield Delivery_1.Delivery.findByPk(id);
        if (!delivery)
            return res.status(404).json((0, response_1.responseData)(false, 404, 'Delivery not found'));
        const user = yield User_1.User.findByPk(delivery.user_id);
        if (user) {
            // await user.notify(new SmsNotifier(user, `Your delivery confirmation code is: ${delivery.delivery_confirmation_code}`));
            console.log(`Sending SMS to ${user.phone} with code: ${delivery.delivery_confirmation_code}`);
        }
        return res.json((0, response_1.responseData)(true, 200, 'Delivery Confirmation Code Resend.', {
            delivery
        }));
    });
}
// Rider stats
function getRiderStats(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const deliveries = yield Delivery_1.Delivery.findAll({ where: { rider_id: userId } });
        return {
            total: deliveries.length,
            completed: deliveries.filter(d => d.delivery_status === 'delivered' && d.provider === 'alabaster').length,
            active: deliveries.filter(d => ['awaitingPickup', 'pickup', 'onTheWay'].includes(d.delivery_status) && d.provider === 'alabaster').length
        };
    });
}
