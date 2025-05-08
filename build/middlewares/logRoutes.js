"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logRoutes = void 0;
const modules_1 = require("../utils/modules");
const logger_1 = __importDefault(require("../services/logger"));
const logRoutes = (req, res, next) => {
    let route = req.originalUrl.split('?').shift();
    route = (0, modules_1.removeEnd)(route, '/');
    (0, logger_1.default)(`${req.method} - ${route}`);
    next();
};
exports.logRoutes = logRoutes;
