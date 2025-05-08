"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const configSetup_1 = __importDefault(require("./configSetup"));
module.exports = {
    development: {
        username: configSetup_1.default.DB_USER,
        password: configSetup_1.default.DB_PASSWORD,
        database: configSetup_1.default.DB_NAME,
        host: configSetup_1.default.DB_HOST || "127.0.0.1",
        dialect: configSetup_1.default.DB_DIALECT || "mysql"
    },
    test: {
        username: configSetup_1.default.DB_USER,
        password: configSetup_1.default.DB_PASSWORD,
        database: configSetup_1.default.DB_NAME,
        host: configSetup_1.default.DB_HOST || "127.0.0.1",
        dialect: configSetup_1.default.DB_DIALECT || "mysql"
    },
    production: {
        username: configSetup_1.default.DB_USER,
        password: configSetup_1.default.DB_PASSWORD,
        database: configSetup_1.default.DB_NAME,
        host: configSetup_1.default.DB_HOST || "127.0.0.1",
        dialect: configSetup_1.default.DB_DIALECT || "mysql"
    }
};
