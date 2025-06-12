import { Request, Response } from "express";
import { Profile, User, Location } from '../models/Models'
import { errorResponse, handleResponse, successResponse } from "../utils/modules";
import { UserRole } from "../utils/enum";


export const getClient = async (req: Request, res: Response) => {
    let { id } = req.params;

    // try {
    const client = await User.findOne({
        where: { id: id, role: UserRole.CLIENT },
        attributes: {
            exclude: ['password', 'fcmToken']
        },
        include: [
            {
                model: Profile,
            }, {
                model: Location
            }
        ]
    });

    if (!client) {
        return handleResponse(res, 404, false, 'Client not found');
    }

    return successResponse(res, 'success', client);
    // } catch (error) {
    //     return errorResponse(res, 'error', error);
    // }
}

