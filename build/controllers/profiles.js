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
exports.metricOperations = exports.updateProfile = exports.ProfAccountInfo = exports.getProfessionalById = exports.getProfessionals = exports.getCooperates = void 0;
const Cooperation_1 = require("../models/Cooperation");
const Profile_1 = require("../models/Profile");
const User_1 = require("../models/User");
const modules_1 = require("../utils/modules");
const Professional_1 = require("../models/Professional");
const axios_1 = __importDefault(require("axios"));
const configSetup_1 = __importDefault(require("../config/configSetup"));
var Metrics;
(function (Metrics) {
    Metrics["ONGOING"] = "ongoing";
    Metrics["PENDING"] = "pending";
    Metrics["DECLINED"] = "declined";
    Metrics["COMPLETED"] = "completed";
    Metrics["CANCELLED"] = "cancelled";
    Metrics["APPROVED"] = "approved";
    Metrics["REVIEWS"] = "reviews";
})(Metrics || (Metrics = {}));
var MetricOperation;
(function (MetricOperation) {
    MetricOperation["INCREMENT"] = "increment";
    MetricOperation["DECREMENT"] = "decrement";
})(MetricOperation || (MetricOperation = {}));
const getCooperates = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { metadata, search } = req.query;
    let hasmetadata = metadata === 'true' ? true : false;
    let assoc = hasmetadata ? [
        {
            model: Profile_1.Profile,
            attributes: ['id', 'fullName', 'avatar', 'verified', 'notified', 'lga', 'state', 'address']
        },
        {
            model: User_1.User,
            attributes: ['id', 'email', 'phone'],
        }
    ] : [];
    let searchids = [];
    try {
        if (search) {
            let result = yield axios_1.default.get(`${configSetup_1.default.JOBS_BASE_URL}/jobs-api/search_profs?search=${search}`);
            searchids = result.data.data.map((item) => item.id);
        }
        const whereCondition = searchids.length > 0 ? { professionId: searchids } : {};
        const cooperates = yield Cooperation_1.Cooperation.findAll({
            where: whereCondition,
            include: assoc
        });
        return (0, modules_1.successResponse)(res, 'sucess', cooperates);
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, 'error', error);
    }
});
exports.getCooperates = getCooperates;
const getProfessionals = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { search } = req.query;
    let { userIds } = req.body;
    //Send a message to jobs to return professionals
    try {
        let searchids = [];
        if (search) {
            let result = yield axios_1.default.get(`${configSetup_1.default.JOBS_BASE_URL}/jobs-api/search_profs?search=${search}`, {
                headers: {
                    Authorization: req.headers.authorization
                }
            });
            searchids = result.data.data.map((item) => item.id);
        }
        let whereCondition = searchids.length > 0 ? { professionId: searchids } : {};
        if (userIds && userIds.length > 0) {
            whereCondition.userId = userIds;
        }
        // console.log(whereCondition)
        let professionals = yield Professional_1.Professional.findAll({
            where: whereCondition,
            attributes: ['id', 'chargeFrom', 'avaialable', 'professionId'],
            include: [
                {
                    model: User_1.User,
                    attributes: ['id', 'email', 'phone'],
                    include: [{
                            model: Profile_1.Profile,
                            attributes: ['id', 'fullName', 'avatar', 'verified', 'notified', 'lga', 'state', 'address']
                        }]
                }
            ]
        });
        let result = yield axios_1.default.post(`${configSetup_1.default.JOBS_BASE_URL}/jobs-api/get_profs`, { profIds: professionals.map(prof => prof.professionId), }, {
            headers: {
                Authorization: req.headers.authorization
            }
        });
        const profList = result.data.data;
        professionals.forEach((prof) => {
            const profession = profList.find((p) => p.id === prof.professionId);
            prof.setDataValue('profession', profession || null);
        });
        return (0, modules_1.successResponse)(res, 'success', professionals);
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, 'error', error);
    }
});
exports.getProfessionals = getProfessionals;
const getProfessionalById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { userId } = req.params;
    try {
        const profile = yield Profile_1.Profile.findOne({
            where: { userId: userId },
            attributes: {
                exclude: []
            },
            include: [
                {
                    model: User_1.User,
                    attributes: ["email", "phone"],
                },
                {
                    model: Professional_1.Professional,
                },
                {
                    model: Cooperation_1.Cooperation,
                },
            ],
        });
        //we need to get the profession of the user
        const profResponse = yield axios_1.default.get(`${configSetup_1.default.JOBS_BASE_URL}/jobs-api/profs/${profile === null || profile === void 0 ? void 0 : profile.professional.professionId}`, {
            headers: {
                Authorization: req.headers.authorization
            }
        });
        const profession = profResponse.data.data;
        profile === null || profile === void 0 ? void 0 : profile.professional.setDataValue('profession', profession || null);
        //TODO - we need to get the reviews of the user
        return (0, modules_1.successResponse)(res, 'success', profile);
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, 'error', error);
    }
});
exports.getProfessionalById = getProfessionalById;
const ProfAccountInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const profile = yield Profile_1.Profile.findOne({
        where: { userId: id },
        attributes: {
            exclude: []
        },
        include: [
            {
                model: User_1.User,
                attributes: ["email", "phone"],
            },
            {
                model: Professional_1.Professional,
            },
            {
                model: Cooperation_1.Cooperation,
            },
        ],
    });
    const walletResponse = yield axios_1.default.get(`${configSetup_1.default.PAYMENT_BASE_URL}/pay-api/view-wallet`, {
        headers: {
            Authorization: req.headers.authorization
        }
    });
    const wallet = walletResponse.data.data;
    profile === null || profile === void 0 ? void 0 : profile.setDataValue('wallet', wallet);
    if (!profile)
        return (0, modules_1.errorResponse)(res, "Failed", { status: false, message: "Profile Does'nt exist" });
    return (0, modules_1.successResponse)(res, "Successful", profile);
});
exports.ProfAccountInfo = ProfAccountInfo;
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { id, role } = req.user;
    try {
        console.log(req.user);
        const profile = yield Profile_1.Profile.findOne({
            where: { userId: id }
        });
        const updatedProfile = yield (profile === null || profile === void 0 ? void 0 : profile.update(req.body));
        yield (profile === null || profile === void 0 ? void 0 : profile.save());
        return (0, modules_1.successResponse)(res, "Successful", updatedProfile);
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, "Failed", error);
    }
});
exports.updateProfile = updateProfile;
const metricOperations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const { payload } = req.body;
    const profile = yield Profile_1.Profile.findOne({
        where: { userId: userId },
    });
    if (!profile)
        return (0, modules_1.handleResponse)(res, 404, false, "Profile Does not exist");
    payload.forEach(item => {
        switch (item.field) {
            case Metrics.ONGOING:
                if (item.action === MetricOperation.INCREMENT) {
                    profile.totalJobsOngoing += 1;
                }
                else {
                    profile.totalJobsOngoing -= 1;
                }
                break;
            case Metrics.COMPLETED:
                if (item.action === MetricOperation.INCREMENT)
                    profile.totalJobsCompleted += 1;
                else
                    profile.totalJobsCompleted -= 1;
                break;
            case Metrics.CANCELLED:
                if (item.action === MetricOperation.INCREMENT)
                    profile.totalJobsCanceled += 1;
                else
                    profile.totalJobsCanceled -= 1;
                break;
            case Metrics.PENDING:
                if (item.action === MetricOperation.INCREMENT)
                    profile.totalJobsPending += 1;
                else
                    profile.totalJobsPending -= 1;
                break;
            case Metrics.DECLINED:
                if (item.action === MetricOperation.INCREMENT)
                    profile.totalJobsDeclined += 1;
                else
                    profile.totalJobsDeclined -= 1;
                break;
            case Metrics.APPROVED:
                if (item.action === MetricOperation.INCREMENT)
                    profile.totalJobsApproved += 1;
                else
                    profile.totalJobsApproved -= 1;
                break;
            case Metrics.REVIEWS:
                if (item.action === MetricOperation.INCREMENT)
                    profile.totalReview += 1;
                else
                    profile.totalReview -= 1;
            default:
                break;
        }
    });
    yield profile.save();
    return (0, modules_1.successResponse)(res, 'success', 'Profile updated successfully');
});
exports.metricOperations = metricOperations;
