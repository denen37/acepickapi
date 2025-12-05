import { Request, Response } from "express";
import { z } from "zod";
import { getProductSchema } from "../../validation/query";
import { errorResponse, handleResponse, successResponse } from "../../utils/modules";
import { Op } from "sequelize";
import { Category, Product, Location, User, Profile, Transaction, Order, ProductTransaction } from "../../models/Models";
import { sendPushNotification } from "../../services/notification";
import { approveProductEmail, rejectProductEmail } from "../../utils/messages";
import { sendEmail } from "../../services/gmail";
import { OrderStatus, ProductTransactionStatus, TransactionStatus } from "../../utils/enum";

export const getProducts = async (req: Request, res: Response) => {
    const result = getProductSchema.safeParse(req.query);

    if (!result.success) {
        return res.status(400).json({
            status: false,
            message: 'Validation error',
            errors: result.error.flatten().fieldErrors,
        });
    }

    const { approved, categoryId, category, search, state, lga, locationId, page, limit, orderBy, orderDir } = result.data;


    try {
        const data = await Product.findAndCountAll({
            where: {
                ...(approved !== undefined && { approved }),
                ...(categoryId && { categoryId }),
                ...(search && { name: { [Op.like]: `%${search}%` } }),
                ...(locationId && { locationId }),
            },
            limit: limit,
            offset: (page - 1) * limit,
            include: [
                {
                    model: Category,
                    attributes: ['id', 'name', 'description'],
                    where: {
                        ...(category && { name: { [Op.like]: `%${category}%` } })
                    }
                },
                {
                    model: Location,
                    where: {
                        ...(state && { state: { [Op.like]: `%${state}%` } }),
                        ...(lga && { lga: { [Op.like]: `%${lga}%` } }),

                    }
                    //attributes: ['id', 'name', 'description'],
                },
            ],
            order: [[orderBy || 'createdAt', orderDir || 'DESC']]
        })

        return successResponse(res, 'success', {
            products: data.rows.map((product: any) => {
                const plainProduct = product.toJSON();
                return {
                    ...plainProduct,
                    images: JSON.parse(plainProduct.images || '[]'),
                };
            }),

            page: page,
            limit: limit,
            total: data.count
        });

    } catch (error) {
        console.log(error)
        return errorResponse(res, 'error', 'Failed to retrieve products');
    }
}

export const approveProducts = async (req: Request, res: Response) => {
    try {
        const product = await Product.findByPk(
            req.params.productId,
            {
                include: [
                    {
                        model: User,
                        include: [Profile]
                    }
                ]
            }
        );


        if (!product) {
            return handleResponse(res, 404, false, 'Product not found')
        }

        if (product.approved) {
            return handleResponse(res, 400, false, 'Product already approved')
        }

        product.approved = true;

        await product.save();

        const prod = product.toJSON();

        const email = approveProductEmail(prod);

        const { success, error } = await sendEmail(
            prod.user.email,
            email.title,
            email.body,
            prod.user.profile.firstName
        )

        if (prod.user?.fcmToken) {
            await sendPushNotification(
                prod.user.fcmToken,
                'Product approved',
                `Your product - ${prod.name} has been approved by admin`,
                {}
            );
        }

        return successResponse(res, 'success', { message: 'Product approved successfully', emailSentStatus: success });
    } catch (error) {
        console.log(error);
        return errorResponse(res, 'error', 'Failed to approve product')
    }
}


export const rejectProducts = async (req: Request, res: Response) => {
    try {
        const product = await Product.findByPk(
            req.params.productId,
            {
                include: [
                    {
                        model: User,
                        include: [Profile]
                    }
                ]
            }
        );


        if (!product) {
            return handleResponse(res, 404, false, 'Product not found')
        }

        if (product.approved === false) {
            return handleResponse(res, 400, false, 'Product already rejected')
        }

        product.approved = false;

        await product.save();

        const prod = product.toJSON();

        const email = rejectProductEmail(prod);

        const { success, error } = await sendEmail(
            prod.user.email,
            email.title,
            email.body,
            prod.user.profile.firstName
        )

        if (prod.user?.fcmToken) {
            await sendPushNotification(
                prod.user.fcmToken,
                'Product rejected',
                `Your product - ${prod.name} has been rejected by admin`,
                {}
            );
        }

        return successResponse(res, 'success', { message: 'Product rejected successfully', emailSentStatus: success });
    } catch (error) {
        console.log(error);
        return errorResponse(res, 'error', 'Failed to reject product')
    }
}

export const marketOversight = async (req: Request, res: Response) => {
    try {
        const totalProducts = await Product.count();
        const pendingProducts = await Product.count({ where: { approved: null } });
        const approvedProducts = await Product.count({ where: { approved: true } });
        const rejectedProducts = await Product.count({ where: { approved: false } });
        const totalTransactions = await Transaction.count({ where: { status: TransactionStatus.SUCCESS } });
        const disputedProducts = await ProductTransaction.count({ where: { status: ProductTransactionStatus.DISPUTED } });

        return successResponse(res, 'success', {
            totalProducts,
            approvedProducts,
            rejectedProducts,
            pendingProducts,
            totalTransactions
        });
    } catch (error) {
        console.log(error);
        return errorResponse(res, 'error', 'Internal Server Error');
    }
}


export const deliveryOversight = async (req: Request, res: Response) => {
    try {
        const totalDeliveries = await Order.count();
        const unassignedDeliveries = await Order.count({ where: { status: OrderStatus.PAID } });
        const assignedDeliveries = await Order.count({ where: { status: OrderStatus.ACCEPTED } });
        const pickedUpDevliveries = await Order.count({ where: { status: OrderStatus.CONFIRM_PICKUP } });
        const completedDeliveries = await Order.count({ where: { status: OrderStatus.CONFIRM_DELIVERY } });
        const disputedDeliveries = await Order.count({ where: { status: OrderStatus.DISPUTED } });

        return successResponse(res, 'success', {
            totalDeliveries,
            unassignedDeliveries,
            assignedDeliveries,
            pickedUpDevliveries,
            completedDeliveries,
            disputedDeliveries
        });
    } catch (error) {
        console.log(error);
        return errorResponse(res, 'error', 'Internal Server Error');
    }
}