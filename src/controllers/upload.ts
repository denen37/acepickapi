import { Request, Response } from "express"
import { handleResponse, successResponse } from "../utils/modules"
import { uploadFileToBlob, uploadFilesToBlob } from "../services/uploadCloud";
import { buffer } from "stream/consumers";

// const BASE_FOLDER = 'uploads'

enum StorageContainer {
    PROFILE = 'profile',
    GENERAL = 'general'
}

export const uploadFiles = async (req: Request, res: Response) => {
    if (!req.files) {
        return handleResponse(res, 404, false, 'No files uploaded');
    }

    const files = req.files as Express.Multer.File[];

    const filesModified = files.map((file) => {
        return {
            buffer: file.buffer,
            name: Date.now().toString(),
            mimetype: file.mimetype,
        }
    })

    try {
        const paths = await uploadFilesToBlob(StorageContainer.GENERAL, filesModified)

        return successResponse(res, 'success', { urls: paths });
    } catch (error) {
        return handleResponse(res, 500, false, 'Error uploading files');
    }
}

export const uploadFile = async (req: Request, res: Response) => {
    if (!req.file) {
        return handleResponse(res, 404, false, 'No file uploaded');
    }

    const file = req.file as Express.Multer.File;

    const fileModified = {
        buffer: file.buffer,
        name: Date.now().toString(),
        mimetype: file.mimetype,
    }

    console.log('filename', fileModified.name);

    try {
        const path = await uploadFileToBlob(StorageContainer.GENERAL, fileModified)

        return successResponse(res, 'success', { url: path })
    } catch (error) {
        return handleResponse(res, 500, false, 'Error uploading file');
    }
}



export const uploadAvatar = async (req: Request, res: Response) => {
    if (!req.file) {
        return handleResponse(res, 404, false, 'No file uploaded');
    }

    const file = req.file as Express.Multer.File;

    // const fileModified = {
    //     buffer: file.buffer,
    //     name: Date.now().toString(),
    //     mimetype: file.mimetype,
    // }

    try {
        // const path = await uploadFileToBlob(StorageContainer.PROFILE, fileModified)

        return successResponse(res, 'success', { url: '/uploads/' + file.filename })
    } catch (error) {
        return handleResponse(res, 500, false, 'Error uploading file');
    }
}