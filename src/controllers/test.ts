import { Request, Response } from 'express';
import { RequestHandler } from 'express';
import { sendPushNotification } from '../services/notification';
import { sendSMS } from '../services/sms';
import { errorResponse, successResponse, handleResponse } from '../utils/modules';
import { sendOTPEmail } from '../utils/messages';
import { sendEmail } from '../services/gmail';
import { Location } from '../models/Location';
import sequelize, { Op } from 'sequelize';
import redis from '../config/redis';
import dbsequelize from '../config/db';
import { Professional } from '../models/Professional';
import { Profile } from '../models/Profile';

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

export const testRedis = async (req: Request, res: Response) => {
    try {
        await redis.set("testKey", "Redis is working!");

        const value = await redis.get("testKey");

        return successResponse(res, 'success', { status: "ok", message: value })
    } catch (error) {
        return errorResponse(res, 'error', error);
    }
}

export const testGetProfessional = async (req: Request, res: Response) => {
    try {
        const { professionalId } = req.params;

        const professional = await Professional.findOne({
            where: { id: professionalId },
            include: [
                {
                    model: Profile,
                    as: 'profile',
                    attributes: []
                }
            ],
            attributes: {
                include: [
                    [
                        dbsequelize.literal(`(
                            SELECT AVG(value)
                            FROM rating
                            WHERE rating.professionalUserId = profile.userId
                            )`),
                        'avgRating'
                    ],
                    [
                        dbsequelize.literal(`(
                            SELECT COUNT(*)
                            FROM rating
                            WHERE rating.professionalUserId = profile.userId
                            )`),
                        'numRating'
                    ]
                ]
            }
        })

        if (!professional) {
            return handleResponse(res, 404, false, "Professional not found");
        }

        return successResponse(res, 'success', professional);
    } catch (error: any) {
        return errorResponse(res, 'error', error)
    }
}