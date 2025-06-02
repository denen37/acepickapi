"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.getProfessionalById = exports.getProfessionals = void 0;
const { Op } = require('sequelize');
const Models_1 = require("../models/Models");
const modules_1 = require("../utils/modules");
const sequelize_1 = __importStar(require("sequelize"));
const db_1 = __importDefault(require("../config/db"));
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
    const { profession, sector, span, state, lga, rating, page, limit, chargeFrom } = result.data;
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
        distanceQuery = `
  6371 * acos(
    cos(radians(${userLocation === null || userLocation === void 0 ? void 0 : userLocation.latitude})) * cos(radians([profile->user->location].[latitude])) *
    cos(radians([profile->user->location].[longitude]) - radians(${userLocation === null || userLocation === void 0 ? void 0 : userLocation.longitude})) +
    sin(radians(${userLocation === null || userLocation === void 0 ? void 0 : userLocation.latitude})) * sin(radians([profile->user->location].[latitude]))
  )
`;
    }
    const professionals = yield db_1.default.query(`
          SELECT [Professional].[id], 
                 [Professional].[chargeFrom], 
                 [Professional].[available], 
                 AVG([profile->user->professionalReviews].[rating]) AS [avgRating], 
                 [profile].[id] AS [profile.id], 
                 [profile].[firstName] AS [profile.firstName], 
                 [profile].[lastName] AS [profile.lastName], 
                 [profile].[avatar] AS [profile.avatar], 
                 [profile].[verified] AS [profile.verified], 
                 [profile].[userId] AS [profile.userId], 
                 [profile->user].[id] AS [profile.user.id], 
                 [profile->user].[email] AS [profile.user.email], 
                 [profile->user].[phone] AS [profile.user.phone], 
                 [profile->user].[status] AS [profile.user.status], 
                 [profile->user].[role] AS [profile.user.role], 
                 [profile->user].[createdAt] AS [profile.user.createdAt], 
                 [profile->user].[updatedAt] AS [profile.user.updatedAt], 
                 [profile->user->location].[id] AS [profile.user.location.id], 
                 [profile->user->location].[address] AS [profile.user.location.address], 
                 [profile->user->location].[lga] AS [profile.user.location.lga], 
                 [profile->user->location].[state] AS [profile.user.location.state], 
                 [profile->user->location].[latitude] AS [profile.user.location.latitude], 
                 [profile->user->location].[longitude] AS [profile.user.location.longitude], 
                 [profile->user->location].[zipcode] AS [profile.user.location.zipcode], 
                 [profile->user->location].[userId] AS [profile.user.location.userId], 
                 [profile->user->location].[createdAt] AS [profile.user.location.createdAt],
                 [profile->user->location].[updatedAt] AS [profile.user.location.updatedAt],
                 ${span ? `(${distanceQuery}) AS [profile.user.location.distance],` : ''} 
                 [profession].[id] AS [profession.id], 
                 [profession].[title] AS [profession.title], 
                 [profession].[image] AS [profession.image], 
                 [profession].[sectorId] AS [profession.sectorId], 
                 [profession->sector].[id] AS [profession.sector.id],
                 [profession->sector].[title] AS [profession.sector.title],
                 [profession->sector].[image] AS [profession.sector.image] 
          FROM [professionals] AS [Professional] 
          LEFT OUTER JOIN [profiles] AS [profile] 
              ON [Professional].[profileId] = [profile].[id] 
          LEFT OUTER JOIN (
              [users] AS [profile->user] 
              LEFT OUTER JOIN [review] AS [profile->user->professionalReviews] 
                  ON [profile->user].[id] = [profile->user->professionalReviews].[professionalUserId] 
              INNER JOIN [location] AS [profile->user->location] 
                  ON [profile->user].[id] = [profile->user->location].[userId] 
                  ${span || state || lga ? `
                  AND (
                      ${span ? `(${distanceQuery} <= ${span})` : '1=1'}
                      ${state ? ` AND [profile->user->location].[state] LIKE N'%${state}%'` : ''}
                      ${lga ? ` AND [profile->user->location].[lga] LIKE N'%${lga}%'` : ''}
                  )` : ''}
          ) ON [profile].[userId] = [profile->user].[id] 
          INNER JOIN [professions] AS [profession] 
              ON [Professional].[professionId] = [profession].[id] 
              ${profession ? `AND [profession].[title] LIKE N'%${profession}%'` : ''} 
          INNER JOIN [sectors] AS [profession->sector] 
              ON [profession].[sectorId] = [profession->sector].[id] 
              ${sector ? `AND [profession->sector].[title] LIKE N'%${sector}%'` : ''}
      
          ${chargeFrom ? `WHERE [Professional].[chargeFrom] >= ${chargeFrom}` : ''}
      
          GROUP BY 
              [Professional].[id], [Professional].[chargeFrom], [Professional].[available], 
              [profile].[id], [profile].[firstName], [profile].[lastName], [profile].[avatar], 
              [profile].[verified], [profile].[userId], 
              [profile->user].[id], [profile->user].[email], [profile->user].[phone], 
              [profile->user].[status], [profile->user].[role], 
              [profile->user].[createdAt], [profile->user].[updatedAt], 
              [profile->user->location].[id], [profile->user->location].[address], 
              [profile->user->location].[lga], [profile->user->location].[state], 
              [profile->user->location].[latitude], [profile->user->location].[longitude], 
              [profile->user->location].[zipcode], [profile->user->location].[userId], 
              [profile->user->location].[createdAt], [profile->user->location].[updatedAt], 
              [profession].[id], [profession].[title], [profession].[image], 
              [profession].[sectorId], [profession->sector].[id], 
              [profession->sector].[title], [profession->sector].[image] 
      
          ${minRating ? `HAVING AVG([profile->user->professionalReviews].[rating]) >= ${minRating}` : ''}
          
          ORDER BY [Professional].[id] ASC
          OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY;
        `, {
        type: sequelize_1.QueryTypes.SELECT
    });
    const nestedProfessionals = professionals.map(modules_1.nestFlatKeys);
    return (0, modules_1.successResponse)(res, 'success', nestedProfessionals);
    // } catch (error: any) {
    //     return errorResponse(res, 'error', error.message || 'Something went wrong');
    // }
});
exports.getProfessionals = getProfessionals;
const getProfessionalById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { professionalId } = req.params;
        const professional = yield Models_1.Professional.findOne({
            where: { id: professionalId },
            attributes: [
                'id', 'file', 'intro', 'chargeFrom', 'language', 'available', 'workType',
                'totalEarning', 'completedAmount', 'pendingAmount', 'rejectedAmount',
                'availableWithdrawalAmount', 'regNum', 'yearsOfExp', 'online',
                'profileId', 'professionId', 'createdAt', 'updatedAt',
                [sequelize_1.default.fn('AVG', sequelize_1.default.col('profile.user.professionalReviews.rating')), 'avgRating'],
                [sequelize_1.default.fn('COUNT', sequelize_1.default.col('profile.user.professionalReviews.rating')), 'numRating'],
            ],
            include: [
                {
                    model: Models_1.Profile,
                    as: 'profile',
                    attributes: [
                        'id', 'firstName', 'lastName', 'fcmToken', 'avatar', 'verified', 'notified',
                        'totalJobs', 'totalExpense', 'rate', 'totalJobsDeclined', 'totalJobsPending',
                        'count', 'totalJobsOngoing', 'totalJobsCompleted', 'totalReview',
                        'totalJobsApproved', 'totalJobsCanceled', 'totalDisputes', 'bvn',
                        'bvnVerified', 'switch', 'store', 'position', 'userId', 'createdAt', 'updatedAt'
                    ],
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
                                    attributes: ['id', 'rating', 'review', 'professionalUserId', 'clientUserId', 'createdAt', 'updatedAt'] // used only for aggregation
                                }
                            ]
                        }
                    ]
                }
            ],
            group: [
                'Professional.id',
                'Professional.file',
                'Professional.intro',
                'Professional.chargeFrom',
                'Professional.language',
                'Professional.available',
                'Professional.workType',
                'Professional.totalEarning',
                'Professional.completedAmount',
                'Professional.pendingAmount',
                'Professional.rejectedAmount',
                'Professional.availableWithdrawalAmount',
                'Professional.regNum',
                'Professional.yearsOfExp',
                'Professional.online',
                'Professional.profileId',
                'Professional.professionId',
                'Professional.createdAt',
                'Professional.updatedAt',
                'profile.id',
                'profile.firstName',
                'profile.lastName',
                'profile.fcmToken',
                'profile.avatar',
                'profile.verified',
                'profile.notified',
                'profile.totalJobs',
                'profile.totalExpense',
                'profile.rate',
                'profile.totalJobsDeclined',
                'profile.totalJobsPending',
                'profile.count',
                'profile.totalJobsOngoing',
                'profile.totalJobsCompleted',
                'profile.totalReview',
                'profile.totalJobsApproved',
                'profile.totalJobsCanceled',
                'profile.totalDisputes',
                'profile.bvn',
                'profile.bvnVerified',
                'profile.switch',
                'profile.store',
                'profile.position',
                'profile.userId',
                'profile.createdAt',
                'profile.updatedAt',
                'profile.user.id',
                'profile.user.email',
                'profile.user.phone',
                'profile.user.status',
                'profile.user.role',
                'profile.user.createdAt',
                'profile.user.updatedAt',
                'profile.user.location.id',
                'profile.user.location.address',
                'profile.user.location.lga',
                'profile.user.location.state',
                'profile.user.location.latitude',
                'profile.user.location.longitude',
                'profile.user.location.zipcode',
                'profile.user.professionalReviews.id',
                'profile.user.professionalReviews.rating',
                'profile.user.professionalReviews.review',
                'profile.user.professionalReviews.professionalUserId',
                'profile.user.professionalReviews.clientUserId',
                'profile.user.professionalReviews.createdAt',
                'profile.user.professionalReviews.updatedAt'
            ]
        });
        if (!professional) {
            return (0, modules_1.handleResponse)(res, 404, false, 'Professional not found');
        }
        return (0, modules_1.successResponse)(res, 'success', professional);
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, 'error', error.message || 'Something went wrong');
    }
});
exports.getProfessionalById = getProfessionalById;
