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
exports.uploadFilesToBlob = exports.uploadFileToBlob = void 0;
const storage_blob_1 = require("@azure/storage-blob");
const configSetup_1 = __importDefault(require("../config/configSetup"));
var ContainerAccess;
(function (ContainerAccess) {
    ContainerAccess["PRIVATE"] = "private";
    ContainerAccess["BLOB"] = "blob";
    ContainerAccess["CONTAINER"] = "container";
})(ContainerAccess || (ContainerAccess = {}));
const uploadFileToBlob = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (containerName = 'general_pics', file) {
    try {
        // Create BlobServiceClient
        const blobServiceClient = storage_blob_1.BlobServiceClient.fromConnectionString(configSetup_1.default.AZURE_STORAGE_CONNECTION_STRING || 'key');
        const containerClient = blobServiceClient.getContainerClient(containerName);
        // Create container if it doesn't exist
        const createContainerResponse = yield containerClient.createIfNotExists({
            access: ContainerAccess.BLOB
        });
        if (createContainerResponse.succeeded) {
            console.log(`Container ${containerName} created successfully`);
        }
        const blockBlobClient = containerClient.getBlockBlobClient(file.name);
        // Upload buffer
        const uploadBlobResponse = yield blockBlobClient.uploadData(file.buffer, {
            blobHTTPHeaders: { blobContentType: file.mimetype },
        });
        console.log(`File "${file.name}" uploaded successfully! Request ID: ${uploadBlobResponse.requestId}`);
        // Get the blob URL
        const blobUrl = blockBlobClient.url;
        console.log('File URL:', blobUrl);
        return blobUrl;
    }
    catch (error) {
        console.error('Error uploading file to Azure Blob Storage:', error.message);
        throw new Error('Error uploading file to Azure Blob Storage: ' + error.message);
    }
});
exports.uploadFileToBlob = uploadFileToBlob;
const uploadFilesToBlob = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (containerName = 'general_pics', files) {
    try {
        const blobServiceClient = storage_blob_1.BlobServiceClient.fromConnectionString(configSetup_1.default.AZURE_STORAGE_CONNECTION_STRING || 'key');
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const createContainerResponse = yield containerClient.createIfNotExists({
            access: ContainerAccess.BLOB
        });
        if (createContainerResponse.succeeded) {
            console.log(`Container ${containerName} created successfully`);
        }
        const uploadedFiles = [];
        for (const file of files) {
            const blockBlobClient = containerClient.getBlockBlobClient(file.name);
            yield blockBlobClient.uploadData(file.buffer, {
                blobHTTPHeaders: { blobContentType: file.mimetype },
            });
            uploadedFiles.push(blockBlobClient.url);
        }
        return uploadedFiles;
    }
    catch (error) {
        console.error('Error uploading file to Azure Blob Storage:', error.message);
        throw new Error('Error uploading file to Azure Blob Storage: ' + error.message);
    }
});
exports.uploadFilesToBlob = uploadFilesToBlob;
