import { Request, Response } from 'express';
import { RequestHandler } from 'express';
import { sendPushNotification } from '../services/notification';
import { sendSMS } from '../services/sms';
import { errorResponse, successResponse } from '../utils/modules';
import { sendOTPEmail } from '../utils/messages';
import { sendEmail } from '../services/gmail';

export const sendSMSTest = async (req: Request, res: Response) => {
    const { phone } = req.body;

    // try {
    const status = await sendSMS(phone, '123456')

    return successResponse(res, 'OTP sent successfully', { smsSendStatus: status })
    // } catch (error) {
    //     return errorResponse(res, 'error', error);
    // }
}

export const sendEmailTest = async (req: Request, res: Response) => {
    const { email } = req.body;

    // try {
    const verifyEmailMsg = sendOTPEmail('123456');

    const messageId = await sendEmail(
        email,
        verifyEmailMsg.title,
        verifyEmailMsg.body,
        'User'
    )

    let emailSendStatus = Boolean(messageId);

    return successResponse(res, 'OTP sent successfully', { emailSendStatus })
    // } catch (error) {
    //     return errorResponse(res, 'error', error);
}


export const testNotification = async (req: Request, res: Response) => {
    try {
        const { token, title, message, data } = req.body;

        if (!title || !message || !token) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const response = await sendPushNotification(token, title, message, data)

        return successResponse(res, 'Notification sent successfully', { response });

    } catch (error) {
        console.log(error);
        return errorResponse(res, 'Error sending notification', error);
    }
}
