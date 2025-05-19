import { Request, Response } from "express";
import {Professional, Profession, Sector, User, Profile, Job} from '../models/Models'
import { successResponse } from "../utils/modules";

export const getSectors = async (req: Request, res: Response) => {
    const sectors = await Sector.findAll();

    for (const sector of sectors) {
  const numOfProf = await Professional.count({
    include: [
      {
        model: Profession,
        as: "profession",
        where: {
          sectorId: sector.id,
        },
        // include: [
        //   {
        //     model: Sector,
        //     as: "sector",
        //   },
        // ],
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


return successResponse(res, 'success', sectors)
}