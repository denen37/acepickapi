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
exports.deleteProfession = exports.updateProfession = exports.createProfession = exports.getProfessionById = exports.getProfessions = void 0;
const Profession_1 = require("../models/Profession");
const modules_1 = require("../utils/modules");
const Sector_1 = require("../models/Sector");
const getProfessions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { sector_id, order_by } = req.query;
    // Parse sector_id safely
    const sectorId = sector_id ? parseInt(sector_id, 10) : undefined;
    // Prepare where condition
    const whereCondition = sectorId ? { sectorId } : {};
    // Prepare order parameters safely
    let orderParams = undefined;
    if (order_by) {
        const parts = order_by.split("-");
        if (parts.length === 2) {
            const column = parts[0];
            const direction = parts[1].toUpperCase() === "DESC" ? "DESC" : "ASC";
            orderParams = [column, direction];
        }
    }
    try {
        const professions = yield Profession_1.Profession.findAll({
            where: whereCondition,
            order: orderParams ? [orderParams] : undefined, // Sequelize expects an array of arrays
        });
        return (0, modules_1.successResponse)(res, "success", professions);
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, "error", error);
    }
});
exports.getProfessions = getProfessions;
const getProfessionById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { id } = req.params;
    try {
        let professions = yield Profession_1.Profession.findOne({
            where: { id },
            include: [
                {
                    model: Sector_1.Sector,
                }
            ]
        });
        return (0, modules_1.successResponse)(res, "success", professions);
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, "error", error);
    }
});
exports.getProfessionById = getProfessionById;
const createProfession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { title, image, sectorId } = req.body;
    if (!title || !sectorId) {
        return (0, modules_1.handleResponse)(res, 400, false, "Please provide all required fields");
    }
    try {
        const sector = yield Sector_1.Sector.findOne({ where: { id: sectorId } });
        if (!sector) {
            return (0, modules_1.handleResponse)(res, 400, false, "Invalid sector id");
        }
        let profession = yield Profession_1.Profession.create({ title, image, sectorId });
        return (0, modules_1.successResponse)(res, "success", profession);
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, "error", error);
    }
});
exports.createProfession = createProfession;
const updateProfession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { id } = req.params;
    if (!req.body) {
        return (0, modules_1.handleResponse)(res, 400, false, "Please provide at least on changed field");
    }
    try {
        let prof = yield Profession_1.Profession.update(req.body, { where: { id: id } });
        return (0, modules_1.successResponse)(res, "success", prof);
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, "error", error);
    }
});
exports.updateProfession = updateProfession;
const deleteProfession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { id } = req.params;
    try {
        let prof = yield Profession_1.Profession.destroy({ where: { id: id } });
        return (0, modules_1.successResponse)(res, "success", 'Profession deleted');
    }
    catch (error) {
        return (0, modules_1.errorResponse)(res, "error", error);
    }
});
exports.deleteProfession = deleteProfession;
