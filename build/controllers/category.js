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
exports.deleteCategory = exports.updateCategory = exports.addCategory = exports.getCategories = void 0;
const Models_1 = require("../models/Models");
const modules_1 = require("../utils/modules");
const getCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield Models_1.Category.findAll({
            order: [['name', 'ASC']]
        });
        return (0, modules_1.successResponse)(res, 'success', categories);
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, 'error', 'Failed to retrieve categories');
    }
});
exports.getCategories = getCategories;
const addCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description } = req.body;
        if (!name) {
            return (0, modules_1.errorResponse)(res, 'error', 'Category name is required');
        }
        const newCategory = yield Models_1.Category.create({ name, description });
        return (0, modules_1.successResponse)(res, 'Category added successfully', newCategory);
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, 'error', 'Failed to add category');
    }
});
exports.addCategory = addCategory;
const updateCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const category = yield Models_1.Category.findByPk(id);
        if (!category) {
            return (0, modules_1.errorResponse)(res, 'error', 'Category not found');
        }
        category.name = name || category.name;
        category.description = description || category.description;
        yield category.save();
        return (0, modules_1.successResponse)(res, 'Category updated successfully', category);
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, 'error', 'Failed to update category');
    }
});
exports.updateCategory = updateCategory;
const deleteCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const category = yield Models_1.Category.findByPk(id);
        if (!category) {
            return (0, modules_1.errorResponse)(res, 'error', 'Category not found');
        }
        yield category.destroy();
        return (0, modules_1.successResponse)(res, 'Category deleted successfully');
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, 'error', 'Failed to delete category');
    }
});
exports.deleteCategory = deleteCategory;
