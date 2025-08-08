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
exports.getShippingPrice = getShippingPrice;
exports.calculateDistance = calculateDistance;
exports.deliveryHistory = deliveryHistory;
const Product_1 = require("../models/Product");
const Vendor_1 = require("../models/Vendor");
const ProductVariety_1 = require("../models/ProductVariety");
const shippingRates_1 = require("../utils/shippingRates");
const geoUtils_1 = require("../utils/geoUtils");
const logger_1 = __importDefault(require("../utils/logger")); // hypothetical logger like Winston
function getShippingPrice(data, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        logger_1.default.info('Shipping request data', data);
        let totalCost = 0;
        let vehicleType = 'BIKE'; // default
        const productItems = data.product_ids || [];
        if (!productItems.length) {
            return { success: false, status: 400, message: "No product id(s) provided" };
        }
        const firstProductId = productItems[0].product_id;
        const firstProduct = yield Product_1.Product.findByPk(firstProductId);
        if (!firstProduct) {
            return { success: false, status: 400, message: `Invalid first product ID: ${firstProductId}` };
        }
        const vendor = yield Vendor_1.Vendor.findByPk(firstProduct.vendor_id);
        if (!vendor) {
            return { success: false, status: 400, message: "Vendor for first product does not exist." };
        }
        const receiverLat = parseFloat(String(data.map_lat));
        const receiverLng = parseFloat(String(data.map_long));
        const vendorLat = parseFloat(String(vendor.map_lat));
        const vendorLng = parseFloat(String(vendor.map_long));
        logger_1.default.info('Coordinates check', { vendorLat, vendorLng, receiverLat, receiverLng });
        const destinationState = (data.state || '').toLowerCase();
        const vendorState = (vendor.state || '').toLowerCase();
        let maxTotalWeight = 0;
        // ❌ Ensure all products belong to same vendor
        for (const item of productItems) {
            const product = yield Product_1.Product.findByPk(item.product_id);
            if (!product || product.vendor_id !== vendor.id) {
                return { success: false, status: 400, message: "All products must belong to the same vendor." };
            }
        }
        // ✅ Calculate total weight
        for (const item of productItems) {
            const productId = item.product_id;
            const product = yield Product_1.Product.findByPk(productId);
            const variantSkus = item.variant_skus || [];
            const quantity = Math.max(1, Number(item.quantity || 1));
            if (!product)
                continue;
            if (!variantSkus.length) {
                const weight = Math.round(Number(product.weight || 0));
                maxTotalWeight += weight * quantity;
            }
            else {
                for (const sku of variantSkus) {
                    const variantSku = sku.sku;
                    const qty = (_a = sku.quantity) !== null && _a !== void 0 ? _a : 1;
                    const productVariant = yield ProductVariety_1.ProductVariety.findOne({ where: { variant_sku: variantSku } });
                    if (!productVariant) {
                        logger_1.default.warn(`GIG API Warning: variant sku: ${variantSku} for product id: ${productId} is invalid`);
                        continue;
                    }
                    const weight = Math.round(Number(productVariant.weight || product.weight || 0));
                    maxTotalWeight += weight * qty;
                }
            }
        }
        // 🚗 Choose vehicle type
        if (vendorState !== destinationState || maxTotalWeight > 10) {
            vehicleType = 'CAR';
        }
        const baseFare = (_b = (0, shippingRates_1.getBaseFare)(vehicleType)) !== null && _b !== void 0 ? _b : 500;
        const ratePerKm = (_c = (0, shippingRates_1.getRatePerKm)(vehicleType)) !== null && _c !== void 0 ? _c : 0;
        logger_1.default.info('Vehicle & rates determined', { vehicleType, ratePerKm, baseFare });
        const distance = (0, geoUtils_1.calculateDistance)(vendorLat, vendorLng, receiverLat, receiverLng);
        const distanceCost = distance * ratePerKm;
        const weightCost = (0, shippingRates_1.getWeightCost)(maxTotalWeight);
        totalCost = distanceCost + weightCost + baseFare;
        logger_1.default.info('Shipping cost breakdown', {
            distance_km: distance,
            weight_cost: weightCost,
            distance_cost: distanceCost,
            base_fare: baseFare,
            total_cost: totalCost,
        });
        const shippingPriceData = {
            price: Math.round(totalCost * 100) / 100,
            vehicleType,
            estimated_delivery_date: null,
        };
        logger_1.default.info('Final shipping price data', shippingPriceData);
        return shippingPriceData;
    });
}
function calculateDistance(lat1, lon1, lat2, lon2) {
    const earthRadius = 6371; // Radius of the Earth in kilometers
    // Convert from degrees to radians
    const toRadians = (degrees) => degrees * (Math.PI / 180);
    lat1 = toRadians(lat1);
    lon1 = toRadians(lon1);
    lat2 = toRadians(lat2);
    lon2 = toRadians(lon2);
    // Haversine formula
    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = earthRadius * c;
    return Math.round(distance * 100) / 100; // Distance in kilometers, rounded to 2 decimal places
}
function deliveryHistory(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const riderId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const page = parseInt(req.query.page, 10) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;
        try {
            const { rows: deliveries, count } = yield Delivery.findAndCountAll({
                where: {
                    rider_id: riderId,
                    delivery_status: 'delivered',
                    provider: 'alabaster'
                },
                order: [['time_of_delivery', 'DESC']],
                limit,
                offset
            });
            return res.status(200).json(responseData(true, 200, 'Delivery history retrieved successfully', {
                values: {
                    data: deliveries,
                    pagination: {
                        currentPage: page,
                        perPage: limit,
                        total: count,
                        lastPage: Math.ceil(count / limit)
                    }
                }
            }));
        }
        catch (error) {
            console.error(error);
            return res.status(500).json(responseData(false, 500, 'Server error', []));
        }
    });
}
