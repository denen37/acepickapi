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
exports.getSectors = void 0;
const Models_1 = require("../models/Models");
const modules_1 = require("../utils/modules");
const getSectors = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const sectors = yield Models_1.Sector.findAll();
    for (const sector of sectors) {
        const numOfProf = yield Models_1.Professional.count({
            include: [
                {
                    model: Models_1.Profession,
                    as: "profession",
                    where: {
                        sectorId: sector.id,
                    },
                    // include: [
                    //   {
                    //     model: Sector,
                    //     as: "sector",
                    //   },
                    // ],
                },
            ],
        });
        const numOfJobs = yield Models_1.Job.count({
            include: [
                {
                    model: Models_1.User,
                    as: "professional",
                    required: true,
                    include: [
                        {
                            model: Models_1.Profile,
                            as: "profile",
                            required: true,
                            include: [
                                {
                                    model: Models_1.Professional,
                                    as: "professional",
                                    required: true,
                                    include: [
                                        {
                                            model: Models_1.Profession,
                                            as: "profession",
                                            required: true,
                                            where: {
                                                sectorId: sector.id,
                                            },
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        });
        sector.setDataValue('numOfProf', numOfProf);
        sector.setDataValue('numOfJobs', numOfJobs);
    }
    return (0, modules_1.successResponse)(res, 'success', sectors);
});
exports.getSectors = getSectors;
