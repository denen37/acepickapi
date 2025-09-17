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
exports.default = {
    up: (queryInterface) => __awaiter(void 0, void 0, void 0, function* () {
        // 👉 replace these arrays with your actual user and video IDs
        const professionalUserIds = [
            "5b509520-9507-466c-b085-b6eac6c98a9f",
            "5e0cd8e5-1342-4577-82b4-935ffc18af8c",
            "79b426ad-8846-4f4b-b3f7-679c44f82950",
            "7d214fc6-6369-43af-be0b-aa1a0f5ee967",
            "83df1fcd-7e93-4395-8b95-c4bac2b3e316",
            "cdc38cbf-33a9-42f7-90ad-070940fc624e",
            "d63d041b-3395-4391-af33-8d71499c5110"
        ];
        const clientUserIds = [
            "00a217b6-3f53-4993-b244-b4818ff37a12",
            "0a1a5aad-6cfc-4cc7-b7c7-2ef40c314e2c",
            "2c785cab-e960-486f-b684-6cfc5e777fc2",
            "33bb5c54-fd64-4cfa-b90b-b0951d3f0564",
            "8bebec07-090c-48f2-9c74-5abcb47c2de0"
        ];
        const jobIds = [1, 2, 3, 4, 5, 8, 9, 10, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45,];
        const ratings = [];
        for (let i = 0; i < 200; i++) {
            const randomProfId = professionalUserIds[Math.floor(Math.random() * professionalUserIds.length)];
            const randomClientId = clientUserIds[Math.floor(Math.random() * clientUserIds.length)];
            const randomJobId = jobIds[Math.floor(Math.random() * jobIds.length)];
            const rating = {
                value: Math.floor(Math.random() * 5) + 1,
                professionalUserId: randomProfId,
                clientUserId: randomClientId,
                jobId: randomJobId,
                orderId: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            ratings.push(rating);
        }
        yield queryInterface.bulkInsert('rating', ratings);
    }),
    down: (queryInterface) => __awaiter(void 0, void 0, void 0, function* () {
        yield queryInterface.bulkDelete('rating', {});
    }),
};
