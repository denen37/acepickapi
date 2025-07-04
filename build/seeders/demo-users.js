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
const enum_1 = require("../utils/enum");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
module.exports = {
    up: (queryInterface) => __awaiter(void 0, void 0, void 0, function* () {
        const hashedPassword = yield bcryptjs_1.default.hash('password123', 10);
        return queryInterface.bulkInsert('users', [
            {
                id: '0a1a5aad-6cfc-4cc7-b7c7-2ef40c314e2c', email: 'user1@example.com', password: hashedPassword, fcmToken: null, phone: '1234567890', role: enum_1.UserRole.CLIENT, status: enum_1.UserStatus.ACTIVE, createdAt: new Date(), updatedAt: new Date(),
            },
            {
                id: '2c785cab-e960-486f-b684-6cfc5e777fc2', email: 'user2@example.com', password: hashedPassword, fcmToken: null, phone: '0987654321', role: enum_1.UserRole.CLIENT, status: enum_1.UserStatus.INACTIVE, createdAt: new Date(), updatedAt: new Date(),
            },
            {
                id: '33bb5c54-fd64-4cfa-b90b-b0951d3f0564', email: 'user3@example.com', password: hashedPassword, fcmToken: null, phone: '1112223333', role: enum_1.UserRole.CLIENT, status: enum_1.UserStatus.SUSPENDED, createdAt: new Date(), updatedAt: new Date(),
            },
            {
                id: '5b509520-9507-466c-b085-b6eac6c98a9f', email: 'user4@example.com', password: hashedPassword, fcmToken: null, phone: '4445556666', role: enum_1.UserRole.PROFESSIONAL, status: enum_1.UserStatus.ACTIVE, createdAt: new Date(), updatedAt: new Date(),
            },
            {
                id: '5e0cd8e5-1342-4577-82b4-935ffc18af8c', email: 'user5@example.com', password: hashedPassword, fcmToken: null, phone: '7778889999', role: enum_1.UserRole.PROFESSIONAL, status: enum_1.UserStatus.INACTIVE, createdAt: new Date(), updatedAt: new Date(),
            },
            {
                id: '79b426ad-8846-4f4b-b3f7-679c44f82950', email: 'user6@example.com', password: hashedPassword, fcmToken: null, phone: '6667778888', role: enum_1.UserRole.PROFESSIONAL, status: enum_1.UserStatus.ACTIVE, createdAt: new Date(), updatedAt: new Date(),
            },
            {
                id: '7d214fc6-6369-43af-be0b-aa1a0f5ee967', email: 'user7@example.com', password: hashedPassword, fcmToken: null, phone: '5556667777', role: enum_1.UserRole.PROFESSIONAL, status: enum_1.UserStatus.SUSPENDED, createdAt: new Date(), updatedAt: new Date(),
            },
            {
                id: 'a0a13da5-ee75-4954-a13e-32dbc7167dd3', email: 'user8@example.com', password: hashedPassword, fcmToken: null, phone: '4443332222', role: enum_1.UserRole.CORPERATE, status: enum_1.UserStatus.ACTIVE, createdAt: new Date(), updatedAt: new Date(),
            },
            {
                id: 'e69bb0bb-0bfd-417c-a64a-d501ce59c618', email: 'user9@example.com', password: hashedPassword, fcmToken: null, phone: '1110009999', role: enum_1.UserRole.CORPERATE, status: enum_1.UserStatus.INACTIVE, createdAt: new Date(), updatedAt: new Date(),
            },
            {
                id: 'f42f3fb5-646c-4743-afbd-de92e97ecf98', email: 'user10@example.com', password: hashedPassword, fcmToken: null, phone: '2223334444', role: enum_1.UserRole.CORPERATE, status: enum_1.UserStatus.ACTIVE, createdAt: new Date(), updatedAt: new Date(),
            },
        ]);
    }),
    down: (queryInterface) => __awaiter(void 0, void 0, void 0, function* () {
        return queryInterface.bulkDelete('users', {}, {});
    }),
};
"";
