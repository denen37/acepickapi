"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sector_1 = require("../controllers/sector");
const routes = (0, express_1.Router)();
routes.get("/sectors", sector_1.getSectors);
exports.default = routes;
