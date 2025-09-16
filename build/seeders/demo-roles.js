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
    up(queryInterface) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryInterface.bulkInsert("roles", [
                { name: "superadmin", createdAt: new Date(), updatedAt: new Date() },
                { name: "admin", createdAt: new Date(), updatedAt: new Date() },
                { name: "client", createdAt: new Date(), updatedAt: new Date() },
                { name: "professional", createdAt: new Date(), updatedAt: new Date() },
                { name: "corperate", createdAt: new Date(), updatedAt: new Date() },
                { name: "delivery", createdAt: new Date(), updatedAt: new Date() },
            ]);
        });
    },
    down(queryInterface) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryInterface.bulkDelete("roles", {}, {});
        });
    },
};
