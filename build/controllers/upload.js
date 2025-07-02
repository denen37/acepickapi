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
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadAvatar = exports.uploadFile = exports.uploadFiles = void 0;
const modules_1 = require("../utils/modules");
const uploadCloud_1 = require("../services/uploadCloud");
// const BASE_FOLDER = 'uploads'
var StorageContainer;
(function (StorageContainer) {
    StorageContainer["PROFILE"] = "profile";
    StorageContainer["GENERAL"] = "general";
})(StorageContainer || (StorageContainer = {}));
const uploadFiles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.files) {
        return (0, modules_1.handleResponse)(res, 404, false, 'No files uploaded');
    }
    const files = req.files;
    // const filesModified = files.map((file) => {
    //     return {
    //         buffer: file.buffer,
    //         name: Date.now().toString(),
    //         mimetype: file.mimetype,
    //     }
    // })
    try {
        const paths = files.map((file) => `/${file.path.slice(file.path.indexOf('uploads')).split('\\').join('/')}`);
        return (0, modules_1.successResponse)(res, 'success', { urls: paths });
    }
    catch (error) {
        return (0, modules_1.handleResponse)(res, 500, false, 'Error uploading files');
    }
});
exports.uploadFiles = uploadFiles;
const uploadFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file) {
        return (0, modules_1.handleResponse)(res, 404, false, 'No file uploaded');
    }
    const file = req.file;
    const fileModified = {
        buffer: file.buffer,
        name: Date.now().toString(),
        mimetype: file.mimetype,
    };
    console.log('filename', fileModified.name);
    try {
        const path = yield (0, uploadCloud_1.uploadFileToBlob)(StorageContainer.GENERAL, fileModified);
        return (0, modules_1.successResponse)(res, 'success', { url: path });
    }
    catch (error) {
        return (0, modules_1.handleResponse)(res, 500, false, 'Error uploading file');
    }
});
exports.uploadFile = uploadFile;
const uploadAvatar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file) {
        return (0, modules_1.handleResponse)(res, 404, false, 'No file uploaded');
    }
    const file = req.file;
    try {
        // const path = await uploadFileToBlob(StorageContainer.PROFILE, fileModified)
        return (0, modules_1.successResponse)(res, 'success', {
            url: `/${file.path.slice(file.path.indexOf('uploads')).split('\\').join('/')}`
        });
    }
    catch (error) {
        return (0, modules_1.handleResponse)(res, 500, false, 'Error uploading file');
    }
});
exports.uploadAvatar = uploadAvatar;
