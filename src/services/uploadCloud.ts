import { BlobServiceClient } from '@azure/storage-blob';
import config from '../config/configSetup'
import * as fs from 'fs';
import * as path from 'path';

enum ContainerAccess {
    PRIVATE = 'private',
    BLOB = 'blob',
    CONTAINER = 'container'
}

export const uploadFileToBlob = async (containerName: string = 'general_pics', file: { buffer: Buffer, name: string, mimetype: string }) => {
    try {
        // Create BlobServiceClient
        const blobServiceClient = BlobServiceClient.fromConnectionString(config.AZURE_STORAGE_CONNECTION_STRING || 'key');

        const containerClient = blobServiceClient.getContainerClient(containerName);

        // Create container if it doesn't exist
        const createContainerResponse = await containerClient.createIfNotExists({
            access: ContainerAccess.BLOB
        });

        if (createContainerResponse.succeeded) {
            console.log(`Container ${containerName} created successfully`);
        }

        const blockBlobClient = containerClient.getBlockBlobClient(file.name);

        // Upload buffer
        const uploadBlobResponse = await blockBlobClient.uploadData(file.buffer, {
            blobHTTPHeaders: { blobContentType: file.mimetype },
        });

        console.log(`File "${file.name}" uploaded successfully! Request ID: ${uploadBlobResponse.requestId}`);

        // Get the blob URL
        const blobUrl = blockBlobClient.url;

        console.log('File URL:', blobUrl);

        return blobUrl

    } catch (error: any) {
        console.error('Error uploading file to Azure Blob Storage:', error.message);
        throw new Error('Error uploading file to Azure Blob Storage: ' + error.message);
    }
}



export const uploadFilesToBlob = async (containerName: string = 'general_pics', files: { buffer: Buffer, name: string, mimetype: string }[]) => {
    try {
        const blobServiceClient = BlobServiceClient.fromConnectionString(config.AZURE_STORAGE_CONNECTION_STRING || 'key');

        const containerClient = blobServiceClient.getContainerClient(containerName);

        const createContainerResponse = await containerClient.createIfNotExists({
            access: ContainerAccess.BLOB
        });

        if (createContainerResponse.succeeded) {
            console.log(`Container ${containerName} created successfully`);
        }


        const uploadedFiles = [];

        for (const file of files) {
            const blockBlobClient = containerClient.getBlockBlobClient(file.name);

            await blockBlobClient.uploadData(file.buffer, {
                blobHTTPHeaders: { blobContentType: file.mimetype },
            });

            uploadedFiles.push(blockBlobClient.url);
        }

        return uploadedFiles

    } catch (error: any) {
        console.error('Error uploading file to Azure Blob Storage:', error.message);
        throw new Error('Error uploading file to Azure Blob Storage: ' + error.message);
    }
}

