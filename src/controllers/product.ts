import { Request, Response } from 'express';
import { Product, Category, Location, Profile, User, Wallet, Order } from '../models/Models';
import { successResponse, errorResponse } from '../utils/modules';
import { Op } from 'sequelize';
import { boughtProductSchema, getProductSchema } from '../validation/query';
import { createProductSchema, productTransactionIdSchema, restockProductSchema, selectProductSchema, updateProductSchema } from '../validation/body';
import { ProductTransaction } from '../models/ProductTransaction';
import { Fn } from 'sequelize/types/utils';

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


export const getProduct = async (req: Request, res: Response) => {
    const { id } = req.params

    try {
        const product = await Product.findByPk(id, {
            include: [{
                model: Category,
            }, {
                model: Location,
            }, {
                model: User,
                attributes: { exclude: ['password', 'fcmToken'] },
                include: [{
                    model: Profile
                }]
            }]
        })

        const productObj = product?.toJSON();

        return successResponse(res, 'success', {
            ...productObj,
            images: JSON.parse(productObj.images || '[]'),
        })
    } catch (error) {
        return errorResponse(res, 'error', 'Failed to retrieve product');
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

export const boughtProducts = async (req: Request, res: Response) => {
    const { id, role } = req.user

    try {
        const result = boughtProductSchema.safeParse(req.query);

        if (!result.success) {
            return res.status(400).json({ error: result.error.format() });
        }

        const { status } = result.data;

        const productsTrans = await ProductTransaction.findAll({
            where: {
                buyerId: id,
                ...(status ? { status } : {})
            },

            include: [{
                model: Product,
            }, {
                model: Order,
                as: 'order',
                include: [{
                    model: User,
                    attributes: ['id', 'email'],
                    include: [{
                        model: Profile,
                        attributes: ['id', 'avatar', 'firstName', 'lastName']
                    }]
                }]
            }, {
                model: User,
                as: 'seller',
                attributes: { exclude: ['password', 'fcmToken'] },
                include: [{
                    model: Profile,
                    attributes: ['id', 'avatar', 'firstName', 'lastName']
                }]
            }],

            order: [['updatedAt', 'DESC']]
        })

        return successResponse(res, 'success', productsTrans.map((bought) => {
            const boughtObj = bought.toJSON();
            return {
                ...boughtObj,
                product: { ...boughtObj.product, images: JSON.parse(boughtObj.product.images) },
            }
        }))
    } catch (error) {
        return errorResponse(res, 'error', 'Failed to retrieve product transactions');
    }
}


export const soldProducts = async (req: Request, res: Response) => {
    const { id, role } = req.user

    try {
        const result = boughtProductSchema.safeParse(req.query);

        if (!result.success) {
            return res.status(400).json({ error: result.error.format() });
        }

        const { status } = result.data;


        const productsTrans = await ProductTransaction.findAll({
            where: {
                sellerId: id,
                ...(status ? { status } : {})
            },

            include: [{
                model: Product,
            }, {
                model: Order,
                as: 'order',
                include: [{
                    model: User,
                    attributes: ['id', 'email'],
                    include: [{
                        model: Profile,
                        attributes: ['id', 'avatar', 'firstName', 'lastName']
                    }]
                }]
            }, {
                model: User,
                as: 'buyer',
                attributes: { exclude: ['password', 'fcmToken'] },
                include: [{
                    model: Profile,
                    attributes: ['id', 'avatar', 'firstName', 'lastName']
                }]
            }, {
                model: User,
                as: 'buyer',
                attributes: { exclude: ['password', 'fcmToken'] },
                include: [{
                    model: Profile,
                    attributes: ['id', 'avatar', 'firstName', 'lastName']
                }]
            }],

            order: [['updatedAt', 'DESC']]
        })

        return successResponse(res, 'success', productsTrans.map((sold) => {
            const soldObj = sold.toJSON();
            return {
                ...soldObj,
                product: { ...soldObj.product, images: JSON.parse(soldObj.product.images) },
            }
        }))
    } catch (error) {
        return errorResponse(res, 'error', 'Failed to retrieve product transactions');
    }
}


export const restockProduct = async (req: Request, res: Response) => {
    try {
        const result = restockProductSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({ error: result.error.format() });
        }

        const { productId, quantity } = result.data;

        const product = await Product.findByPk(productId);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        product.quantity += quantity;
        await product.save();

        return successResponse(res, 'success', {
            ...product.toJSON(), images: JSON.parse(product.images)
        });
    } catch (error: any) {
        return errorResponse(res, 'error', error.message);
    }
}


// export const acceptProduct = async (req: Request, res: Response) => {
//     try {
//         const result = productTransactionIdSchema.safeParse(req.body);

//         if (!result.success) {
//             return res.status(400).json({ error: result.error.format() });
//         }

//         const { productTransactionId } = result.data;

//         const productTransaction = await ProductTransaction.findByPk(productTransactionId, {
//             include: [
//                 {
//                     model: User,
//                     as: 'seller',
//                     include: [Wallet]
//                 }
//             ]
//         });

//         if (productTransaction?.status !== ProductTransactionStatus.ORDERED) {
//             return res.status(400).json({ error: 'Product transaction is not ordered' });
//         }

//         if (!productTransaction) {
//             return res.status(404).json({ error: 'Product transaction not found' });
//         }

//         productTransaction.status = ProductTransactionStatus.DELIVERED;

//         await productTransaction.save();

//         //Credit seller
//         let prevAmount = Number(productTransaction.seller.wallet.currentBalance);
//         let newPrice = Number(productTransaction.price);

//         productTransaction.seller.wallet.previousBalance = prevAmount;
//         productTransaction.seller.wallet.currentBalance = prevAmount + newPrice;

//         await productTransaction.seller.wallet.save();

//         return successResponse(res, 'success', 'Product transaction accepted')
//     } catch (error: any) {
//         return errorResponse(res, 'error', error.message);
//     }
// }


export const selectProduct = async (req: Request, res: Response) => {
    try {
        const result = selectProductSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({ error: result.error.format() });
        }

        const { productId, quantity, orderMethod } = result.data;

        const product = await Product.findByPk(productId);


        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        if (product.quantity < quantity) {
            return res.status(400).json({ error: 'Product quantity is not enough' });

        }

        const productTransaction = await ProductTransaction.create({
            productId,
            quantity,
            buyerId: req.user.id,
            sellerId: product.userId,
            price: product.price * quantity - product.discount * quantity,
            orderMethod,
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