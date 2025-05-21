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
exports.getProfessionals = void 0;
const { Op } = require('sequelize');
const Models_1 = require("../models/Models");
const modules_1 = require("../utils/modules");
const getProfessionals = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { profession, sector } = req.query;
        const professionals = yield Models_1.Professional.findAll({
            where: {},
            attributes: ['id', 'chargeFrom', 'available'],
            include: [
                {
                    model: Models_1.Profile,
                    attributes: ['id', 'firstName', 'lastName', 'avatar', 'verified', 'lga', 'state', 'userId']
                },
                {
                    model: Models_1.Profession,
                    where: profession ? {
                        title: {
                            [Op.like]: `%${profession}%`
                        }
                    } : undefined,
                    include: [
                        {
                            model: Models_1.Sector,
                            where: sector ? {
                                title: {
                                    [Op.like]: `%${sector}%`
                                }
                            } : undefined
                        }
                    ]
                }
            ]
        });
        return (0, modules_1.successResponse)(res, 'success', professionals);
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, 'error', error.message || 'Something went wrong');
    }
});
exports.getProfessionals = getProfessionals;
