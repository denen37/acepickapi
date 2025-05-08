"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = require("../controllers/index");
const routes = (0, express_1.Router)();
routes.get('/', index_1.apiIndex);
exports.default = routes;
