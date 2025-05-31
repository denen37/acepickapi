import { Request, Response } from 'express';
import { Location } from '../models/Models';
import { updateLocationSchema } from '../validation/body';
import { errorResponse, successResponse } from '../utils/modules';

export const updateLocation = async (req: Request, res: Response) => {
    try {
        const result = updateLocationSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                error: "Invalid query parameters",
                issues: result.error.format(),
            });
        }

        const { userId, latitude, longitude, address, lga, state, zipcode } = result.data;

        const location = await Location.update({
            latitude,
            longitude,
            address,
            lga,
            state,
            zipcode
        }, {
            where: { userId }
        });

        return successResponse(res, 'Location updated successfully', location);
    } catch (error) {
        console.error('Error updating location:', error);
        return errorResponse(res, 'Error updating location', error);
    }
}