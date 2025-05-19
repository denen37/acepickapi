import { Request, Response } from "express";
import { Education, Profile} from '../models/Models'
import { errorResponse, handleResponse, successResponse } from "../utils/modules";

export const getEducation = async (req: Request, res: Response) => {
    const {userId} = req.user;

   try {
     const profile = await Profile.findOne({where: userId})

    if(!profile) {
        return handleResponse(res, 404, false , 'Prrofile not found'  )
    }

    const education = await Education.findAll({where: profile.id});

    if(!education) {
        return handleResponse(res, 404, false , 'Education not found'  )
    }

    return successResponse(res, 'success', education);
   } catch (error) {
    return errorResponse(res, 'error', error)
   }
}

export const addEducation = async (req: Request, res: Response) => {
    const {userId} = req.user;
    const {school, degreeType, course, gradDate} = req.body;

    try {
        const profile = await Profile.findOne({where: userId})
    
        if(!profile) {
            return handleResponse(res, 404, false , 'Prrofile not found'  )
        }
    
        const education = await Education.create({
            school, 
            degreeType, 
            course, 
            gradDate, 
            profileId: profile.id
        });
    
        return successResponse(res, 'success', education);
    } catch (error) {
        return errorResponse(res, 'error', error)
    }
}

export const updateEducation = async (req: Request, res: Response) => {
    const {userId} = req.user;

     const profile = await Profile.findOne({where: userId})
    
        if(!profile) {
            return handleResponse(res, 404, false , 'Prrofile not found'  )
        }
}