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
exports.updateLocation = void 0;
const Models_1 = require("../models/Models");
const body_1 = require("../validation/body");
const modules_1 = require("../utils/modules");
const updateLocation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = body_1.updateLocationSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                error: "Invalid query parameters",
                issues: result.error.format(),
            });
        }
        const { userId, latitude, longitude, address, lga, state, zipcode } = result.data;
        const location = yield Models_1.Location.update({
            latitude,
            longitude,
            address,
            lga,
            state,
            zipcode
        }, {
            where: { userId }
        });
        return (0, modules_1.successResponse)(res, 'Location updated successfully', location);
    }
    catch (error) {
        console.error('Error updating location:', error);
        return (0, modules_1.errorResponse)(res, 'Error updating location', error);
    }
});
exports.updateLocation = updateLocation;
