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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketAuthorize = exports.isAuthorized = void 0;
const configSetup_1 = __importDefault(require("../config/configSetup"));
const modules_1 = require("../utils/modules");
const jsonwebtoken_1 = require("jsonwebtoken");
// const TOKEN_SECRET = "222hwhdhnnjduru838272@@$henncndbdhsjj333n33brnfn";
const isAuthorized = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    //this is the url without query params
    let route = req.originalUrl.split('?').shift();
    route = (0, modules_1.removeEnd)(route, '/');
    let publicRoutes = configSetup_1.default.PUBLIC_ROUTES;
    let isPublicRoute = publicRoutes.includes(route);
    if (isPublicRoute)
        return next();
    let token = req.headers.authorization;
    if (!token)
        return (0, modules_1.handleResponse)(res, 401, false, `Access Denied / Unauthorized request`);
    token = token.split(' ')[1];
    if (token === 'null' || !token)
        return (0, modules_1.handleResponse)(res, 401, false, `Unauthorized request`);
    let verified = (0, jsonwebtoken_1.verify)(token, configSetup_1.default.TOKEN_SECRET);
    if (!verified)
        return (0, modules_1.handleResponse)(res, 401, false, `Unauthorized request`);
    if (verified.admin === true) {
        req.admin = verified;
    }
    else {
        req.user = verified;
    }
    next();
});
exports.isAuthorized = isAuthorized;
const socketAuthorize = (socket, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = socket.handshake.auth) === null || _a === void 0 ? void 0 : _a.token;
    if (!token) {
        return next(new Error('Unauthorized'));
    }
    try {
        const decoded = (0, jsonwebtoken_1.verify)(token, configSetup_1.default.TOKEN_SECRET);
        socket.user = decoded;
        next();
    }
    catch (error) {
        next(new Error('Unauthorized'));
    }
});
exports.socketAuthorize = socketAuthorize;
