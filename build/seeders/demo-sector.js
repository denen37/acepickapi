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
        return queryInterface.bulkInsert('sectors', [
            { title: 'Technology', image: 'tech.jpg' },
            { title: 'Healthcare', image: 'healthcare.jpg' },
            { title: 'Education', image: 'education.jpg' },
            { title: 'Finance', image: 'finance.jpg' },
            { title: 'Construction', image: 'construction.jpg' },
            { title: 'Retail', image: 'retail.jpg' },
            { title: 'Transportation', image: 'transportation.jpg' },
            { title: 'Energy', image: 'energy.jpg' },
            { title: 'Manufacturing', image: 'manufacturing.jpg' },
            { title: 'Entertainment', image: 'entertainment.jpg' },
        ]);
    }),
    down: (queryInterface) => __awaiter(void 0, void 0, void 0, function* () {
        return queryInterface.bulkDelete('sector', {}, {});
    }),
};
