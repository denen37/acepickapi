import { Request, Response } from 'express';
import { Professional, User } from '../../models/Models';
import { handleResponse, successResponse } from '../../utils/modules';
import { UserStatus } from '../../utils/enum';
import { deactivatedUserEmail, reactivatedUserEmail, suspendedUserEmail } from '../../utils/messages';
import { sendEmail } from '../../services/gmail';

export const deactivateUser = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        const user = await User.findByPk(userId);

        if (!user) {
            return handleResponse(res, 404, false, 'User not found');
        }

        if (user.status !== UserStatus.ACTIVE) {
            return handleResponse(res, 400, false, 'Only active users can be deactivated');
        }

        user.status = UserStatus.INACTIVE;

        await user.save();

        //send email to user notifying them of deactivation
        const emailMsg = deactivatedUserEmail(user);

        const { messageId, success } = await sendEmail(
            user.email,
            emailMsg.title,
            emailMsg.body,
            'User'
        )

        return successResponse(res, 'success', { response: 'User deactivated successfully', emailSent: success, messageId });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export const suspendUser = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        const user = await User.findByPk(userId);

        if (!user) {
            return handleResponse(res, 404, false, 'User not found');
        }

        if (user.status !== UserStatus.ACTIVE) {
            return handleResponse(res, 400, false, 'Only active users can be suspended');
        }

        user.status = UserStatus.SUSPENDED;

        await user.save();

        //send email to user notifying them of suspension
        const emailMsg = suspendedUserEmail(user);

        const { messageId, success } = await sendEmail(
            user.email,
            emailMsg.title,
            emailMsg.body,
            'User'
        )

        return successResponse(res, 'success', { response: 'User suspended successfully', emailSent: success, messageId });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}


export const reactivateUser = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        const user = await User.findByPk(userId);

        if (!user) {
            return handleResponse(res, 404, false, 'User not found');
        }

        if (user.status === UserStatus.ACTIVE) {
            return handleResponse(res, 400, false, 'User is already active');
        }

        user.status = UserStatus.ACTIVE;

        await user.save();

        //send email to user notifying them of reactivation
        const emailMsg = reactivatedUserEmail(user);

        const { messageId, success } = await sendEmail(
            user.email,
            emailMsg.title,
            emailMsg.body,
            'User'
        )

        return successResponse(res, 'success', { response: 'User suspended successfully', emailSent: success, messageId });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
