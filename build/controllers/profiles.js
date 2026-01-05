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
exports.getUsers = exports.updateProfile = exports.UserAccountInfo = exports.MyAccountInfo = void 0;
const Models_1 = require("../models/Models");
const modules_1 = require("../utils/modules");
const body_1 = require("../validation/body");
const sequelize_1 = require("sequelize");
const query_1 = require("../validation/query");
const MyAccountInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    try {
        const profile = yield Models_1.Profile.findOne({
            where: { userId: id },
            attributes: {
                exclude: []
            },
            include: [
                {
                    model: Models_1.User,
                    attributes: { exclude: ['password', 'fcmToken'] },
                    include: [
                        {
                            model: Models_1.Location,
                            //attributes: ['country', 'state', 'city', 'address']
                        },
                        {
                            model: Models_1.Wallet,
                            attributes: { exclude: ['pin'] }
                        },
                        {
                            model: Models_1.Rider
                        }
                    ]
                },
                {
                    model: Models_1.Professional,
                    include: [{
                            model: Models_1.Profession,
                            include: [Models_1.Sector]
                        }]
                },
                {
                    model: Models_1.Cooperation,
                },
                {
                    model: Models_1.Education
                },
                {
                    model: Models_1.Certification
                },
                {
                    model: Models_1.Experience
                },
                {
                    model: Models_1.Portfolio,
                }
            ],
        });
        if (!profile)
            return (0, modules_1.errorResponse)(res, "Failed", { status: false, message: "Profile Does'nt exist" });
        profile.user.wallet.setDataValue('isActive', profile.user.wallet.pin !== null);
        return (0, modules_1.successResponse)(res, "Successful", profile);
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, "Failed", { error: error === null || error === void 0 ? void 0 : error.message });
    }
});
exports.MyAccountInfo = MyAccountInfo;
const UserAccountInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const profile = yield Models_1.Profile.findOne({
            where: { userId: userId },
            attributes: {
                exclude: []
            },
            include: [
                {
                    model: Models_1.User,
                    attributes: { exclude: ['password', 'fcmToken'] },
                    include: [
                        {
                            model: Models_1.Location,
                            //attributes: ['country', 'state', 'city', 'address']
                        },
                        {
                            model: Models_1.Wallet,
                            attributes: {
                                exclude: ['pin']
                            },
                        },
                        {
                            model: Models_1.Rider
                        }
                    ]
                },
                {
                    model: Models_1.Professional,
                    include: [{
                            model: Models_1.Profession,
                            include: [Models_1.Sector]
                        }]
                },
                {
                    model: Models_1.Cooperation,
                },
                {
                    model: Models_1.Education
                },
                {
                    model: Models_1.Certification
                },
                {
                    model: Models_1.Experience
                },
                {
                    model: Models_1.Portfolio,
                }
            ],
        });
        if (!profile)
            return (0, modules_1.errorResponse)(res, "Failed", { status: false, message: "Profile Does'nt exist" });
        profile.user.wallet.setDataValue('isActive', profile.user.wallet.pin !== null);
        return (0, modules_1.successResponse)(res, "Successful", profile);
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, "Failed", error);
    }
});
exports.UserAccountInfo = UserAccountInfo;
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { id, role } = req.user;
    const result = body_1.updateUserProfileSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            status: false,
            message: 'Validation error',
            errors: result.error.flatten().fieldErrors,
        });
    }
    const { contact, bio, location } = result.data;
    try {
        // console.log(req.user);
        if (bio) {
            const updated = yield Models_1.Profile.update(bio, {
                where: { userId: id }
            });
        }
        if (contact) {
            const updated = yield Models_1.User.update(contact, {
                where: { id }
            });
        }
        if (location) {
            const updated = yield Models_1.Location.update(location, {
                where: { userId: id }
            });
        }
        return (0, modules_1.successResponse)(res, "success", "Profile updated successfully");
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, "Failed", error);
    }
});
exports.updateProfile = updateProfile;
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const result = query_1.getUsersQuerySchema.safeParse(req.query);
    if (!result.success) {
        return res.status(400).json({
            status: false,
            message: 'Validation error',
            errors: result.error.flatten().fieldErrors,
        });
    }
    console.log(result.data);
    const { search, professionId, page, limit, role } = result.data;
    try {
        const contacts = yield Models_1.User.findAll({
            attributes: { exclude: ['password'] },
            where: Object.assign(Object.assign({}, (role && { role })), { id: { [sequelize_1.Op.ne]: id } }),
            include: [
                {
                    model: Models_1.Profile,
                    where: search
                        ? {
                            [sequelize_1.Op.or]: [
                                { firstName: { [sequelize_1.Op.like]: `%${search}%` } },
                                { lastName: { [sequelize_1.Op.like]: `%${search}%` } },
                            ],
                        }
                        : undefined,
                    include: [
                        {
                            model: Models_1.Professional,
                            include: [
                                {
                                    model: Models_1.Profession,
                                    where: professionId ? { id: professionId } : undefined,
                                },
                            ],
                        },
                    ],
                },
                {
                    model: Models_1.Location
                },
                {
                    model: Models_1.OnlineUser
                }
            ],
            limit: limit,
            offset: (page - 1) * limit,
            order: [['createdAt', 'DESC']],
        });
        return (0, modules_1.successResponse)(res, 'success', contacts);
    }
    catch (error) {
        console.log(error);
        return (0, modules_1.errorResponse)(res, "Failed", error);
    }
});
exports.getUsers = getUsers;
