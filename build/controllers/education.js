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
exports.deleteEducation = exports.updateEducation = exports.addEducation = exports.getEducation = void 0;
const Models_1 = require("../models/Models");
const modules_1 = require("../utils/modules");
const body_1 = require("../validation/body");
const getEducation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    try {
        const profile = yield Models_1.Profile.findOne({ where: userId });
        if (!profile) {
            return (0, modules_1.handleResponse)(res, 404, false, 'Profile not found');
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
    const result = body_1.educationSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            status: false,
            message: 'Validation error',
            errors: result.error.flatten().fieldErrors,
        });
    }
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
    const { id } = req.params;
    const { userId } = req.user;
    try {
        const result = body_1.updateEducationSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                status: false,
                message: 'Validation error',
                errors: result.error.flatten().fieldErrors,
            });
        }
        const updated = yield Models_1.Education.update(result.data, {
            where: {
                id: id,
            }
        });
        return (0, modules_1.successResponse)(res, 'success', updated);
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, 'error', error.message || error);
    }
});
exports.updateEducation = updateEducation;
const deleteEducation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const { id } = req.params;
    try {
        const deleted = yield Models_1.Education.destroy({
            where: {
                id,
            }
        });
        return (0, modules_1.successResponse)(res, 'success', deleted);
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, 'error', error.message || error);
    }
});
exports.deleteEducation = deleteEducation;
