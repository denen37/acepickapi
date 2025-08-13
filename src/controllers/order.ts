import { Request, Response } from "express";
import { deliverySchema } from "../validation/body";
import { Location, Order, Product, ProductTransaction, Rider, User, Wallet } from "../models/Models";
import { OrderMethod, OrderStatus, ProductTransactionStatus } from "../utils/enum";
import { errorResponse, getDistanceFromLatLonInKm, handleResponse, successResponse } from "../utils/modules";
import { DeliveryPricing } from "../models/DeliveryPricing";
import { Sequelize } from 'sequelize';
import { getOrdersSchema } from "../validation/query";
import dbsequelize from "../config/db";

export const createOrder = async (req: Request, res: Response) => {
    const { id } = req.user;

    try {
        const parsed = deliverySchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({ errors: parsed.error.flatten() });
        }

        const { productTransactionId, receiverLat, receiverLong, address, locationId, vehicleType } = parsed.data;


        const productTransaction = await ProductTransaction.findOne({
            where: {
                id: productTransactionId,
                buyerId: id,
                // orderMethod: OrderMethod.DELIVERY,
                // status: ProductTransactionStatus.PENDING
            },
            include: [
                {
                    model: Product,
                    include: [Location]
                }
            ]
        });

        if (!productTransaction) {
            return res.status(400).json({ errors: 'Product transaction not found' });
        }

        // if (productTransaction.status !== ProductTransactionStatus.PENDING) {
        //     return res.status(400).json({ errors: 'Product transaction not pending' });
        // }

        if (productTransaction.orderMethod !== OrderMethod.DELIVERY) {
            return res.status(400).json({ errors: 'Product transaction not meant for delivery' });
        }

        let existingLocation = null;

        console.log('lat', receiverLat, 'long', receiverLong)

        if (locationId) {
            existingLocation = await Location.findOne({
                where: {
                    id: locationId,
                    userId: id
                }
            })
        } else {
            existingLocation = await Location.create({
                latitude: receiverLat,
                longitude: receiverLong,
                address,
                userId: id
            })
        }

        if (!existingLocation) {
            return res.status(400).json({ errors: 'Location not found' });
        }

        const vendorLat = productTransaction.product.pickupLocation.latitude;
        const vendorLong = productTransaction.product.pickupLocation.longitude;

        const clientLat = existingLocation?.latitude;
        const clientLong = existingLocation?.longitude;


        let distance = getDistanceFromLatLonInKm(vendorLat, vendorLong, clientLat, clientLong)

        const pricing = await DeliveryPricing.findOne({
            where: {
                vehicleType: vehicleType,
            }
        })

        if (!pricing) {
            return res.status(400).json({ errors: 'Delivery pricing not found for the vehicle type' });
        }

        const distanceCost = distance * Number(pricing?.costPerKm)

        const totalWeight = Number(productTransaction.product.weightPerUnit) * Number(productTransaction.quantity);

        const weightCost = totalWeight * Number(pricing?.costPerKg)

        const baseCost = Number(pricing?.baseCost)

        const totalCost = distanceCost + weightCost + baseCost



        const order = await Order.create({
            productTransactionId,
            cost: totalCost,
            distance: distance,
            weight: totalWeight,
            locationId: existingLocation?.id,
        })

        return successResponse(res, 'success', order);
    } catch (error) {
        console.log(error);
        return errorResponse(res, 'error', 'Error creating order')
    }
}


export const getNearestPaidOrders = async (req: Request, res: Response) => {
    const { id } = req.user

    try {
        const rider = await Rider.findOne({
            where: { userId: id },
            include: [
                {
                    model: User,
                    include: [Location]
                }
            ]
        })

        if (!rider) {
            return handleResponse(res, 404, false, 'You are not a rider')
        }

        const riderLat = rider.user.location.latitude;
        const riderLong = rider.user.location.longitude;

        if (!riderLat || !riderLong) {
            return handleResponse(res, 400, false, 'Please update your location')
        }


        const orders = await Order.findAll({
            where: {
                riderId: null,
                status: OrderStatus.PAID,
            },
            include: [
                {
                    model: ProductTransaction,
                    include: [
                        {
                            model: Product,
                            include: [
                                {
                                    model: Location,
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
            const pickup = order.productTransaction?.product?.pickupLocation;

            if (pickup && pickup.latitude && pickup.longitude) {
                const distance = getDistanceFromLatLonInKm(
                    riderLat,
                    riderLong,
                    pickup.latitude,
                    pickup.longitude
                );

                return {
                    ...order.toJSON(),
                    distance,
                };
            }

            return {
                ...order.toJSON(),
                distance: null,
            };
        });


        ordersWithDistance.sort((a, b) => a.distance - b.distance);


        return successResponse(res, 'success', ordersWithDistance);
    } catch (error) {
        console.log(error);
        return errorResponse(res, 'error', 'Error fetching orders')
    }
}


export const getOrdersRider = async (req: Request, res: Response) => {
    const { id } = req.user;

    const parsed = getOrdersSchema.safeParse(req.query);

    if (!parsed.success) {
        return res.status(400).json({ errors: parsed.error.flatten() });
    }

    const { status, page, limit } = parsed.data;

    try {
        const orders = await Order.findAll({
            where: {
                riderId: id,
                ...(status ? { status: status } : {})
            },
            include: [
                {
                    model: ProductTransaction,
                    include: [{
                        model: Product,
                        include: [{
                            model: Location,
                        }]
                    }]
                },
                {
                    model: Location,
                }
            ]
        })

        return successResponse(res, 'success', orders);
    } catch (error) {
        console.log(error);
        return errorResponse(res, 'error', 'Error fetching orders')
    }
}

export const getOrdersClient = async (req: Request, res: Response) => {
    const { id } = req.user;

    const parsed = getOrdersSchema.safeParse(req.query);

    if (!parsed.success) {
        return res.status(400).json({ errors: parsed.error.flatten() });
    }

    const { status, page, limit } = parsed.data;

    try {
        const orders = await Order.findAll({
            where: {
                ...(status ? { status: status } : {})
            },
            include: [
                {
                    model: ProductTransaction,
                    where: {
                        buyerId: id
                    },
                    include: [{
                        model: Product,
                        include: [{
                            model: Location,
                        }]
                    }]
                },
                {
                    model: Location,
                }
            ]
        })


        return successResponse(res, 'success', orders)
    } catch (error) {
        console.log(error);

        return errorResponse(res, 'error', 'Error fetching orders')
    }
}

export const acceptOrder = async (req: Request, res: Response) => {
    const { id } = req.user;

    const { orderId } = req.params;

    try {
        const order = await Order.findByPk(orderId);

        if (!order) {
            return handleResponse(res, 404, false, 'Order not found')
        }

        if (order.status !== OrderStatus.PAID) {
            return handleResponse(res, 400, false, 'Order has not been paid yet')
        }

        order.status = OrderStatus.ACCEPTED;

        order.riderId = id;

        await order.save();

        return successResponse(res, 'success', order);
    } catch (error) {
        console.log(error);
        return errorResponse(res, 'error', 'Error accepting order')
    }
}

export const pickupOrder = async (req: Request, res: Response) => {
    const { id } = req.user;

    const { orderId } = req.params;

    try {
        const order = await Order.findByPk(orderId);

        if (!order) {
            return handleResponse(res, 404, false, 'Order not found')
        }

        if (order.status !== OrderStatus.ACCEPTED) {
            return handleResponse(res, 400, false, 'Order not accepted')
        }

        order.status = OrderStatus.PICKED_UP;

        await order.save();

        return successResponse(res, 'success', order);
    } catch (error) {
        console.log(error);
        return errorResponse(res, 'error', 'Error reporting pickup')
    }
}

export const confirmPickup = async (req: Request, res: Response) => {
    const { id } = req.user;

    const { orderId } = req.params;

    try {
        const order = await Order.findByPk(orderId);

        if (!order) {
            return handleResponse(res, 404, false, 'Order not found')
        }

        if (order.status !== OrderStatus.PICKED_UP) {
            return handleResponse(res, 400, false, 'Order not picked up')
        }

        order.status = OrderStatus.CONFIRM_PICKUP;

        await order.save();

        return successResponse(res, 'success', order);
    } catch (error) {
        console.log(error);
        return errorResponse(res, 'error', 'Error confirming pickup');
    }
}



export const transportOrder = async (req: Request, res: Response) => {
    const { id } = req.user;

    const { orderId } = req.params;

    try {
        const order = await Order.findByPk(orderId);

        if (!order) {
            return handleResponse(res, 404, false, 'Order not found')
        }

        if (order.status !== OrderStatus.CONFIRM_PICKUP) {
            return handleResponse(res, 400, false, 'Order not confirmed for pickup')
        }

        order.status = OrderStatus.IN_TRANSIT;

        await order.save();

        return successResponse(res, 'success', order);
    } catch (error) {
        console.log(error);
        return errorResponse(res, 'error', 'Error transporting pickup');
    }
}

export const deliverOrder = async (req: Request, res: Response) => {
    const { id } = req.user;

    const { orderId } = req.params;

    try {
        const order = await Order.findByPk(orderId);

        if (!order) {
            return handleResponse(res, 404, false, 'Order not found')
        }

        if (order.status !== OrderStatus.IN_TRANSIT) {
            return handleResponse(res, 400, false, 'Order not in transit')
        }

        order.status = OrderStatus.DELIVERED;

        await order.save();

        return successResponse(res, 'success', order);
    } catch (error) {
        return errorResponse(res, 'error', 'Error delivering order');
    }
}


export const confirmDelivery = async (req: Request, res: Response) => {
    const { id } = req.user;

    const { orderId } = req.params;

    const t = await dbsequelize.transaction();

    try {
        const order = await Order.findByPk(orderId);

        if (!order) {
            return handleResponse(res, 404, false, 'Order not found')
        }

        if (order.status !== OrderStatus.DELIVERED) {
            return handleResponse(res, 400, false, 'Order not delivered')
        }

        order.status = OrderStatus.CONFIRM_DELIVERY;

        await order.save();

        const rider = await User.findOne({
            where: {
                id: order.riderId
            },
            include: [Wallet]
        })

        if (!rider) {
            throw new Error('Rider not found')
        }

        rider.wallet.previousBalance = rider.wallet.currentBalance;
        rider.wallet.currentBalance = Number(rider.wallet.currentBalance) + Number(order.cost);

        await rider.wallet.save();

        await t.commit();

        return successResponse(res, 'success', order);
    } catch (error) {
        console.log(error);
        await t.rollback();

        return errorResponse(res, 'error', 'Error confirming delivery');
    }
}


export const cancelOrder = async (req: Request, res: Response) => {
    const { id } = req.user;

    const { orderId } = req.params;

    try {
        const order = await Order.findByPk(orderId);

        if (!order) {
            return handleResponse(res, 404, false, 'Order not found')
        }

        if (order.status !== OrderStatus.PENDING) {
            return handleResponse(res, 400, false, 'Order not pending')
        }


        order.status = OrderStatus.CANCELLED;

        await order.save();

        return successResponse(res, 'success', order);
    } catch (error) {
        console.log(error);
        return errorResponse(res, 'error', 'Error cancelling order');
    }
}