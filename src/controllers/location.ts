import { Request, Response } from 'express';
import { Location } from '../models/Models';
import { storeLocationSchema, updateLocationSchema } from '../validation/body';
import { errorResponse, successResponse } from '../utils/modules';

export const updateLocation = async (req: Request, res: Response) => {
    try {
        const { locationId } = req.params;

        if (!locationId || Number.isNaN(Number(locationId))) {
            return res.status(400).json({
                error: "Invalid or missing locationId parameter",
            });
        }

        const result = updateLocationSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                error: "Invalid query parameters",
                issues: result.error.format(),
            });
        }

        const { latitude, longitude, address, lga, state, zipcode } = result.data;

        const location = await Location.update({
            latitude,
            longitude,
            address,
            lga,
            state,
            zipcode
        }, {
            where: { id: locationId },
        });

        return successResponse(res, 'Location updated successfully', location);
    } catch (error) {
        console.error('Error updating location:', error);
        return errorResponse(res, 'Error updating location', error);
    }
}

export const getMyLocations = async (req: Request, res: Response) => {
    const { id } = req.user;

    try {
        const location = await Location.findAll({
            where: { userId: id },
            order: [['createdAt', 'DESC']]
        })

        return successResponse(res, 'success', location);
    } catch (error) {
        console.log(error)
        return errorResponse(res, 'Error getting location', error);
    }
}

export const getLocationById = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const location = await Location.findByPk(id)

        return successResponse(res, 'success', location);
    } catch (error) {
        console.log(error)
        return errorResponse(res, 'Error getting location', error);
    }
}

export const addLocation = async (req: Request, res: Response) => {
    const { id } = req.user;

    try {

        const result = storeLocationSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                error: "Invalid query parameters",
                issues: result.error.format(),
            });
        }

        const { latitude, longitude, address, lga, state, zipcode } = result.data;

        const location = await Location.create({
            latitude,
            longitude,
            address,
            lga,
            state,
            zipcode,
            userId: id
        })

        return successResponse(res, 'Location added successfully', location);
    } catch (error) {
        console.log(error)
        return errorResponse(res, 'Error adding location', error);
    }
}

export const deleteLocation = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const deleted = await Location.destroy({
            where: { id }
        })

        return successResponse(res, 'Location deleted successfully', deleted);
    } catch (error) {
        console.log(error)
        return errorResponse(res, 'Error deleting location', error);
    }
}