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
exports.getProductTransactionById = exports.deleteProduct = exports.updateProduct = exports.addProduct = exports.selectProduct = exports.restockProduct = exports.soldProducts = exports.boughtProducts = exports.getMyProducts = exports.getProduct = exports.getProducts = void 0;
const Models_1 = require("../models/Models");
const modules_1 = require("../utils/modules");
const sequelize_1 = require("sequelize");
const query_1 = require("../validation/query");
const body_1 = require("../validation/body");
const ProductTransaction_1 = require("../models/ProductTransaction");
const getProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = query_1.getProductSchema.safeParse(req.query);
    if (!result.success) {
        return res.status(400).json({
            status: false,
            message: 'Validation error',
            errors: result.error.flatten().fieldErrors,
        });
    }
    const { categoryId, category, search, state, lga, locationId, page, limit, orderBy, orderDir } = result.data;
    try {
        const products = yield Models_1.Product.findAll({
            where: Object.assign(Object.assign(Object.assign({ approved: true }, (categoryId && { categoryId })), (search && { name: { [sequelize_1.Op.like]: `%${search}%` } })), (locationId && { locationId })),
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
        return (0, modules_1.successResponse)(res, 'success', products.map(product => {
            const plainProduct = product.toJSON(); // or product.get({ plain: true });
            return Object.assign(Object.assign({}, plainProduct), { images: JSON.parse(plainProduct.images || '[]') });
        }));
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, 'error', 'Failed to retrieve products');
    }
});
exports.getProducts = getProducts;
const getProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const product = yield Models_1.Product.findByPk(id, {
            include: [{
                    model: Models_1.Category,
                }, {
                    model: Models_1.Location,
                }, {
                    model: Models_1.User,
                    attributes: { exclude: ['password', 'fcmToken'] },
                    include: [{
                            model: Models_1.Profile
                        }]
                }]
        });
        const productObj = product === null || product === void 0 ? void 0 : product.toJSON();
        return (0, modules_1.successResponse)(res, 'success', Object.assign(Object.assign({}, productObj), { images: JSON.parse(productObj.images || '[]') }));
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, 'error', 'Failed to retrieve product');
    }
});
exports.getProduct = getProduct;
const getMyProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, role } = req.user;
    try {
        const products = yield Models_1.Product.findAll({
            where: {
                userId: id
            },
            include: [
                {
                    model: Models_1.Category,
                    attributes: ['id', 'name', 'description'],
                },
                {
                    model: Models_1.Location,
                    //attributes: ['id', 'name', 'description'],
                },
            ],
            order: [['createdAt', 'DESC']]
        });
        return (0, modules_1.successResponse)(res, 'success', products.map(product => {
            const plainProduct = product.toJSON(); // or product.get({ plain: true });
            return Object.assign(Object.assign({}, plainProduct), { images: JSON.parse(plainProduct.images || '[]') });
        }));
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, 'error', 'Failed to retrieve products');
    }
});
exports.getMyProducts = getMyProducts;
const boughtProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, role } = req.user;
    try {
        const result = query_1.boughtProductSchema.safeParse(req.query);
        if (!result.success) {
            return res.status(400).json({ error: result.error.format() });
        }
        const { status } = result.data;
        const productsTrans = yield ProductTransaction_1.ProductTransaction.findAll({
            where: Object.assign({ buyerId: id }, ((status && status !== 'all') ? { status } : {})),
            include: [{
                    model: Models_1.Product,
                }, {
                    model: Models_1.Order,
                    as: 'order',
                    include: [{
                            model: Models_1.User,
                            attributes: ['id', 'email'],
                            include: [{
                                    model: Models_1.Profile,
                                    attributes: ['id', 'avatar', 'firstName', 'lastName']
                                }]
                        }]
                }, {
                    model: Models_1.User,
                    as: 'seller',
                    attributes: { exclude: ['password', 'fcmToken'] },
                    include: [{
                            model: Models_1.Profile,
                            attributes: ['id', 'avatar', 'firstName', 'lastName']
                        }]
                }],
            order: [['updatedAt', 'DESC']]
        });
        return (0, modules_1.successResponse)(res, 'success', productsTrans.map((bought) => {
            const boughtObj = bought.toJSON();
            return Object.assign(Object.assign({}, boughtObj), { product: Object.assign(Object.assign({}, boughtObj.product), { images: JSON.parse(boughtObj.product.images) }) });
        }));
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, 'error', 'Failed to retrieve product transactions');
    }
});
exports.boughtProducts = boughtProducts;
const soldProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, role } = req.user;
    try {
        const result = query_1.boughtProductSchema.safeParse(req.query);
        if (!result.success) {
            return res.status(400).json({ error: result.error.format() });
        }
        const { status } = result.data;
        const productsTrans = yield ProductTransaction_1.ProductTransaction.findAll({
            where: Object.assign({ sellerId: id }, ((status && status !== 'all') ? { status } : {})),
            include: [{
                    model: Models_1.Product,
                }, {
                    model: Models_1.Order,
                    as: 'order',
                    include: [{
                            model: Models_1.User,
                            attributes: ['id', 'email'],
                            include: [{
                                    model: Models_1.Profile,
                                    attributes: ['id', 'avatar', 'firstName', 'lastName']
                                }]
                        }]
                }, {
                    model: Models_1.User,
                    as: 'buyer',
                    attributes: { exclude: ['password', 'fcmToken'] },
                    include: [{
                            model: Models_1.Profile,
                            attributes: ['id', 'avatar', 'firstName', 'lastName']
                        }]
                }, {
                    model: Models_1.User,
                    as: 'buyer',
                    attributes: { exclude: ['password', 'fcmToken'] },
                    include: [{
                            model: Models_1.Profile,
                            attributes: ['id', 'avatar', 'firstName', 'lastName']
                        }]
                }],
            order: [['updatedAt', 'DESC']]
        });
        return (0, modules_1.successResponse)(res, 'success', productsTrans.map((sold) => {
            const soldObj = sold.toJSON();
            return Object.assign(Object.assign({}, soldObj), { product: Object.assign(Object.assign({}, soldObj.product), { images: JSON.parse(soldObj.product.images) }) });
        }));
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, 'error', 'Failed to retrieve product transactions');
    }
});
exports.soldProducts = soldProducts;
const restockProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = body_1.restockProductSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ error: result.error.format() });
        }
        const { productId, quantity } = result.data;
        const product = yield Models_1.Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        product.quantity += quantity;
        yield product.save();
        return (0, modules_1.successResponse)(res, 'success', Object.assign(Object.assign({}, product.toJSON()), { images: JSON.parse(product.images) }));
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, 'error', error.message);
    }
});
exports.restockProduct = restockProduct;
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
const selectProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = body_1.selectProductSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ error: result.error.format() });
        }
        const { productId, quantity, orderMethod } = result.data;
        const product = yield Models_1.Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        if (product.quantity < quantity) {
            return res.status(400).json({ error: 'Product quantity is not enough' });
        }
        const productTransaction = yield ProductTransaction_1.ProductTransaction.create({
            productId,
            quantity,
            buyerId: req.user.id,
            sellerId: product.userId,
            price: product.price * quantity - product.discount * quantity,
            orderMethod,
            date: new Date()
        });
        return (0, modules_1.successResponse)(res, 'success', productTransaction);
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, 'error', error.message);
    }
});
exports.selectProduct = selectProduct;
const addProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = body_1.createProductSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                status: false,
                message: 'Validation error',
                errors: result.error.flatten().fieldErrors,
            });
        }
        const { name, description, images, categoryId, quantity, price, discount, userId, locationId } = result.data;
        const newProduct = yield Models_1.Product.create({
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
        return (0, modules_1.successResponse)(res, 'Product added successfully', newProduct);
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, 'error', 'Failed to add product');
    }
});
exports.addProduct = addProduct;
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = body_1.updateProductSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            status: false,
            message: 'Validation Errors',
            errors: result.error.flatten().fieldErrors
        });
    }
    try {
        const updated = yield Models_1.Product.update(result.data, {
            where: {
                id: id
            }
        });
        return (0, modules_1.successResponse)(res, 'success', "Product updated successfully");
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, 'error', "Error updating product!");
    }
});
exports.updateProduct = updateProduct;
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        yield Models_1.Product.destroy({
            where: {
                id
            }
        });
        return (0, modules_1.successResponse)(res, 'success', "Product deleted successfully");
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, 'error', 'There was error deleting products');
    }
});
exports.deleteProduct = deleteProduct;
const getProductTransactionById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const productTransaction = yield ProductTransaction_1.ProductTransaction.findByPk(id, {
            include: [{
                    model: Models_1.Product,
                    include: [{
                            model: Models_1.Category,
                        }, {
                            model: Models_1.Location,
                            as: 'pickupLocation'
                        }]
                }, {
                    model: Models_1.Order,
                    as: 'order',
                    include: [
                        {
                            model: Models_1.User,
                            as: 'rider',
                            attributes: { exclude: ['password', 'fcmToken'] },
                            include: [{
                                    model: Models_1.Profile,
                                    attributes: ['id', 'avatar', 'firstName', 'lastName']
                                }]
                        }, {
                            model: Models_1.Location,
                            as: 'dropoffLocation'
                        }
                    ]
                }, {
                    model: Models_1.Transaction
                }, {
                    model: Models_1.User,
                    as: 'buyer',
                    attributes: { exclude: ['password', 'fcmToken'] },
                    include: [{
                            model: Models_1.Profile,
                            attributes: ['id', 'avatar', 'firstName', 'lastName']
                        }]
                }, {
                    model: Models_1.User,
                    as: 'seller',
                    attributes: { exclude: ['password', 'fcmToken'] },
                    include: [{
                            model: Models_1.Profile,
                            attributes: ['id', 'avatar', 'firstName', 'lastName']
                        }]
                }]
        });
        return (0, modules_1.successResponse)(res, 'success', productTransaction);
    }
    catch (error) {
        console.log(error);
        return (0, modules_1.errorResponse)(res, 'error', 'Failed to retrieve product transaction');
    }
});
exports.getProductTransactionById = getProductTransactionById;
