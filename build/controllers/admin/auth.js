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
exports.getAdmins = exports.removeAdmin = exports.upgradeUserToAdmin = void 0;
const Models_1 = require("../../models/Models");
const modules_1 = require("../../utils/modules");
const sequelize_1 = require("sequelize");
const upgradeUserToAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const adminRole = yield Models_1.Role.findOne({ where: { name: "admin" } });
        if (!adminRole)
            return (0, modules_1.handleResponse)(res, 404, false, "Admin role not found");
        const user = yield Models_1.User.findByPk(userId);
        if (!user)
            return (0, modules_1.handleResponse)(res, 404, false, "User not found");
        const [newUserRole, created] = yield Models_1.UserRole.findOrCreate({
            where: {
                userId: user.id,
                roleId: adminRole.id
            }
        });
        if (!created) {
            return (0, modules_1.handleResponse)(res, 400, false, "User is already an admin");
        }
        return (0, modules_1.successResponse)(res, 'success', 'User upgraded to admin');
    }
    catch (error) {
        console.log(error);
        return (0, modules_1.errorResponse)(res, 'error', 'Error upgrading user to admin');
    }
});
exports.upgradeUserToAdmin = upgradeUserToAdmin;
const removeAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const adminRole = yield Models_1.Role.findOne({ where: { name: "admin" } });
        if (!adminRole)
            return (0, modules_1.handleResponse)(res, 404, false, "Admin role not found");
        const user = yield Models_1.User.findByPk(userId);
        if (!user)
            return (0, modules_1.handleResponse)(res, 404, false, "User not found");
        const deleted = yield Models_1.UserRole.destroy({
            where: {
                userId: user.id,
                roleId: adminRole.id
            }
        });
        if (deleted === 0) {
            return (0, modules_1.handleResponse)(res, 404, false, "User is not an admin");
        }
        return (0, modules_1.successResponse)(res, 'success', 'User removed from admin status');
    }
    catch (error) {
        console.log(error);
        return (0, modules_1.errorResponse)(res, 'error', 'Error removing admin status');
    }
});
exports.removeAdmin = removeAdmin;
const getAdmins = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const adminRole = yield Models_1.Role.findAll({
            where: {
                [sequelize_1.Op.or]: [
                    { name: "admin" },
                    { name: "superadmin" }
                ]
            }
        });
        const admins = yield Models_1.UserRole.findAll({
            where: {
                role: adminRole.map(role => role.id)
            },
            include: [{
                    model: Models_1.User,
                    attributes: { exclude: ['password', 'fcmToken', 'createdAt', 'updatedAt'] },
                    include: [Models_1.Profile]
                }]
        });
        return (0, modules_1.successResponse)(res, 'success', admins);
    }
    catch (error) {
        console.log(error);
        return (0, modules_1.errorResponse)(res, 'error', 'Error getting admins');
    }
});
exports.getAdmins = getAdmins;
