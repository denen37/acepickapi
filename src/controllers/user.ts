import { Request, Response } from 'express'
import { User } from '../models/User'
import { errorResponse, successResponse } from '../utils/modules'
import { Profile } from '../models/Profile'

export const getUser = async (req: Request, res: Response) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] },
            include: Profile
        })

        return successResponse(res, 'success', user);
    } catch (error) {
        return errorResponse(res, 'error', error);
    }
}