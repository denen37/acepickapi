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
exports.updateProfile = exports.UserAccountInfo = exports.MyAccountInfo = void 0;
const Models_1 = require("../models/Models");
const modules_1 = require("../utils/modules");
const body_1 = require("../validation/body");
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
                        }
                    ]
                },
                {
                    model: Models_1.Professional,
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
                },
                {
                    model: Models_1.Rider
                }
            ],
        });
        if (!profile)
            return (0, modules_1.errorResponse)(res, "Failed", { status: false, message: "Profile Does'nt exist" });
        return (0, modules_1.successResponse)(res, "Successful", profile);
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, "Failed", error);
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
                            attributes: { exclude: ['pin'] }
                        },
                        {
                            model: Models_1.Rider
                        }
                    ]
                },
                {
                    model: Models_1.Professional,
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
