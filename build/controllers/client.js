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
exports.getClient = void 0;
const Models_1 = require("../models/Models");
const modules_1 = require("../utils/modules");
const enum_1 = require("../enum");
const getClient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { id } = req.params;
    // try {
    const client = yield Models_1.User.findOne({
        where: { id: id, role: enum_1.UserRole.CLIENT },
        attributes: {
            exclude: ['password', 'fcmToken']
        },
        include: [
            {
                model: Models_1.Profile,
            }, {
                model: Models_1.Location
            }
        ]
    });
    if (!client) {
        return (0, modules_1.handleResponse)(res, 404, false, 'Client not found');
    }
    return (0, modules_1.successResponse)(res, 'success', client);
    // } catch (error) {
    //     return errorResponse(res, 'error', error);
    // }
});
exports.getClient = getClient;
