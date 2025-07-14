import { Request, Response } from 'express';
import { Product, Category, Location, Profile, User } from '../models/Models';
import { successResponse, errorResponse } from '../utils/modules';
import { Op } from 'sequelize';
import { getProductSchema } from '../validation/query';
import { createProductSchema, selectProductSchema, updateProductSchema } from '../validation/body';
import { productTransactionSchema } from '../validation/param';
import { ProductTransaction } from '../models/ProductTransaction';
import { ProductTransactionStatus } from '../utils/enum';

export const getProducts = async (req: Request, res: Response) => {
    const result = getProductSchema.safeParse(req.query);

    if (!result.success) {
        return res.status(400).json({
            status: false,
            message: 'Validation error',
            errors: result.error.flatten().fieldErrors,
        });
    }

    const { categoryId, category, search, state, lga, locationId, page, limit } = result.data;


    try {
        const products = await Product.findAll({
            where: {
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
            ]
        })

        return successResponse(res, 'success', products.map(product => {
            const plainProduct = product.toJSON(); // or product.get({ plain: true });
            return {
                ...plainProduct,
                images: JSON.parse(plainProduct.images || '[]'),
            };
        }));

    } catch (error) {
        return errorResponse(res, 'error', 'Failed to retrieve products');
    }
}


export const getMyProducts = async (req: Request, res: Response) => {
    const { id, role } = req.user

    try {
        const products = await Product.findAll({
            where: {
                userId: id
            },
            include: [
                {
                    model: Category,
                    attributes: ['id', 'name', 'description'],
                },
                {
                    model: Location,
                    //attributes: ['id', 'name', 'description'],
                },
            ]
        })

        return successResponse(res, 'success', products.map(product => {
            const plainProduct = product.toJSON(); // or product.get({ plain: true });
            return {
                ...plainProduct,
                images: JSON.parse(plainProduct.images || '[]'),
            };
        }));

    } catch (error) {
        return errorResponse(res, 'error', 'Failed to retrieve products');
    }
}

export const getProductTransactions = async (req: Request, res: Response) => {
    const { id } = req.user;

    try {
        const result = productTransactionSchema.safeParse(req.params);

        if (!result.success) {
            return res.status(400).json({ error: result.error.format() });
        }

        const { status } = result.data;

        const productTransactions = await ProductTransaction.findAll({
            where: {
                ...(status === ProductTransactionStatus.BOUGHT ? { buyerId: id } : { sellerId: id }),
            },
            include: [{
                model: Product,
            }, {
                model: User,
                as: status === ProductTransactionStatus.BOUGHT ? 'seller' : 'buyer',
                attributes: { exclude: ['password'] },
                include: [
                    {
                        model: Profile,
                        attributes: ['id', 'avatar', 'firstName', 'lastName']
                    }
                ]
            }]
        })

        return successResponse(res, 'success', productTransactions.map(productTransaction => {
            return {
                ...productTransaction.toJSON(),
                product: {
                    ...productTransaction.product.toJSON(),
                    images: JSON.parse(productTransaction.product.images || '[]')
                }
            }
        }))
    } catch (error: any) {
        return errorResponse(res, 'error', error.message);
    }
}


export const selectProduct = async (req: Request, res: Response) => {
    try {
        const result = selectProductSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({ error: result.error.format() });
        }

        const { productId, quantity } = result.data;

        const product = await Product.findByPk(productId);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const productTransaction = await ProductTransaction.create({
            productId,
            quantity,
            buyerId: req.user.id,
            sellerId: product.userId,
            price: product.price * quantity - product.discount * quantity,
            date: new Date()
        })

        return successResponse(res, 'success', productTransaction)
    } catch (error: any) {
        return errorResponse(res, 'error', error.message);
    }
}

export const addProduct = async (req: Request, res: Response) => {
    try {

        const result = createProductSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                status: false,
                message: 'Validation error',
                errors: result.error.flatten().fieldErrors,
            });
        }

        const { name, description, images, categoryId, quantity, price, discount, userId, locationId } = result.data;

        const newProduct = await Product.create({
            name,
            description,
            images: JSON.stringify(images),
            categoryId,
            quantity,
            price,
            discount,
            userId,
            locationId
        });

        return successResponse(res, 'Product added successfully', newProduct);
    } catch (error) {
        return errorResponse(res, 'error', 'Failed to add product');
    }
}



export const updateProduct = async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = updateProductSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            status: false,
            message: 'Validation Errors',
            errors: result.error.flatten().fieldErrors
        })
    }

    try {
        const updated = await Product.update(result.data, {
            where: {
                id: id
            }
        })

        return successResponse(res, 'success', "Product updated successfully")
    } catch (error: any) {
        return errorResponse(res, 'error', "Error updating product!")
    }
}

export const deleteProduct = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        await Product.destroy({
            where: {
                id
            }
        })

        return successResponse(res, 'success', "Product deleted successfully")
    } catch (error: any) {
        return errorResponse(res, 'error', 'There was error deleting products');
    }
}