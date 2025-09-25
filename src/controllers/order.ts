import { Request, Response } from "express";
import { deliverySchema } from "../validation/body";
import { Activity, Location, Order, Product, ProductTransaction, Profile, Rider, Transaction, User, Wallet } from "../models/Models";
import { Accounts, CommissionScope, OrderMethod, OrderStatus, ProductTransactionStatus, TransactionStatus, TransactionType } from "../utils/enum";
import { errorResponse, getDistanceFromLatLonInKm, handleResponse, randomId, successResponse } from "../utils/modules";
import { DeliveryPricing } from "../models/DeliveryPricing";
import { Op, Sequelize } from 'sequelize';
import { getOrdersSchema } from "../validation/query";
import dbsequelize from "../config/db";
import { CommissionService } from "../services/CommissionService";
import { LedgerService } from "../services/ledgerService";

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
                },
                {
                    model: User,
                    as: 'buyer',
                    include: [Profile]
                }
            ]
        });

        if (!productTransaction) {
            return res.status(400).json({ errors: 'Product transaction not found' });
        }


        if (productTransaction.orderMethod !== OrderMethod.DELIVERY) {
            return res.status(400).json({ errors: 'Product transaction not meant for delivery' });
        }

        let existingLocation = null;

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
            return res.status(400).json({ errors: 'Dropoff location not found for product' });
        }

        if (!productTransaction.product.pickupLocation) {
            return res.status(400).json({ errors: 'Pickup location not found for product' });
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

        const newActivity = await Activity.create({
            userId: order.rider.id,
            action: `${productTransaction.buyer.profile.firstName} ${productTransaction.buyer.profile.lastName} has created Order #${order.id}`,
            type: 'Order created',
            status: 'success'
        })


        return successResponse(res, 'success', {
            ...order.toJSON(),
            totalCost: order.cost + productTransaction.price,
            productTransaction: productTransaction.toJSON()
        });
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
                    model: Location,
                    as: 'dropoffLocation'
                },
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
                        {
                            model: User,
                            as: 'seller',
                            attributes: ['id', 'email'],
                            include: [{
                                model: Profile,
                                attributes: ['id', 'avatar', 'firstName', 'lastName']

                            }]
                        },

                        {
                            model: User,
                            as: 'buyer',
                            attributes: ['id', 'email'],
                            include: [{
                                model: Profile,
                                attributes: ['id', 'avatar', 'firstName', 'lastName']

                            }]
                        }
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
                ...((status && status !== 'all') ? { status: status } : {})
            },
            include: [
                {
                    model: Location,
                    as: 'dropoffLocation'
                },
                {
                    model: ProductTransaction,
                    include: [
                        {
                            model: Product,
                            include: [{
                                model: Location,
                            }]
                        },
                        {
                            model: User,
                            as: 'seller',
                            attributes: ['id', 'email'],
                            include: [{
                                model: Profile,
                                attributes: ['id', 'avatar', 'firstName', 'lastName']

                            }]
                        },

                        {
                            model: User,
                            as: 'buyer',
                            attributes: ['id', 'email'],
                            include: [{
                                model: Profile,
                                attributes: ['id', 'avatar', 'firstName', 'lastName']

                            }]
                        }
                    ]
                },
                {
                    model: Location,
                }
            ],
            order: [['createdAt', 'DESC']]
        })

        return successResponse(res, 'success', orders);
    } catch (error) {
        console.log(error);
        return errorResponse(res, 'error', 'Error fetching orders')
    }
}

export const getOrdersBuyer = async (req: Request, res: Response) => {
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
                    model: Location,
                    as: 'dropoffLocation'
                },
                {
                    model: ProductTransaction,
                    where: {
                        buyerId: id,
                    },
                    include: [{
                        model: Product,
                        include: [{
                            model: Location,
                        }],
                    }, {
                        model: User,
                        as: 'seller',
                        attributes: ['id', 'email'],
                        include: [{
                            model: Profile,
                            attributes: ['id', 'avatar', 'firstName', 'lastName']

                        }]
                    }]
                },
                {
                    model: Location,
                }
            ],
            order: [['createdAt', 'DESC']]
        })


        return successResponse(res, 'success', orders)
    } catch (error) {
        console.log(error);

        return errorResponse(res, 'error', 'Error fetching orders')
    }
}


export const getOrdersSeller = async (req: Request, res: Response) => {
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
                    model: Location,
                    as: 'dropoffLocation'
                },
                {
                    model: ProductTransaction,
                    where: {
                        sellerId: id,
                    },
                    include: [{
                        model: Product,
                        include: [{
                            model: Location,
                        }],
                    }, {
                        model: User,
                        as: 'buyer',
                        attributes: ['id', 'email'],
                        include: [{
                            model: Profile,
                            attributes: ['id', 'avatar', 'firstName', 'lastName']

                        }]
                    }]
                },
                {
                    model: Location,
                }
            ],
            order: [['createdAt', 'DESC']]
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
        const order = await Order.findByPk(orderId, {
            include: [{
                model: User,
                include: [Profile]
            }]
        });

        if (!order) {
            return handleResponse(res, 404, false, 'Order not found')
        }

        if (order.status !== OrderStatus.PAID) {
            return handleResponse(res, 400, false, 'Order has not been paid yet')
        }

        order.status = OrderStatus.ACCEPTED;

        order.riderId = id;

        await order.save();

        const newActivity = await Activity.create({
            userId: order.rider.id,
            action: `${order.rider.profile.firstName} ${order.rider.profile.lastName} has accepted Order #${order.id}`,
            type: 'Order accepted',
            status: 'success'
        })

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
        const order = await Order.findByPk(orderId, {
            include: [{
                model: User,
                include: [Profile]
            }]
        });

        if (!order) {
            return handleResponse(res, 404, false, 'Order not found')
        }

        if (order.status !== OrderStatus.ACCEPTED) {
            return handleResponse(res, 400, false, 'Order not accepted')
        }

        order.status = OrderStatus.PICKED_UP;

        await order.save();

        const newActivity = await Activity.create({
            userId: order.rider.id,
            action: `${order.rider.profile.firstName} ${order.rider.profile.lastName} has picked up Order #${order.id}`,
            type: 'Order pickup',
            status: 'success'
        })

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
        const order = await Order.findByPk(orderId, {
            include: [{
                model: ProductTransaction,
                include: [{
                    model: User,
                    as: 'buyer',
                    include: [Profile]
                }]
            }]
        });

        if (!order) {
            return handleResponse(res, 404, false, 'Order not found')
        }

        if (order.status !== OrderStatus.PICKED_UP) {
            return handleResponse(res, 400, false, 'Order not picked up')
        }

        if (order.productTransaction.sellerId !== id) {
            return handleResponse(res, 403, false, 'You are not authorized to confirm this order')
        }

        order.status = OrderStatus.IN_TRANSIT;

        await order.save();

        const newActivity = await Activity.create({
            userId: order.productTransaction.buyer,
            action: `${order.productTransaction.buyer.profile.firstName} ${order.productTransaction.buyer.profile.lastName} has confirmed delivery of Order #${order.id}`,
            type: 'Order pickup confirmation',
            status: 'success'
        })


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
        const order = await Order.findByPk(orderId, {
            include: [{
                model: User,
                include: [Profile]
            }]
        });

        if (!order) {
            return handleResponse(res, 404, false, 'Order not found')
        }

        if (order.status !== OrderStatus.IN_TRANSIT) {
            return handleResponse(res, 400, false, 'Order not in transit')
        }

        order.status = OrderStatus.DELIVERED;

        await order.save();

        const newActivity = await Activity.create({
            userId: order.rider.id,
            action: `${order.rider.profile.firstName} ${order.rider.profile.lastName} has delivered Order #${order.id}`,
            type: 'Order delivery',
            status: 'success'
        })

        return successResponse(res, 'success', order);
    } catch (error) {
        return errorResponse(res, 'error', 'Error delivering order');
    }
}


export const confirmDelivery = async (req: Request, res: Response) => {
    const { id } = req.user;

    const { orderId } = req.params;

    // const t = await dbsequelize.transaction();

    try {
        const order = await Order.findByPk(orderId, {
            include: [{
                model: ProductTransaction,
                include: [{
                    model: User,
                    as: 'buyer',
                    include: [Profile]
                }]
            }]
        });

        if (!order) {
            return handleResponse(res, 404, false, 'Order not found')
        }

        if (order.status !== OrderStatus.DELIVERED) {
            return handleResponse(res, 400, false, 'Order not delivered')
        }

        if (order.productTransaction.buyerId !== id) {
            return handleResponse(res, 400, false, 'You are not authorized to confirm this order')
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

        let amount = Number(order.cost);

        const commission = await CommissionService.calculateCommission(amount, CommissionScope.DELIVERY);

        amount = amount - commission

        rider.wallet.previousBalance = rider.wallet.currentBalance;
        rider.wallet.currentBalance = Number(rider.wallet.currentBalance) + amount;

        await rider.wallet.save();

        const transaction = await Transaction.create({
            userId: rider.id,
            amount: amount,
            reference: randomId(12),
            status: TransactionStatus.PENDING,
            currency: 'NGN',
            timestamp: new Date(),
            description: 'wallet deposit',
            jobId: null,
            productTransactionId: order.productTransactionId,
            type: TransactionType.CREDIT
        })

        await LedgerService.createEntry([
            {
                transactionId: transaction.id,
                userId: transaction.userId,
                amount: transaction.amount + commission,
                type: TransactionType.DEBIT,
                account: Accounts.PLATFORM_ESCROW
            },

            {
                transactionId: transaction.id,
                userId: transaction.userId,
                amount: transaction.amount,
                type: TransactionType.CREDIT,
                account: Accounts.PROFESSIONAL_WALLET
            },

            {
                transactionId: transaction.id,
                userId: null,
                amount: commission,
                type: TransactionType.CREDIT,
                account: Accounts.PLATFORM_REVENUE
            }
        ])

        const newActivity = await Activity.create({
            userId: order.productTransaction.buyer,
            action: `${order.productTransaction.buyer.profile.firstName} ${order.productTransaction.buyer.profile.lastName} has confirmed delivery of Order #${order.id}`,
            type: 'Order confirmation',
            status: 'success'
        })

        return successResponse(res, 'success', order);
    } catch (error) {
        console.log(error);
        // await t.rollback();

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