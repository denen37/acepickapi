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
        return queryInterface.bulkInsert('portfolios', [
            {
                title: 'Portfolio One',
                description: 'Description for Portfolio One',
                duration: '6 months',
                date: '2024-08-15',
                file: 'portfolio-one.pdf',
                profileId: 9,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                title: 'Portfolio Two',
                description: 'Description for Portfolio Two',
                duration: '8 months',
                date: '2024-10-10',
                file: 'portfolio-two.pdf',
                profileId: 10,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                title: 'Portfolio Three',
                description: 'Description for Portfolio Three',
                duration: '1 year',
                date: '2025-01-20',
                file: 'portfolio-three.pdf',
                profileId: 11,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                title: 'Portfolio Four',
                description: 'Description for Portfolio Four',
                duration: '3 months',
                date: '2025-03-18',
                file: 'portfolio-four.pdf',
                profileId: 12,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                title: 'Portfolio Five',
                description: 'Description for Portfolio Five',
                duration: '2 months',
                date: '2025-05-10',
                file: 'portfolio-five.pdf',
                profileId: 13,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                title: 'Portfolio Six',
                description: 'Description for Portfolio Six',
                duration: '5 months',
                date: '2025-06-22',
                file: 'portfolio-six.pdf',
                profileId: 14,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                title: 'Portfolio Seven',
                description: 'Description for Portfolio Seven',
                duration: '7 months',
                date: '2025-07-30',
                file: 'portfolio-seven.pdf',
                profileId: 15,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);
    }),
    down: (queryInterface) => __awaiter(void 0, void 0, void 0, function* () {
        return queryInterface.bulkDelete('portfolios', {}, {});
    }),
};
