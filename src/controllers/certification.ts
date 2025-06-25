import { Request, Response } from "express";
import { Certification, Profile } from "../models/Models";
import { errorResponse, handleResponse, successResponse } from "../utils/modules";
import { certificationSchema } from "../validation/body";


export const getCertificates = async (req: Request, res: Response) => {
    const { userId } = req.user;

    try {
        const profile = await Profile.findOne({ where: { userId } });

        if (!profile) {
            return handleResponse(res, 404, false, 'Profile not found');
        }

        const certificates = await Certification.findAll({
            where: { profileId: profile.id },
            order: [['createdAt', 'DESC']],
        });

        return successResponse(res, 'success', certificates);
    } catch (error) {
        return errorResponse(res, 'error', error);
    }
}


export const addCertificate = async (req: Request, res: Response) => {
    const { userId } = req.user;

    const result = certificationSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            status: false,
            message: 'Validation error',
            errors: result.error.flatten().fieldErrors,
        });
    }

    const { title, filePath, companyIssue, date } = result.data;

    try {
        const profile = await Profile.findOne({ where: { userId } });

        if (!profile) {
            return handleResponse(res, 404, false, 'Profile not found');
        }

        const certificate = await Certification.create({
            title,
            filePath,
            companyIssue,
            date,
            profileId: profile.id
        });

        return successResponse(res, 'success', certificate);
    } catch (error) {
        return errorResponse(res, 'error', error);
    }
}

export const updateCertificate = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { userId } = req.user;

    const result = certificationSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            status: false,
            message: 'Validation error',
            errors: result.error.flatten().fieldErrors,
        });
    }

    const { title, filePath, companyIssue, date } = result.data;

    try {
        const certificate = await Certification.findByPk(id);

        if (!certificate) {
            return handleResponse(res, 404, false, 'Certificate not found');
        }

        certificate.title = title;
        certificate.filePath = filePath;
        certificate.companyIssue = companyIssue;
        certificate.date = date;

        await certificate.save();

        return successResponse(res, 'success', certificate);
    } catch (error) {
        return errorResponse(res, 'error', error);
    }
}


export const deleteCertificate = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        await Certification.destroy({
            where: { id }
        })

        return successResponse(res, 'success', { message: 'Certificate deleted successfully' });
    } catch (error) {
        return errorResponse(res, 'error', error);
    }
}