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
exports.updateEducation = exports.addEducation = exports.getEducation = void 0;
const Models_1 = require("../models/Models");
const modules_1 = require("../utils/modules");
const getEducation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    try {
        const profile = yield Models_1.Profile.findOne({ where: userId });
        if (!profile) {
            return (0, modules_1.handleResponse)(res, 404, false, 'Prrofile not found');
        }
        const education = yield Models_1.Education.findAll({ where: profile.id });
        if (!education) {
            return (0, modules_1.handleResponse)(res, 404, false, 'Education not found');
        }
        return (0, modules_1.successResponse)(res, 'success', education);
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, 'error', error);
    }
});
exports.getEducation = getEducation;
const addEducation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const { school, degreeType, course, gradDate } = req.body;
    try {
        const profile = yield Models_1.Profile.findOne({ where: userId });
        if (!profile) {
            return (0, modules_1.handleResponse)(res, 404, false, 'Prrofile not found');
        }
        const education = yield Models_1.Education.create({
            school,
            degreeType,
            course,
            gradDate,
            profileId: profile.id
        });
        return (0, modules_1.successResponse)(res, 'success', education);
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, 'error', error);
    }
});
exports.addEducation = addEducation;
const updateEducation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const profile = yield Models_1.Profile.findOne({ where: userId });
    if (!profile) {
        return (0, modules_1.handleResponse)(res, 404, false, 'Prrofile not found');
    }
});
exports.updateEducation = updateEducation;
