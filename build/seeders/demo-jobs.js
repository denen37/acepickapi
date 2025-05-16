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
const Job_1 = require("../models/Job");
const userIds = [
    "0a1a5aad-6cfc-4cc7-b7c7-2ef40c314e2c",
    "2c785cab-e960-486f-b684-6cfc5e777fc2",
    "33bb5c54-fd64-4cfa-b90b-b0951d3f0564",
    "5b509520-9507-466c-b085-b6eac6c98a9f",
    "5e0cd8e5-1342-4577-82b4-935ffc18af8c",
    "79b426ad-8846-4f4b-b3f7-679c44f82950",
    "7d214fc6-6369-43af-be0b-aa1a0f5ee967",
    "a0a13da5-ee75-4954-a13e-32dbc7167dd3",
    "e69bb0bb-0bfd-417c-a64a-d501ce59c618",
    "f42f3fb5-646c-4743-afbd-de92e97ecf98"
];
module.exports = {
    up: (queryInterface) => __awaiter(void 0, void 0, void 0, function* () {
        return queryInterface.bulkInsert('jobs', Array.from({ length: 10 }).map((_, index) => ({
            title: `Job ${index + 1}`,
            description: `Description for job ${index + 1}`,
            mode: index % 2 === 0 ? Job_1.modeType.VIRTUAL : Job_1.modeType.PHYSICAL,
            status: Job_1.JobStatus.PENDING,
            userId: userIds[index % userIds.length],
            ownerId: userIds[(index + 1) % userIds.length],
            sectorId: (index % 10) + 1,
            seen: false,
            approved: false,
            createdAt: new Date(),
            updatedAt: new Date()
        })));
    }),
    down: (queryInterface) => __awaiter(void 0, void 0, void 0, function* () {
        return queryInterface.bulkDelete('jobs', {}, {});
    }),
};
