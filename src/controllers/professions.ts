import { Profession } from "../models/Profession"
import { Request, Response } from "express"
import { successResponse, errorResponse, handleResponse } from "../utils/modules"
import { Sector } from "../models/Sector"


export const getProfessions = async (req: Request, res: Response) => {
    const { sector_id, order_by } = req.query as {
        sector_id?: string;
        order_by?: string;
    };

    // Parse sector_id safely
    const sectorId = sector_id ? parseInt(sector_id, 10) : undefined;

    // Prepare where condition
    const whereCondition = sectorId ? { sectorId } : {};

    // Prepare order parameters safely
    let orderParams: [string, "ASC" | "DESC"] | undefined = undefined;

    if (order_by) {
        const parts = order_by.split("-");
        if (parts.length === 2) {
            const column = parts[0];
            const direction = parts[1].toUpperCase() === "DESC" ? "DESC" : "ASC";
            orderParams = [column, direction];
        }
    }

    try {
        const professions = await Profession.findAll({
            where: whereCondition,
            order: orderParams ? [orderParams] : undefined, // Sequelize expects an array of arrays
        });

        return successResponse(res, "success", professions);
    } catch (error) {
        return errorResponse(res, "error", error);
    }
};



export const getProfessionById = async (req: Request, res: Response) => {
    let { id } = req.params

    try {
        let professions = await Profession.findOne({
            where: { id },
            include: [
                {
                    model: Sector,
                }
            ]
        })

        return successResponse(res, "success", professions)
    } catch (error) {
        return errorResponse(res, "error", error)
    }
}

export const createProfession = async (req: Request, res: Response) => {
    let { title, image, sectorId } = req.body;

    if (!title || !sectorId) {
        return handleResponse(res, 400, false, "Please provide all required fields")
    }

    try {
        const sector = await Sector.findOne({ where: { id: sectorId } })

        if (!sector) {
            return handleResponse(res, 400, false, "Invalid sector id")
        }

        let profession = await Profession.create({ title, image, sectorId })

        return successResponse(res, "success", profession)
    } catch (error) {
        return errorResponse(res, "error", error)
    }
}

export const updateProfession = async (req: Request, res: Response) => {
    let { id } = req.params;

    if(!req.body){
        return handleResponse(res, 400, false, "Please provide at least on changed field")
    }

    try {
        let prof = await Profession.update(req.body, { where: { id: id } });

        return successResponse(res, "success", prof)
    } catch (error) {
        return errorResponse(res, "error", error)
    }
}

export const deleteProfession = async (req: Request, res: Response) => {
    let { id } = req.params;

    try {
        let prof = await Profession.destroy({ where: { id: id } });

        return successResponse(res, "success", 'Profession deleted')
    } catch (error) {
        return errorResponse(res, "error", error)
    }
}
