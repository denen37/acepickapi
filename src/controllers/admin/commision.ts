import { Request, Response } from "express";
import { commissionSchema, updateCommissionSchema } from "../../validation/body";
import { Commission } from "../../models/Commison";
import { errorResponse, handleResponse, successResponse } from "../../utils/modules";

export const createCommission = async (req: Request, res: Response) => {
    try {
        const result = commissionSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({ message: result.error.issues[0].message });
        }

        const newCommission = await Commission.create(result.data);

        return successResponse(res, 'success', newCommission);
    } catch (error) {
        console.log(error);
        return errorResponse(res, 'error', 'An error occurred');
    }
}

export const getCommissions = async (req: Request, res: Response) => {
    try {
        const commission = await Commission.findAll();

        return successResponse(res, 'success', commission);
    } catch (error) {
        console.log(error);
        return errorResponse(res, 'error', 'An error occurred');
    }
}

export const getCommissionById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const commission = await Commission.findByPk(id);

        return successResponse(res, 'success', commission);
    } catch (error) {
        console.log(error);
        return errorResponse(res, 'error', 'An error occurred');
    }
}

export const updateCommission = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const result = updateCommissionSchema.safeParse(req.body);

        if (!result.success) {
            return errorResponse(res, 'error', result.error.issues[0].message);
        }

        const updated = await Commission.update(result.data, {
            where: {
                id
            }
        })

        if (updated[0] === 0) {
            return errorResponse(res, 'error', 'No commission found');
        }

        return successResponse(res, 'success', 'Commission updated successfully');
    } catch (error) {
        console.log(error);
        return errorResponse(res, 'error', 'An error occurred');
    }
}

export const deleteCommission = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const deleted = await Commission.destroy({
            where: {
                id
            }
        })

        if (deleted === 0) {
            return errorResponse(res, 'error', 'No commission found');
        }

        return successResponse(res, 'success', 'Commission deleted successfully');
    } catch (error) {
        console.log(error);
        return errorResponse(res, 'error', 'An error occurred');
    }
}

export const toggleCommission = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const commission = await Commission.findByPk(id);

        if (!commission) {
            return handleResponse(res, 404, false, 'No commission found')
        }

        commission.active = !commission.active;

        await commission.save();

        return successResponse(res, 'success', { active: commission.active });
    } catch (error) {
        console.log(error);
        return errorResponse(res, 'error', 'An error occurred')
    }
}