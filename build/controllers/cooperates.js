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
exports.getCooperates = void 0;
const { Op, fn, col, literal } = require('sequelize');
const Models_1 = require("../models/Models");
const modules_1 = require("../utils/modules");
const getCooperates = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { profession, sector } = req.query;
    try {
        const cooperates = yield Models_1.Cooperation.findAll({
            attributes: [
                'id',
                'nameOfOrg',
                'address',
                'state',
                'lga',
            ],
            include: [
                {
                    model: Models_1.Profession,
                    where: profession ? {
                        title: {
                            [Op.like]: `%${profession}%`
                        }
                    } : undefined,
                    include: [{
                            model: Models_1.Sector,
                            where: sector ? {
                                title: {
                                    [Op.like]: `%${sector}%`
                                }
                            } : undefined
                        }]
                },
                {
                    model: Models_1.Profile,
                    attributes: ['id', 'avatar'],
                    include: [{
                            model: Models_1.User,
                            attributes: ['id', 'role'],
                        }]
                }
            ]
        });
        const reviewStats = yield Models_1.Review.findAll({
            attributes: [
                'professionalUserId',
                [fn('AVG', col('rating')), 'averageRating'],
                [fn('COUNT', col('id')), 'totalReviews']
            ],
            group: ['professionalUserId'],
            raw: true
        });
        console.log('Review Stats:', reviewStats.map((stat) => stat.dataValues));
        return (0, modules_1.successResponse)(res, 'success', cooperates);
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, 'error', error);
    }
});
exports.getCooperates = getCooperates;
