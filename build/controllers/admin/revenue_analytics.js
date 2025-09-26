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
exports.getMonthlyRevenueByCategory = exports.getRevenueByCategory = exports.getMonthlyRevenueWithCumulative = exports.getMonthlyRevenue = void 0;
const db_1 = __importDefault(require("../../config/db"));
const sequelize_1 = require("sequelize");
const modules_1 = require("../../utils/modules");
const LegderEntry_1 = require("../../models/LegderEntry");
const getMonthlyRevenue = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const results = yield db_1.default.query(`
        SELECT
            YEAR(createdAt) AS year,
            MONTH(createdAt) AS month,
            SUM(amount) AS monthly_revenue
        FROM ledger_entries
        WHERE account = 'platform_revenue'
        GROUP BY YEAR(createdAt), MONTH(createdAt)
        ORDER BY year, month;
        `, { type: sequelize_1.QueryTypes.SELECT });
        return (0, modules_1.successResponse)(res, 'success', results);
    }
    catch (error) {
        console.log(error);
        return (0, modules_1.errorResponse)(res, 'error', 'Internal server error');
    }
});
exports.getMonthlyRevenue = getMonthlyRevenue;
const getMonthlyRevenueWithCumulative = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const results = yield db_1.default.query(`
          SELECT
              YEAR(createdAt) AS year,
              MONTH(createdAt) AS month,
              SUM(amount) AS monthly_revenue,
              SUM(SUM(amount)) OVER (
                  ORDER BY YEAR(createdAt), MONTH(createdAt)
              ) AS cumulative_revenue
          FROM ledger_entries
          WHERE account = 'platform_revenue'
          GROUP BY YEAR(createdAt), MONTH(createdAt)
          ORDER BY year, month;
          `, { type: sequelize_1.QueryTypes.SELECT });
        return (0, modules_1.successResponse)(res, 'success', results);
    }
    catch (error) {
        console.log(error);
        return (0, modules_1.errorResponse)(res, 'error', 'Internal server error');
    }
});
exports.getMonthlyRevenueWithCumulative = getMonthlyRevenueWithCumulative;
// adjust path
const getRevenueByCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const results = yield LegderEntry_1.LedgerEntry.findAll({
            attributes: [
                "category",
                [(0, sequelize_1.fn)("SUM", (0, sequelize_1.col)("amount")), "total_revenue"],
            ],
            where: { account: "platform_revenue" },
            group: ["category"],
            order: [[(0, sequelize_1.fn)("SUM", (0, sequelize_1.col)("amount")), "DESC"]],
            raw: true,
        });
        return (0, modules_1.successResponse)(res, 'success', results);
    }
    catch (error) {
        console.log(error);
        return (0, modules_1.errorResponse)(res, 'error', 'Internal server error');
    }
});
exports.getRevenueByCategory = getRevenueByCategory;
const getMonthlyRevenueByCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const results = yield LegderEntry_1.LedgerEntry.findAll({
            attributes: [
                [(0, sequelize_1.fn)("YEAR", (0, sequelize_1.col)("createdAt")), "year"],
                [(0, sequelize_1.fn)("MONTH", (0, sequelize_1.col)("createdAt")), "month"],
                "category",
                [(0, sequelize_1.fn)("SUM", (0, sequelize_1.col)("amount")), "monthly_revenue"],
            ],
            where: { account: "platform_revenue" },
            group: [
                (0, sequelize_1.fn)("YEAR", (0, sequelize_1.col)("createdAt")),
                (0, sequelize_1.fn)("MONTH", (0, sequelize_1.col)("createdAt")),
                "category",
            ],
            order: [
                [(0, sequelize_1.literal)("year"), "ASC"],
                [(0, sequelize_1.literal)("month"), "ASC"],
                ["category", "ASC"],
            ],
            raw: true,
        });
        return (0, modules_1.successResponse)(res, 'success', results);
    }
    catch (error) {
        console.log(error);
        return (0, modules_1.errorResponse)(res, 'error', 'Internal server error');
    }
});
exports.getMonthlyRevenueByCategory = getMonthlyRevenueByCategory;
