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
    up(queryInterface) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryInterface.bulkInsert('lanlog', [
                {
                    address: '123 Market Street, Lagos',
                    latitude: 6.5244,
                    longitude: 3.3792,
                    coordinates: { type: 'Point', coordinates: [3.3792, 6.5244] },
                    userId: '5b509520-9507-466c-b085-b6eac6c98a9f',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    address: 'Plot 11, Abuja Tech Hub',
                    latitude: 9.0579,
                    longitude: 7.4951,
                    coordinates: { type: 'Point', coordinates: [7.4951, 9.0579] },
                    userId: '5b509520-9507-466c-b085-b6eac6c98a9f',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    address: 'Main Road, Enugu',
                    latitude: 6.4483,
                    longitude: 7.5139,
                    coordinates: { type: 'Point', coordinates: [7.5139, 6.4483] },
                    userId: '5e0cd8e5-1342-4577-82b4-935ffc18af8c',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    address: 'Tech Valley, Port Harcourt',
                    latitude: 4.8156,
                    longitude: 7.0498,
                    coordinates: { type: 'Point', coordinates: [7.0498, 4.8156] },
                    userId: '79b426ad-8846-4f4b-b3f7-679c44f82950',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    address: 'University Rd, Kano',
                    latitude: 12.0022,
                    longitude: 8.5919,
                    coordinates: { type: 'Point', coordinates: [8.5919, 12.0022] },
                    userId: '7d214fc6-6369-43af-be0b-aa1a0f5ee967',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    address: 'Old Airport Rd, Kaduna',
                    latitude: 10.5484,
                    longitude: 7.4528,
                    coordinates: { type: 'Point', coordinates: [7.4528, 10.5484] },
                    userId: '83df1fcd-7e93-4395-8b95-c4bac2b3e316',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    address: 'Trade Fair Complex, Aba',
                    latitude: 5.1126,
                    longitude: 7.3667,
                    coordinates: { type: 'Point', coordinates: [7.3667, 5.1126] },
                    userId: 'a0a13da5-ee75-4954-a13e-32dbc7167dd3',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    address: 'Ring Road, Ibadan',
                    latitude: 7.3775,
                    longitude: 3.947,
                    coordinates: { type: 'Point', coordinates: [3.947, 7.3775] },
                    userId: 'e69bb0bb-0bfd-417c-a64a-d501ce59c618',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    address: 'Tech Drive, Uyo',
                    latitude: 5.0375,
                    longitude: 7.9128,
                    coordinates: { type: 'Point', coordinates: [7.9128, 5.0375] },
                    userId: 'f42f3fb5-646c-4743-afbd-de92e97ecf98',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ]);
        });
    },
    down(queryInterface) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryInterface.bulkDelete('lanlog', {}, {});
        });
    },
};
