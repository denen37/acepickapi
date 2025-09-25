import {Request, Response} from 'express'
import { Op } from "sequelize";
import { User} from '../../models/Models'
import { errorResponse, successResponse, handleResponse } from "../../utils/modules";

export const newUsersTodayCount = async (req: Request, res: Response) => {
    try {
        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date();
        endDate.setHours(23, 59, 59, 999);

        const userCount = await User.count({
            where: {
                createdAt: {
                    [Op.gte]: startDate,
                    [Op.lte]: endDate,
                },
            },
        });

        return successResponse(res, 'success', userCount);
    } catch (error) {
        console.log(error);
        return errorResponse(res, 'error', 'Internal server error');
    }
};