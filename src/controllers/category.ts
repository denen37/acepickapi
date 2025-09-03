import { Request, Response } from "express";
import { Category } from '../models/Models'
import { successResponse, errorResponse } from "../utils/modules";

export const getCategories = async (req: Request, res: Response) => {
    try {
        const categories = await Category.findAll({
            order: [['name', 'ASC']]
        })

        return successResponse(res, 'success', categories);
    } catch (error) {
        return errorResponse(res, 'error', 'Failed to retrieve categories');
    }
}


export const addCategory = async (req: Request, res: Response) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return errorResponse(res, 'error', 'Category name is required');
        }

        const newCategory = await Category.create({ name, description });

        return successResponse(res, 'Category added successfully', newCategory);
    } catch (error) {
        return errorResponse(res, 'error', 'Failed to add category');
    }
}

export const updateCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const category = await Category.findByPk(id);

        if (!category) {
            return errorResponse(res, 'error', 'Category not found');
        }

        category.name = name || category.name;
        category.description = description || category.description;

        await category.save();

        return successResponse(res, 'Category updated successfully', category);
    } catch (error) {
        return errorResponse(res, 'error', 'Failed to update category');
    }
}

export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const category = await Category.findByPk(id);

        if (!category) {
            return errorResponse(res, 'error', 'Category not found');
        }

        await category.destroy();

        return successResponse(res, 'Category deleted successfully');
    } catch (error) {
        return errorResponse(res, 'error', 'Failed to delete category');
    }
}