import { Request, Response } from "express";
import { User } from "../../models/User";
import { UserRole, UserStatus } from "../../utils/enum";
import { Profile } from "../../models/Profile";
import { errorResponse, handleResponse, successResponse } from "../../utils/modules";
import { reactivateUserEmail, suspendUserEmail } from "../../utils/messages";
import { sendEmail } from "../../services/gmail";
import { z } from "zod";

export const getAllUsers = async (req: Request, res: Response) => {
    const { id } = req.user;
    const { role } = req.params;
    const result = z.object({
        role: z.nativeEnum(UserRole),
    }).safeParse(req.params);

    if (!result.success) {
        return res.status(400).json({
            error: "Invalid role",
            details: result.error.flatten().fieldErrors,
        });
    }

    // const modifiedRole = role.slice(0, -1);

    try {
        const clients = await User.findAll({
            where: {
                role: role,
            },
            attributes: { exclude: ['password'] },
            include: [
                {
                    model: Profile,
                }
            ],
            order: [['createdAt', 'DESC']]
        })

        return successResponse(res, 'success', clients)
    } catch (error) {
        console.log(error)
        return errorResponse(res, 'error', 'Internal server error')
    }
}

export const toggleSuspension = async (req: Request, res: Response) => {
    const { id } = req.user;
    const { userId } = req.params;

    try {
        const user = await User.findByPk(userId, { include: [Profile] });

        if (!user) {
            return handleResponse(res, 404, false, 'User not found');
        }

        if (user.status === UserStatus.ACTIVE) {
            user.status = UserStatus.SUSPENDED;
            await user.save();

            //send email to user
            const email = suspendUserEmail(user);

            const response = await sendEmail(
                user.email,
                email.title,
                email.body,
                user.profile.firstName
            )

            return successResponse(res, 'success', 'User suspended successfully')
        } else {
            user.status = UserStatus.ACTIVE;
            await user.save();

            const email = reactivateUserEmail(user);

            const response = await sendEmail(
                user.email,
                email.title,
                email.body,
                user.profile.firstName
            )

            return successResponse(res, 'success', 'User reactivated successfully')
        }
    } catch (error) {
        console.log(error);
        return errorResponse(res, 'error', 'Internal server error');
    }
}

export const emailUser = async (req: Request, res: Response) => {
    const { userId, title, body } = req.body;

    try {
        const user = await User.findByPk(userId, { include: [Profile] });

        if (!user) {
            return handleResponse(res, 404, false, 'User not found')
        }

        const { success, error } = await sendEmail(
            user.email,
            title,
            body,
            user.profile.firstName
        )

        if (success) {
            return handleResponse(res, 200, true, 'Email sent successfully')
        }

        throw error
    } catch (error) {
        console.log(error);
        return errorResponse(res, 'error', 'An error ocurred');
    }
}