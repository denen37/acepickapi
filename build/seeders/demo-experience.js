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
        return queryInterface.bulkInsert('experiences', [
            {
                postHeld: 'Software Engineer',
                workPlace: 'Tech Corp',
                startDate: '2020-01-01',
                endDate: '2022-12-31',
                profileId: 9,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                postHeld: 'Project Manager',
                workPlace: 'Innovate Ltd',
                startDate: '2018-06-01',
                endDate: '2021-05-31',
                profileId: 10,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                postHeld: 'Data Analyst',
                workPlace: 'Data Solutions',
                startDate: '2019-03-15',
                endDate: '2023-02-28',
                profileId: 11,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                postHeld: 'Network Administrator',
                workPlace: 'IT Secure',
                startDate: '2017-09-01',
                endDate: '2022-08-31',
                profileId: 12,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                postHeld: 'Marketing Executive',
                workPlace: 'Brand Hub',
                startDate: '2016-05-10',
                endDate: '2021-04-30',
                profileId: 13,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    }),
    down: (queryInterface) => __awaiter(void 0, void 0, void 0, function* () {
        return queryInterface.bulkDelete('experiences', {}, {});
    }),
};
