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
exports.toggleAvailable = exports.getDeliveryMen = exports.getProfessionalByUserId = exports.getProfessionalById = exports.getProfessionals = void 0;
const { Op } = require('sequelize');
const Models_1 = require("../models/Models");
const modules_1 = require("../utils/modules");
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
const query_1 = require("../validation/query");
const enum_1 = require("../utils/enum");
const getProfessionals = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = query_1.professionalSearchQuerySchema.safeParse(req.query);
        if (!result.success) {
            return res.status(400).json({
                error: "Invalid query parameters",
                issues: result.error.format(),
            });
        }
        const { professionId, profession, sector, span, state, lga, rating, page, limit, chargeFrom, allowUnverified = false } = result.data;
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
        }
        distanceQuery = `
  6371 * acos(
    cos(radians(${userLocation === null || userLocation === void 0 ? void 0 : userLocation.latitude})) * cos(radians(location.latitude)) *
    cos(radians(location.longitude) - radians(${userLocation === null || userLocation === void 0 ? void 0 : userLocation.longitude})) +
    sin(radians(${userLocation === null || userLocation === void 0 ? void 0 : userLocation.latitude})) * sin(radians(location.latitude))
  )
`;
        const professionals = yield db_1.default.query(`
    SELECT 
      Professional.id,
      Professional.chargeFrom,
      Professional.available,
      AVG(professionalRatings.value) AS avgRating,

      profile.id AS 'profile.id',
      profile.firstName AS 'profile.firstName',
      profile.lastName AS 'profile.lastName',
      profile.avatar AS 'profile.avatar',
      profile.verified AS 'profile.verified',
      profile.bvnVerified AS 'profile.bvnVerified',
      profile.userId AS 'profile.userId',

      user.id AS 'profile.user.id',
      user.email AS 'profile.user.email',
      user.phone AS 'profile.user.phone',
      user.status AS 'profile.user.status',
      user.role AS 'profile.user.role',
      user.createdAt AS 'profile.user.createdAt',
      user.updatedAt AS 'profile.user.updatedAt',

      location.id AS 'profile.user.location.id',
      location.address AS 'profile.user.location.address',
      location.lga AS 'profile.user.location.lga',
      location.state AS 'profile.user.location.state',
      location.latitude AS 'profile.user.location.latitude',
      location.longitude AS 'profile.user.location.longitude',
      location.zipcode AS 'profile.user.location.zipcode',
      location.userId AS 'profile.user.location.userId',
      location.createdAt AS 'profile.user.location.createdAt',
      location.updatedAt AS 'profile.user.location.updatedAt',
      ${span ? `(${distanceQuery}) AS 'profile.user.location.distance',` : ''}

      profession.id AS 'profession.id',
      profession.title AS 'profession.title',
      profession.image AS 'profession.image',
      profession.sectorId AS 'profession.sectorId',

      sector.id AS 'profession.sector.id',
      sector.title AS 'profession.sector.title',
      sector.image AS 'profession.sector.image'

    FROM professionals AS Professional
    LEFT JOIN profiles AS profile ON Professional.profileId = profile.id ${!allowUnverified ? 'AND profile.bvnVerified = true' : ''}
    LEFT JOIN users AS user ON profile.userId = user.id AND user.status = '${enum_1.UserStatus.ACTIVE}'
    LEFT JOIN review AS professionalReviews ON user.id = professionalReviews.professionalUserId
    LEFT JOIN rating AS professionalRatings ON user.id = professionalRatings.professionalUserId
    INNER JOIN location AS location ON user.id = location.userId
      ${span || state || lga ? `
        AND (
          ${span ? `(${distanceQuery} <= ${span})` : '1=1'}
          ${state ? `AND location.state LIKE '%${state}%'` : ''}
          ${lga ? `AND location.lga LIKE '%${lga}%'` : ''}
        )
      ` : ''}
    INNER JOIN professions AS profession ON Professional.professionId = profession.id
      ${profession ? `AND profession.title LIKE '%${profession}%'` : ''}
    INNER JOIN sectors AS sector ON profession.sectorId = sector.id
      ${sector ? `AND sector.title LIKE '%${sector}%'` : ''}

    ${chargeFrom || professionId ? `WHERE ` : ''}
    ${chargeFrom ? `Professional.chargeFrom >= ${chargeFrom}` : ''}
    ${chargeFrom && professionId ? ' AND ' : ''}
    ${professionId ? `Professional.professionId = ${professionId}` : ''}

    GROUP BY 
      Professional.id,
      profile.id,
      profile.firstName,
      profile.lastName,
      profile.avatar,
      profile.verified,
      profile.userId,
      user.id,
      user.email,
      user.phone,
      user.status,
      user.role,
      user.createdAt,
      user.updatedAt,
      location.id,
      location.address,
      location.lga,
      location.state,
      location.latitude,
      location.longitude,
      location.zipcode,
      location.userId,
      location.createdAt,
      location.updatedAt,
      profession.id,
      profession.title,
      profession.image,
      profession.sectorId,
      sector.id,
      sector.title,
      sector.image

    ${minRating ? `HAVING avgRating >= ${minRating}` : ''}
    ORDER BY Professional.id ASC
    LIMIT ${limit} OFFSET ${offset};
  `, { type: sequelize_1.QueryTypes.SELECT });
        const nestedProfessionals = professionals.map(modules_1.nestFlatKeys);
        return (0, modules_1.successResponse)(res, 'success', nestedProfessionals);
    }
    catch (error) {
        console.log(error);
        return (0, modules_1.errorResponse)(res, 'error', error.message || 'Something went wrong');
    }
});
exports.getProfessionals = getProfessionals;
const getProfessionalById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { professionalId } = req.params;
        const professional = yield Models_1.Professional.findOne({
            where: { id: professionalId },
            include: [
                {
                    model: Models_1.Profile,
                    as: 'profile',
                    attributes: ['id']
                },
                {
                    model: Models_1.Profession,
                    as: 'profession',
                    include: [
                        {
                            model: Models_1.Sector,
                            as: 'sector',
                        }
                    ]
                },
            ],
            attributes: {
                include: [
                    [
                        db_1.default.literal(`(
                                SELECT AVG(value)
                                FROM rating
                                WHERE rating.professionalUserId = profile.userId
                                )`),
                        'avgRating'
                    ],
                    [
                        db_1.default.literal(`(
                                SELECT COUNT(*)
                                FROM rating
                                WHERE rating.professionalUserId = profile.userId
                                )`),
                        'numRating'
                    ]
                ]
            }
        });
        const profile = yield Models_1.Profile.findOne({
            where: { id: professional === null || professional === void 0 ? void 0 : professional.profile.id },
            include: [
                {
                    model: Models_1.User,
                    as: 'user',
                    attributes: ['id', 'email', 'phone', 'status', 'role', 'createdAt', 'updatedAt'],
                    include: [
                        {
                            model: Models_1.Location,
                            as: 'location',
                            attributes: ['id', 'address', 'lga', 'state', 'latitude', 'longitude', 'zipcode']
                        },
                        {
                            model: Models_1.Review,
                            as: 'professionalReviews',
                            attributes: ['id', 'text', 'professionalUserId', 'clientUserId', 'createdAt', 'updatedAt'], // used only for aggregation
                            include: [
                                {
                                    model: Models_1.User,
                                    as: 'clientUser',
                                    attributes: ['id', 'email', 'phone', 'status', 'role'],
                                    include: [
                                        {
                                            model: Models_1.Profile,
                                            as: 'profile',
                                            attributes: ['id', 'firstName', 'lastName', 'birthDate', 'avatar']
                                        }
                                    ]
                                }
                            ]
                        },
                    ]
                },
                {
                    model: Models_1.Education,
                    as: 'education',
                },
                {
                    model: Models_1.Certification,
                    as: 'certification'
                },
                {
                    model: Models_1.Portfolio,
                    as: 'portfolio'
                },
                {
                    model: Models_1.Experience,
                    as: 'experience'
                }
            ]
        });
        if (!professional) {
            return (0, modules_1.handleResponse)(res, 404, false, 'Professional not found');
        }
        return (0, modules_1.successResponse)(res, 'success', Object.assign(Object.assign({}, professional.toJSON()), { profile }));
    }
    catch (error) {
        console.log(error);
        return (0, modules_1.errorResponse)(res, 'error', error.message || 'Something went wrong');
    }
});
exports.getProfessionalById = getProfessionalById;
const getProfessionalByUserId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const user = yield Models_1.User.findByPk(userId, {
            attributes: { exclude: ['password', 'fcmToken'] },
            include: [
                {
                    model: Models_1.Profile,
                    include: [
                        {
                            model: Models_1.Professional,
                            include: [
                                {
                                    model: Models_1.Profession,
                                    include: [Models_1.Sector]
                                }
                            ]
                        },
                        Models_1.Education,
                        Models_1.Experience,
                        Models_1.Certification,
                        Models_1.Portfolio
                    ]
                },
                {
                    model: Models_1.Location,
                }, {
                    model: Models_1.Review,
                    as: 'professionalReviews',
                    include: [
                        {
                            model: Models_1.User,
                            as: 'clientUser',
                            include: [Models_1.Profile]
                        }
                    ]
                }
            ]
        });
        if (!user) {
            return (0, modules_1.handleResponse)(res, 404, false, 'Professional not found');
        }
        return (0, modules_1.successResponse)(res, 'success', user);
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, 'error', error.message || 'Something went wrong');
    }
});
exports.getProfessionalByUserId = getProfessionalByUserId;
const getDeliveryMen = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
});
exports.getDeliveryMen = getDeliveryMen;
const toggleAvailable = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, role } = req.user;
    const { available } = req.body;
    try {
        const user = yield Models_1.User.findByPk(id, {
            attributes: ['id'],
            include: [{
                    model: Models_1.Profile,
                    attributes: ['id', 'userId'],
                    include: [Models_1.Professional]
                }]
        });
        if (!user) {
            return (0, modules_1.handleResponse)(res, 404, false, 'User not found');
        }
        if (!user.profile.professional) {
            return (0, modules_1.handleResponse)(res, 404, false, 'User is not a professional');
        }
        user.profile.professional.available = available;
        yield user.profile.professional.save();
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, 'error', error.message || 'Something went wrong');
    }
});
exports.toggleAvailable = toggleAvailable;
