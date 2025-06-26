import { Request, Response } from "express";
import { Portfolio, Profile } from "../models/Models";
import { errorResponse, handleResponse, successResponse } from "../utils/modules";
import { portfolioSchema, updatePortfolioSchema } from "../validation/body";


export const getPortfolios = async (req: Request, res: Response) => {
    const { userId } = req.user;

    try {
        const profile = await Profile.findOne({ where: { userId } });

        if (!profile) {
            return handleResponse(res, 404, false, 'Profile not found');
        }

        const portfolios = await Portfolio.findAll({
            where: { profileId: profile.id },
            order: [['createdAt', 'DESC']],
        });

        return successResponse(res, 'success', portfolios);
    } catch (error) {
        return errorResponse(res, 'error', error);
    }
}


export const addPortfolio = async (req: Request, res: Response) => {
    const { userId } = req.user;

    const result = portfolioSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            status: false,
            message: 'Validation error',
            errors: result.error.flatten().fieldErrors,
        });
    }

    const { title, description, duration, date, file } = result.data;

    try {
        const profile = await Profile.findOne({ where: { userId } });

        if (!profile) {
            return handleResponse(res, 404, false, 'Profile not found');
        }

        const portfolio = await Portfolio.create({
            title,
            description,
            duration,
            date,
            file,
            profileId: profile.id
        });

        return successResponse(res, 'success', portfolio);
    } catch (error) {
        return errorResponse(res, 'error', error);
    }
}



export const updatePortfolio = async (req: Request, res: Response) => {
    const { id } = req.params;

    const { userId } = req.user;

    const result = updatePortfolioSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            status: false,
            message: 'Validation error',
            errors: result.error.flatten().fieldErrors,
        });
    }


    try {
        const updated = await Portfolio.update(result.data, {
            where: { id }
        })

        return successResponse(res, 'success', updated);
    } catch (error) {
        return errorResponse(res, 'error', error);
    }
}


export const deletePortfolio = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        await Portfolio.destroy({
            where: { id }
        })

        return successResponse(res, 'success', { message: 'Portfolio deleted successfully' });
    } catch (error) {
        return errorResponse(res, 'error', error);
    }
}