
// import { NextFunction, Request, Response } from 'express';
// import config from '../config/configSetup';
import { v2 as cloudinary } from 'cloudinary';
import config from "../config/configSetup";
import multer from "multer";
const fs = require('fs')
const path = require('path')



// cloudinary configuration
// cloudinary.config({
//   cloud_name: config.CLOUDINARY_NAME,
//   api_key: config.CLOUDINARY_API_KEY,
//   api_secret: config.CLOUDINARY_API_SECRET
// });


const pathExistsOrCreate = (dirPath: string): string => {
  let filepath: string = path.resolve(__dirname, dirPath)
  if (!fs.existsSync(filepath)) {
    fs.mkdirSync(filepath, { recursive: true });
    console.log(`Directory created: ${filepath}`);
  }

  return filepath;
};



const storeImage = (folder: string) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, pathExistsOrCreate('../../public/' + folder))
    },
    filename: (req, file, cb) => {
      let filename = Date.now() + '.' + file.mimetype.split('/')[1];
      cb(null, filename.replace(/\s+/g, ''))
    }
  });
}




export const uploads = multer({
  storage: storeImage('uploads'),
})


// const storage = multer.memoryStorage();

// export const uploads = multer({
//   storage: storage,
//   limits: { fileSize: 5 * 1024 * 1024 } // 5MB
// });



// export const upload_cloud = async (path: string) => {
//   const result = await cloudinary.uploader.upload(path, { resource_type: 'auto' })
//   // console.log(result.secure_url)

//   const url = cloudinary.url(result.public_id, {
//     transformation: [
//       {
//         fetch_format: 'auto',
//         quality: 'auto'
//       }, {
//         crop: 'auto',
//         gravity: 'auto',
//         width: 600,
//         height: 600,
//       }
//     ]
//   })

//   console.log(url);

//   return url
// }

