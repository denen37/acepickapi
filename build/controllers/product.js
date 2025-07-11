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
exports.deleteProduct = exports.updateProduct = exports.addProduct = exports.getProductTransactions = exports.getMyProducts = exports.getProducts = void 0;
const Models_1 = require("../models/Models");
const modules_1 = require("../utils/modules");
const sequelize_1 = require("sequelize");
const query_1 = require("../validation/query");
const body_1 = require("../validation/body");
const param_1 = require("../validation/param");
const ProductTransaction_1 = require("../models/ProductTransaction");
const enum_1 = require("../utils/enum");
const getProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = query_1.getProductSchema.safeParse(req.query);
    if (!result.success) {
        return res.status(400).json({
            status: false,
            message: 'Validation error',
            errors: result.error.flatten().fieldErrors,
        });
    }
    const { categoryId, category, search, state, lga, locationId, page, limit } = result.data;
    try {
        const products = yield Models_1.Product.findAll({
            where: Object.assign(Object.assign(Object.assign({}, (categoryId && { categoryId })), (search && { name: { [sequelize_1.Op.like]: `%${search}%` } })), (locationId && { locationId })),
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
            ]
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
            ]
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
const getProductTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    try {
        const result = param_1.productTransactionSchema.safeParse(req.params);
        if (!result.success) {
            return res.status(400).json({ error: result.error.format() });
        }
        const { status } = result.data;
        const productTransactions = yield ProductTransaction_1.ProductTransaction.findAll({
            where: Object.assign({}, (status === enum_1.ProductTransactionStatus.BOUGHT ? { buyerId: id } : { sellerId: id })),
            include: [{
                    model: Models_1.Product,
                }, {
                    model: Models_1.User,
                    as: status === enum_1.ProductTransactionStatus.BOUGHT ? 'seller' : 'buyer',
                    attributes: { exclude: ['password'] },
                    include: [
                        {
                            model: Models_1.Profile,
                            attributes: ['id', 'avatar', 'firstName', 'lastName']
                        }
                    ]
                }]
        });
        return (0, modules_1.successResponse)(res, 'success', productTransactions.map(productTransaction => {
            return Object.assign(Object.assign({}, productTransaction.toJSON()), { product: Object.assign(Object.assign({}, productTransaction.product.toJSON()), { images: JSON.parse(productTransaction.product.images || '[]') }) });
        }));
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, 'error', error.message);
    }
});
exports.getProductTransactions = getProductTransactions;
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
