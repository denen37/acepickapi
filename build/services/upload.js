"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploads = void 0;
const multer_1 = __importDefault(require("multer"));
const fs = require('fs');
const path = require('path');
// cloudinary configuration
// cloudinary.config({
//   cloud_name: config.CLOUDINARY_NAME,
//   api_key: config.CLOUDINARY_API_KEY,
//   api_secret: config.CLOUDINARY_API_SECRET
// });
// const pathExistsOrCreate = (dirPath: string): string => {
//   let filepath: string = path.resolve(__dirname, dirPath)
//   if (!fs.existsSync(filepath)) {
//     fs.mkdirSync(filepath, { recursive: true });
//     console.log(`Directory created: ${filepath}`);
//   }
//   return filepath;
// };
// const imageStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, pathExistsOrCreate('../../public/uploads'))
//   },
//   filename: (req, file, cb) => {
//     let filename = Date.now() + "--" + file.originalname;
//     cb(null, filename.replace(/\s+/g, ''))
//   }
// });
// export const uploads = multer({
//   storage: imageStorage,
// })
const storage = multer_1.default.memoryStorage();
exports.uploads = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});
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
