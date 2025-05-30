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
exports.getProfessionals = void 0;
const { Op } = require('sequelize');
const Models_1 = require("../models/Models");
const modules_1 = require("../utils/modules");
const sequelize_1 = __importDefault(require("sequelize"));
const lat = 7.7322;
const lng = 8.5391;
const radiusInKm = 300; // radius in kilometers
const distanceQuery = `
  6371 * acos(
    cos(radians(${lat})) * cos(radians([location].[latitude])) *
    cos(radians([location].[longitude]) - radians(${lng})) +
    sin(radians(${lat})) * sin(radians([location].[latitude]))
  )
`;
const getProfessionals = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // try {
    const { profession, sector, span } = req.query;
    const spanValue = parseInt(span, 10) || 0;
    const { id } = req.user;
    // const userLocation = await Location.findAll({
    //     where: {
    //         userId: id
    //     }
    // })
    const professionals = yield Models_1.Professional.findAll({
        attributes: ['id', 'chargeFrom', 'available'],
        include: [
            {
                model: Models_1.Profile,
                attributes: ['id', 'firstName', 'lastName', 'avatar', 'verified', 'lga', 'state', 'userId'],
                include: [
                    {
                        model: Models_1.User,
                        include: [
                            {
                                model: Models_1.Location,
                                attributes: {
                                    include: [
                                        [sequelize_1.default.literal(distanceQuery), 'distance']
                                    ]
                                },
                                where: sequelize_1.default.where(sequelize_1.default.literal(distanceQuery), { [Op.lte]: radiusInKm })
                            }
                        ]
                    }
                ]
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
            },
        ]
    });
    return (0, modules_1.successResponse)(res, 'success', professionals);
    // } catch (error: any) {
    //     return errorResponse(res, 'error', error.message || 'Something went wrong');
    // }
});
exports.getProfessionals = getProfessionals;
