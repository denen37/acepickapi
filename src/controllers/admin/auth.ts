import { Request, Response } from 'express'
import { Profile, User } from '../../models/Models';
import { errorResponse, handleResponse, successResponse } from '../../utils/modules';
import { UserRole } from '../../utils/enum';
import { Op } from 'sequelize';

export const upgradeUserToAdmin = async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
        // const user = await User.findByPk(userId);

        // if (!adminRole)
        //     return handleResponse(res, 404, false, "Admin role not found")

        const user = await User.findByPk(userId);

        if (!user)
            return handleResponse(res, 404, false, "User not found")

        if (user.role === UserRole.ADMIN)
            return handleResponse(res, 400, false, "User is already an admin")

        user.role = UserRole.ADMIN;

        await user.save();

        return successResponse(res, 'success', 'User upgraded to admin');
    } catch (error) {
        console.log(error);
        return errorResponse(res, 'error', 'Error upgrading user to admin')
    }
}


export const removeAdmin = async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
        const user = await User.findByPk(userId);

        if (!user)
            return handleResponse(res, 404, false, "User not found")

        if (user.role !== UserRole.ADMIN)
            return handleResponse(res, 400, false, "User is not an admin")

        user.role = UserRole.CLIENT;

        await user.save();

        return successResponse(res, 'success', 'User removed from admin status')
    } catch (error) {
        console.log(error);
        return errorResponse(res, 'error', 'Error removing admin status')
    }
}


export const getAdmins = async (req: Request, res: Response) => {
    try {
        const admins = await User.findAll({
            where: { role: UserRole.ADMIN },
            include: [Profile]
        })

        return successResponse(res, 'success', admins)
    } catch (error) {
        console.log(error);
        return errorResponse(res, 'error', 'Error getting admins')
    }
}