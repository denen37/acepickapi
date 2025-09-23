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
exports.toggleCommission = exports.deleteCommission = exports.updateCommission = exports.getCommissionById = exports.getCommissions = exports.createCommission = void 0;
const body_1 = require("../../validation/body");
const Commison_1 = require("../../models/Commison");
const modules_1 = require("../../utils/modules");
const createCommission = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = body_1.commissionSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ message: result.error.issues[0].message });
        }
        const newCommission = yield Commison_1.Commission.create(result.data);
        return (0, modules_1.successResponse)(res, 'success', newCommission);
    }
    catch (error) {
        console.log(error);
        return (0, modules_1.errorResponse)(res, 'error', 'An error occurred');
    }
});
exports.createCommission = createCommission;
const getCommissions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const commission = yield Commison_1.Commission.findAll();
        return (0, modules_1.successResponse)(res, 'success', commission);
    }
    catch (error) {
        console.log(error);
        return (0, modules_1.errorResponse)(res, 'error', 'An error occurred');
    }
});
exports.getCommissions = getCommissions;
const getCommissionById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const commission = yield Commison_1.Commission.findByPk(id);
        return (0, modules_1.successResponse)(res, 'success', commission);
    }
    catch (error) {
        console.log(error);
        return (0, modules_1.errorResponse)(res, 'error', 'An error occurred');
    }
});
exports.getCommissionById = getCommissionById;
const updateCommission = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const result = body_1.updateCommissionSchema.safeParse(req.body);
        if (!result.success) {
            return (0, modules_1.errorResponse)(res, 'error', result.error.issues[0].message);
        }
        const updated = yield Commison_1.Commission.update(result.data, {
            where: {
                id
            }
        });
        if (updated[0] === 0) {
            return (0, modules_1.errorResponse)(res, 'error', 'No commission found');
        }
        return (0, modules_1.successResponse)(res, 'success', 'Commission updated successfully');
    }
    catch (error) {
        console.log(error);
        return (0, modules_1.errorResponse)(res, 'error', 'An error occurred');
    }
});
exports.updateCommission = updateCommission;
const deleteCommission = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deleted = yield Commison_1.Commission.destroy({
            where: {
                id
            }
        });
        if (deleted === 0) {
            return (0, modules_1.errorResponse)(res, 'error', 'No commission found');
        }
        return (0, modules_1.successResponse)(res, 'success', 'Commission deleted successfully');
    }
    catch (error) {
        console.log(error);
        return (0, modules_1.errorResponse)(res, 'error', 'An error occurred');
    }
});
exports.deleteCommission = deleteCommission;
const toggleCommission = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const commission = yield Commison_1.Commission.findByPk(id);
        if (!commission) {
            return (0, modules_1.handleResponse)(res, 404, false, 'No commission found');
        }
        commission.active = !commission.active;
        yield commission.save();
        return (0, modules_1.successResponse)(res, 'success', { active: commission.active });
    }
    catch (error) {
        console.log(error);
        return (0, modules_1.errorResponse)(res, 'error', 'An error occurred');
    }
});
exports.toggleCommission = toggleCommission;
