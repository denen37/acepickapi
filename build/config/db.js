"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const sequelize_typescript_1 = require("sequelize-typescript");
const configSetup_1 = __importDefault(require("../config/configSetup"));
const Models = __importStar(require("../models/Models"));
const env = process.env.NODE_ENV || "development";
// const sequelize = new Sequelize(
//     config.DB_NAME || 'test',
//     config.DB_USER || 'root',
//     config.DB_PASSWORD,
//     {
//         host: config.DB_HOST,
//         dialect: 'mysql',
//         dialectOptions: {
//             ssl: false,
//         },
//         logging: false,
//         models: [...Object.values(Model)],
//     }
// );
const sequelize = new sequelize_typescript_1.Sequelize({
    dialect: 'mssql',
    host: configSetup_1.default.DB_HOST,
    port: configSetup_1.default.DB_PORT,
    username: configSetup_1.default.DB_USER,
    password: configSetup_1.default.DB_PASSWORD,
    database: configSetup_1.default.DB_NAME,
    models: Object.values(Models),
    dialectOptions: {
        options: {
            encrypt: true,
            trustServerCertificate: false,
        },
    },
});
const MAX_RETRIES = 5;
const RETRY_DELAY = 5000;
function connectWithRetry() {
    return __awaiter(this, arguments, void 0, function* (attempt = 1) {
        try {
            yield sequelize.authenticate();
            console.log("✅ Connected to MySQL database!");
        }
        catch (error) {
            console.error(`❌ Database connection failed (Attempt ${attempt}/${MAX_RETRIES}):`, error.message);
            if (attempt < MAX_RETRIES) {
                console.log(`🔄 Retrying in ${RETRY_DELAY / 1000} seconds...`);
                setTimeout(() => connectWithRetry(attempt + 1), RETRY_DELAY);
            }
            else {
                console.error("🚨 Max retries reached. Exiting...");
                process.exit(1);
            }
        }
    });
}
connectWithRetry();
exports.default = sequelize;
