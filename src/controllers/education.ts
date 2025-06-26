import { Request, Response } from "express";
import { Education, Profile } from '../models/Models'
import { errorResponse, handleResponse, successResponse } from "../utils/modules";
import { educationSchema, updateEducationSchema } from "../validation/body";

export const getEducation = async (req: Request, res: Response) => {
    const { id } = req.user;

    console.log(req.user);

    try {
        const profile = await Profile.findOne({
            where: { userId: id }
        })

        if (!profile) {
            return handleResponse(res, 404, false, 'Profile not found')
        }

        const education = await Education.findAll({
            where: {
                profileId: profile.id
            }
        });

        if (!education) {
            return handleResponse(res, 404, false, 'Education not found')
        }

        return successResponse(res, 'success', education);
    } catch (error) {
        return errorResponse(res, 'error', error)
    }
}

export const addEducation = async (req: Request, res: Response) => {
    const { id } = req.user;

    const result = educationSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            status: false,
            message: 'Validation error',
            errors: result.error.flatten().fieldErrors,
        });
    }


    const { school, degreeType, course, startDate, gradDate, isCurrent } = req.body;

    try {
        const profile = await Profile.findOne({
            where: { userId: id }
        })

        if (!profile) {
            return handleResponse(res, 404, false, 'Profile not found')
        }

        const education = await Education.create({
            school,
            degreeType,
            course,
            startDate,
            gradDate,
            isCurrent,
            profileId: profile.id
        });

        return successResponse(res, 'success', education);
    } catch (error) {
        return errorResponse(res, 'error', error)
    }
}

export const updateEducation = async (req: Request, res: Response) => {
    const { id } = req.params;
    //const { userId } = req.user;

    if (!id) {
        return handleResponse(res, 400, false, 'Provide an id')
    }

    try {
        const result = updateEducationSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                status: false,
                message: 'Validation error',
                errors: result.error.flatten().fieldErrors,
            });
        }


        const updated = await Education.update(result.data, {
            where: {
                id: id,
            }
        })

        return successResponse(res, 'success', updated);
    } catch (error: any) {
        return errorResponse(res, 'error', error.message || error);
    }
}

export const deleteEducation = async (req: Request, res: Response) => {
    //const { userId } = req.user;
    const { id } = req.params;

    if (!id) {
        return handleResponse(res, 400, false, 'Provide an id')
    }

    try {

        const deleted = await Education.destroy({
            where: {
                id,
            }
        })

        return successResponse(res, 'success', deleted);
    } catch (error: any) {
        return errorResponse(res, 'error', error.message || error);
    }
}