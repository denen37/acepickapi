import { Request, Response } from "express";
import { Experience, Profile } from "../models/Models";
import { errorResponse, handleResponse, successResponse } from "../utils/modules";
import { certificationSchema, experienceSchema, updateExperienceSchema } from "../validation/body";


export const getExperiences = async (req: Request, res: Response) => {
    const { id } = req.user;

    try {
        const profile = await Profile.findOne({ where: { userId: id } });

        if (!profile) {
            return handleResponse(res, 404, false, 'Profile not found');
        }

        const experiences = await Experience.findAll({
            where: { profileId: profile.id },
            order: [['createdAt', 'DESC']],
        });

        return successResponse(res, 'success', experiences);
    } catch (error) {
        return errorResponse(res, 'error', error);
    }
}


export const addExperience = async (req: Request, res: Response) => {
    const { id } = req.user;

    const result = experienceSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            status: false,
            message: 'Validation error',
            errors: result.error.flatten().fieldErrors,
        });
    }

    const { postHeld, workPlace, startDate, endDate, isCurrent, description } = result.data;

    try {
        const profile = await Profile.findOne({ where: { userId: id } });

        if (!profile) {
            return handleResponse(res, 404, false, 'Profile not found');
        }

        const experience = await Experience.create({
            postHeld,
            workPlace,
            startDate,
            endDate,
            isCurrent,
            description,
            profileId: profile.id
        });

        return successResponse(res, 'success', experience);
    } catch (error) {
        return errorResponse(res, 'error', error);
    }
}



export const updateExperience = async (req: Request, res: Response) => {
    const { id } = req.params;
    //const { userId } = req.user;

    if (!id) {
        return handleResponse(res, 400, false, 'Provide an id')
    }

    const result = updateExperienceSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            status: false,
            message: 'Validation error',
            errors: result.error.flatten().fieldErrors,
        });
    }


    try {
        const updated = await Experience.update(result.data, {
            where: { id }
        })

        return successResponse(res, 'success', updated);
    } catch (error) {
        return errorResponse(res, 'error', error);
    }
}


export const deleteExperience = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
        return handleResponse(res, 400, false, 'Provide an id')
    }

    try {
        await Experience.destroy({
            where: { id }
        })

        return successResponse(res, 'success', { message: 'Experience deleted successfully' });
    } catch (error) {
        return errorResponse(res, 'error', error);
    }
}