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
exports.newUsersTodayCount = void 0;
const sequelize_1 = require("sequelize");
const Models_1 = require("../../models/Models");
const modules_1 = require("../../utils/modules");
const newUsersTodayCount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        const userCount = yield Models_1.User.count({
            where: {
                createdAt: {
                    [sequelize_1.Op.gte]: startDate,
                    [sequelize_1.Op.lte]: endDate,
                },
            },
        });
        return (0, modules_1.successResponse)(res, 'success', userCount);
    }
    catch (error) {
        console.log(error);
        return (0, modules_1.errorResponse)(res, 'error', 'Internal server error');
    }
});
exports.newUsersTodayCount = newUsersTodayCount;
