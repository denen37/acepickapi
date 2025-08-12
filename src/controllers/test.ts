import { Request, Response } from 'express';
import { RequestHandler } from 'express';
import { sendPushNotification } from '../services/notification';
import { sendSMS } from '../services/sms';
import { errorResponse, successResponse } from '../utils/modules';
import { sendOTPEmail } from '../utils/messages';
import { sendEmail } from '../services/gmail';
import { Location } from '../models/Location';
import sequelize, { Op } from 'sequelize';

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

    return successResponse(res, 'OTP sent successfully', { emailSendStatus, messsageId: messageId })
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



export async function findPersonsNearby(req: Request, res: Response) {
    const { lat, lng, radiusInKm } = req.body;

    const distanceQuery = `
    6371 * acos(
      cos(radians(:lat)) * cos(radians("latitude")) *
      cos(radians("longitude") - radians(:lng)) +
      sin(radians(:lat)) * sin(radians("latitude"))
    )
  `;

    const location = await Location.findAll({
        attributes: {
            include: [
                [sequelize.literal(distanceQuery), 'distance']
            ]
        },
        where: sequelize.where(
            sequelize.literal(distanceQuery),
            { [Op.lte]: radiusInKm }
        ),
        replacements: { lat, lng },
        order: sequelize.literal('distance ASC'),
    });

    return successResponse(res, 'Persons found nearby', { location });
}