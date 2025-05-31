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
const query_1 = require("../validation/query");
const getProfessionals = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // try {
    const result = query_1.professionalSearchQuerySchema.safeParse(req.query);
    if (!result.success) {
        return res.status(400).json({
            error: "Invalid query parameters",
            issues: result.error.format(),
        });
    }
    const { profession, sector, span, state, lga, rating, page, limit } = result.data;
    const { id } = req.user;
    let spanValue;
    let userLocation;
    let distanceQuery = '';
    let minRating = rating;
    let offset = (page - 1) * limit;
    if (span) {
        userLocation = yield Models_1.Location.findOne({
            where: {
                userId: id
            }
        });
        console.log('lat', userLocation === null || userLocation === void 0 ? void 0 : userLocation.latitude);
        console.log('long', userLocation === null || userLocation === void 0 ? void 0 : userLocation.longitude);
        distanceQuery = `
  6371 * acos(
    cos(radians(${userLocation === null || userLocation === void 0 ? void 0 : userLocation.latitude})) * cos(radians([profile->user->location].[latitude])) *
    cos(radians([profile->user->location].[longitude]) - radians(${userLocation === null || userLocation === void 0 ? void 0 : userLocation.longitude})) +
    sin(radians(${userLocation === null || userLocation === void 0 ? void 0 : userLocation.latitude})) * sin(radians([profile->user->location].[latitude]))
  )
`;
    }
    const professionals = yield Models_1.Professional.findAll({
        attributes: [
            'id',
            'chargeFrom',
            'available',
            [sequelize_1.default.fn('AVG', sequelize_1.default.col('Profile.User.professionalReviews.rating')), 'avgRating']
        ],
        include: [
            {
                model: Models_1.Profile,
                attributes: ['id', 'firstName', 'lastName', 'avatar', 'verified', 'userId'],
                include: [
                    {
                        model: Models_1.User,
                        attributes: {
                            exclude: ['password', 'fcmToken']
                        },
                        include: [
                            {
                                model: Models_1.Review,
                                as: 'professionalReviews', // Must match your association alias
                                attributes: []
                            },
                            {
                                model: Models_1.Location,
                                attributes: {
                                    include: span ? [
                                        [sequelize_1.default.literal(distanceQuery), 'distance']
                                    ] : []
                                },
                                where: {
                                    [Op.and]: [
                                        span ? sequelize_1.default.where(sequelize_1.default.literal(distanceQuery), { [Op.lte]: span }) : undefined,
                                        state ? { state: { [Op.like]: `%${state}%` } } : {},
                                        lga ? { lga: { [Op.like]: `%${lga}%` } } : {}
                                    ].filter(Boolean) // Filter out undefined conditions
                                }
                            }
                        ]
                    }
                ]
            },
            {
                model: Models_1.Profession,
                where: profession ? {
                    title: { [Op.like]: `%${profession}%` }
                } : undefined,
                include: [
                    {
                        model: Models_1.Sector,
                        where: sector ? {
                            title: { [Op.like]: `%${sector}%` }
                        } : undefined
                    }
                ]
            }
        ],
        group: [
            'Professional.id',
            'Professional.chargeFrom',
            'Professional.available',
            'Profile.id',
            'Profile.firstName',
            'Profile.lastName',
            'Profile.avatar',
            'Profile.verified',
            'Profile.userId',
            'Profile.User.id',
            'Profile.User.email',
            'Profile.User.phone',
            'Profile.User.status',
            'Profile.User.role',
            'Profile.User.createdAt',
            'Profile.User.updatedAt',
            'Profile.User.location.id',
            'Profile.User.location.address',
            'Profile.User.location.lga',
            'Profile.User.location.state',
            'Profile.User.location.latitude',
            'Profile.User.location.longitude',
            'Profile.User.location.userId',
            'Profile.User.location.createdAt',
            'Profile.User.location.updatedAt',
            'Profession.id',
            'Profession.title',
            'Profession.image',
            'Profession.sectorId',
            'Profession.sector.id',
            'Profession.sector.title',
            'Profession.sector.image'
        ],
        having: minRating ? sequelize_1.default.where(sequelize_1.default.fn('AVG', sequelize_1.default.col('Profile.User.professionalReviews.rating')), { [Op.gte]: minRating }) : undefined,
    });
    return (0, modules_1.successResponse)(res, 'success', professionals);
    // } catch (error: any) {
    //     return errorResponse(res, 'error', error.message || 'Something went wrong');
    // }
});
exports.getProfessionals = getProfessionals;
