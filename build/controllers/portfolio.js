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
exports.deletePortfolio = exports.updatePortfolio = exports.addPortfolio = exports.getPortfolios = void 0;
const Models_1 = require("../models/Models");
const modules_1 = require("../utils/modules");
const body_1 = require("../validation/body");
const getPortfolios = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    try {
        const profile = yield Models_1.Profile.findOne({ where: { userId } });
        if (!profile) {
            return (0, modules_1.handleResponse)(res, 404, false, 'Profile not found');
        }
        const portfolios = yield Models_1.Portfolio.findAll({
            where: { profileId: profile.id },
            order: [['createdAt', 'DESC']],
        });
        return (0, modules_1.successResponse)(res, 'success', portfolios);
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, 'error', error);
    }
});
exports.getPortfolios = getPortfolios;
const addPortfolio = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const result = body_1.portfolioSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            status: false,
            message: 'Validation error',
            errors: result.error.flatten().fieldErrors,
        });
    }
    const { title, description, duration, date, file } = result.data;
    try {
        const profile = yield Models_1.Profile.findOne({ where: { userId } });
        if (!profile) {
            return (0, modules_1.handleResponse)(res, 404, false, 'Profile not found');
        }
        const portfolio = yield Models_1.Portfolio.create({
            title,
            description,
            duration,
            date,
            file,
            profileId: profile.id
        });
        return (0, modules_1.successResponse)(res, 'success', portfolio);
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, 'error', error);
    }
});
exports.addPortfolio = addPortfolio;
const updatePortfolio = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { userId } = req.user;
    const result = body_1.updatePortfolioSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            status: false,
            message: 'Validation error',
            errors: result.error.flatten().fieldErrors,
        });
    }
    try {
        const updated = yield Models_1.Portfolio.update(result.data, {
            where: { id }
        });
        return (0, modules_1.successResponse)(res, 'success', updated);
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, 'error', error);
    }
});
exports.updatePortfolio = updatePortfolio;
const deletePortfolio = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        yield Models_1.Portfolio.destroy({
            where: { id }
        });
        return (0, modules_1.successResponse)(res, 'success', { message: 'Portfolio deleted successfully' });
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, 'error', error);
    }
});
exports.deletePortfolio = deletePortfolio;
