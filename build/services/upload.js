"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload_cloud = exports.uploads = void 0;
// import { NextFunction, Request, Response } from 'express';
// import config from '../config/configSetup';
const cloudinary_1 = require("cloudinary");
const configSetup_1 = __importDefault(require("../config/configSetup"));
const multer_1 = __importDefault(require("multer"));
const fs = require('fs');
const path = require('path');
// cloudinary configuration
cloudinary_1.v2.config({
    cloud_name: configSetup_1.default.CLOUDINARY_NAME,
    api_key: configSetup_1.default.CLOUDINARY_API_KEY,
    api_secret: configSetup_1.default.CLOUDINARY_API_SECRET
});
const pathExistsOrCreate = (dirPath) => {
    let filepath = path.resolve(__dirname, dirPath);
    if (!fs.existsSync(filepath)) {
        fs.mkdirSync(filepath, { recursive: true });
        console.log(`Directory created: ${filepath}`);
    }
    return filepath;
};
const imageStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, pathExistsOrCreate('../../public/uploads'));
    },
    filename: (req, file, cb) => {
        let filename = Date.now() + "--" + file.originalname;
        cb(null, filename.replace(/\s+/g, ''));
    }
});
exports.uploads = (0, multer_1.default)({
    storage: imageStorage,
});
const upload_cloud = (path) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield cloudinary_1.v2.uploader.upload(path, { resource_type: 'auto' });
    // console.log(result.secure_url)
    const url = cloudinary_1.v2.url(result.public_id, {
        transformation: [
            {
                fetch_format: 'auto',
                quality: 'auto'
            }, {
                crop: 'auto',
                gravity: 'auto',
                width: 600,
                height: 600,
            }
        ]
    });
    console.log(url);
    return url;
});
exports.upload_cloud = upload_cloud;
