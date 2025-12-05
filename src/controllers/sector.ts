import { Request, Response } from "express";
import { Professional, Profession, Sector, User, Profile, Job } from '../models/Models'
import { successResponse, errorResponse, handleResponse } from "../utils/modules";

export const getSectors = async (req: Request, res: Response) => {
  try {

    const sectors = await Sector.findAll({
      order: [['title', 'ASC']],
    });

    return successResponse(res, 'success', sectors)
  } catch (error) {
    return errorResponse(res, 'error', error)
  }
}


export const getSectorsMetrics = async (req: Request, res: Response) => {
  let { id } = req.params

  try {
    let sectors = await Sector.findAll()

    for (const sector of sectors) {
      const numOfProf = await Professional.count({
        include: [
          {
            model: Profession,
            as: "profession",
            where: {
              sectorId: sector.id,
            },
          },
        ],
      });


      const numOfJobs = await Job.count({
        include: [
          {
            model: User,
            as: "professional",
            required: true,
            include: [
              {
                model: Profile,
                as: "profile",
                required: true,
                include: [
                  {
                    model: Professional,
                    as: "professional",
                    required: true,
                    include: [
                      {
                        model: Profession,
                        as: "profession",
                        required: true,
                        where: {
                          sectorId: sector.id,
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      });


      sector.setDataValue('numOfProf', numOfProf);

      sector.setDataValue('numOfJobs', numOfJobs);
    }

    return successResponse(res, "success", sectors)
  } catch (error) {
    return errorResponse(res, "error", error)
  }
}


export const createSector = async (req: Request, res: Response) => {
  const { title, image } = req.body

  if (!title || !image) {
    return handleResponse(res, 400, false, 'Please provide all fields')
  }

  try {
    const sector = await Sector.create({ title, image })

    return successResponse(res, 'success', sector)
  } catch (error) {
    return errorResponse(res, 'error', error);
  }
}


export const updateSector = async (req: Request, res: Response) => {
  let { id } = req.params

  if (!req.body) {
    return handleResponse(res, 400, false, "Please provide at least one field to update");
  }

  try {
    let sector = await Sector.update(req.body, { where: { id: id } })

    return successResponse(res, "success", sector)
  } catch (error) {
    return errorResponse(res, "error", error)
  }

}

export const deleteSector = async (req: Request, res: Response) => {
  let { id } = req.params

  try {
    let sector = await Sector.destroy({ where: { id: id } })

    return successResponse(res, "success", sector)
  } catch (error) {
    return errorResponse(res, "error", error)
  }
}