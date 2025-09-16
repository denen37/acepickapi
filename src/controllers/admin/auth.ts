import { Request, Response } from 'express'
import { Profile, Role, User, UserRole } from '../../models/Models';
import { errorResponse, handleResponse, successResponse } from '../../utils/modules';
import { Op } from 'sequelize';

export const upgradeUserToAdmin = async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
        const adminRole = await Role.findOne({ where: { name: "admin" } });

        if (!adminRole)
            return handleResponse(res, 404, false, "Admin role not found")

        const user = await User.findByPk(userId);

        if (!user)
            return handleResponse(res, 404, false, "User not found")

        const [newUserRole, created] = await UserRole.findOrCreate({
            where: {
                userId: user.id,
                roleId: adminRole.id
            }
        })

        if (!created) {
            return handleResponse(res, 400, false, "User is already an admin")
        }

        return successResponse(res, 'success', 'User upgraded to admin');
    } catch (error) {
        console.log(error);
        return errorResponse(res, 'error', 'Error upgrading user to admin')
    }
}


export const removeAdmin = async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
        const adminRole = await Role.findOne({ where: { name: "admin" } });

        if (!adminRole)
            return handleResponse(res, 404, false, "Admin role not found")

        const user = await User.findByPk(userId);

        if (!user)
            return handleResponse(res, 404, false, "User not found")

        const deleted = await UserRole.destroy({
            where: {
                userId: user.id,
                roleId: adminRole.id
            }
        })

        if (deleted === 0) {
            return handleResponse(res, 404, false, "User is not an admin")
        }

        return successResponse(res, 'success', 'User removed from admin status')
    } catch (error) {
        console.log(error);
        return errorResponse(res, 'error', 'Error removing admin status')
    }
}


export const getAdmins = async (req: Request, res: Response) => {
    try {
        const adminRole = await Role.findAll({
            where: {
                [Op.or]: [
                    { name: "admin" },
                    { name: "superadmin" }
                ]
            }
        });

        const admins = await UserRole.findAll({
            where: {
                role: adminRole.map(role => role.id)
            },
            include: [{
                model: User,
                attributes: { exclude: ['password', 'fcmToken', 'createdAt', 'updatedAt'] },
                include: [Profile]
            }]
        })

        return successResponse(res, 'success', admins)
    } catch (error) {
        console.log(error);
        return errorResponse(res, 'error', 'Error getting admins')
    }
}