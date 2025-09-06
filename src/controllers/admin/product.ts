import { Request, Response } from "express";
import { z } from "zod";
import { getProductSchema } from "../../validation/query";
import { errorResponse, handleResponse, successResponse } from "../../utils/modules";
import { Op } from "sequelize";
import { Category, Product, Location, User, Profile } from "../../models/Models";
import { sendPushNotification } from "../../services/notification";
import { approveProductEmail } from "../../utils/messages";
import { sendEmail } from "../../services/gmail";

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

        console.log(product?.toJSON())

        if (!product) {
            return handleResponse(res, 404, false, 'Product not found')
        }

        if (product.approved) {
            return handleResponse(res, 400, false, 'Product already approved')
        }

        product.approved = true;

        await product.save();

        const email = approveProductEmail(product);

        const { success, error } = await sendEmail(
            product.user.email,
            email.title,
            email.body,
            product.user.profile.firstName
        )


        if (product?.dataValues.user.fcmToken) {
            await sendPushNotification(
                product.dataValues.professional.fcmToken,
                'Product approved',
                `Your product - ${product.name} has been approved by admin`,
                {}
            );
        }

        return successResponse(res, 'success', { message: 'Product approved successfully', emailSentStatus: success });
    } catch (error) {
        console.log(error);
        return errorResponse(res, 'error', 'Failed to approve product')
    }
}