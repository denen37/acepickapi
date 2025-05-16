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
module.exports = {
    up: (queryInterface) => __awaiter(void 0, void 0, void 0, function* () {
        return queryInterface.bulkInsert('material', Array.from({ length: 10 }).map((_, index) => ({
            description: `Material ${index + 1}`,
            quantity: Math.floor(Math.random() * 10) + 1,
            subTotal: Math.floor(Math.random() * 100) + 50,
            price: Math.floor(Math.random() * 20) + 10,
            jobId: (index % 10) + 1,
            createdAt: new Date(),
            updatedAt: new Date()
        })));
    }),
    down: (queryInterface) => __awaiter(void 0, void 0, void 0, function* () {
        return queryInterface.bulkDelete('material', {}, {});
    }),
};
