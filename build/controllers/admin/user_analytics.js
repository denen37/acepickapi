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
exports.getCurrentVsPreviousWeekGrowth = exports.getWeeklyUserGrowth = exports.cumulativeUsersByMonth = exports.newUsersTodayCount = void 0;
const sequelize_1 = require("sequelize");
const Models_1 = require("../../models/Models");
const db_1 = __importDefault(require("../../config/db"));
const modules_1 = require("../../utils/modules");
const newUsersTodayCount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        const userCount = yield Models_1.User.count({
            where: {
                createdAt: {
                    [sequelize_1.Op.gte]: startDate,
                    [sequelize_1.Op.lte]: endDate,
                },
            },
        });
        return (0, modules_1.successResponse)(res, 'success', userCount);
    }
    catch (error) {
        console.log(error);
        return (0, modules_1.errorResponse)(res, 'error', 'Internal server error');
    }
});
exports.newUsersTodayCount = newUsersTodayCount;
const cumulativeUsersByMonth = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const results = yield db_1.default.query(`
      SELECT 
          DATE_FORMAT(createdAt, '%Y-%m') AS month,
          COUNT(*) AS users_in_month,
          SUM(COUNT(*)) OVER (ORDER BY DATE_FORMAT(createdAt, '%Y-%m')) AS cumulative_users
      FROM Users
      GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
      ORDER BY month;
      `, { type: sequelize_1.QueryTypes.SELECT });
        // return res.json({
        //   status: true,
        //   data: results,
        // });
        return (0, modules_1.successResponse)(res, 'success', results);
    }
    catch (error) {
        // return res.status(500).json({
        //   status: false,
        //   message: "Error fetching cumulative users",
        //   error: error instanceof Error ? error.message : error,
        // });
        console.log(error);
        return (0, modules_1.errorResponse)(res, 'error', 'Internal server error');
    }
});
exports.cumulativeUsersByMonth = cumulativeUsersByMonth;
const getWeeklyUserGrowth = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const results = yield db_1.default.query(`
     WITH weekly_users AS (
         SELECT
             YEAR(createdAt) AS year,
             WEEK(createdAt, 1) AS week,
             COUNT(*) AS user_count
         FROM Users
         GROUP BY YEAR(createdAt), WEEK(createdAt, 1)
     ),
     weekly_growth AS (
         SELECT
             year,
             week,
             user_count,
             LAG(user_count) OVER (ORDER BY year, week) AS prev_user_count
         FROM weekly_users
     )
     SELECT
         year,
         week,
         user_count,
         prev_user_count,
         ROUND(
             CASE
                 WHEN prev_user_count = 0 OR prev_user_count IS NULL THEN NULL
                 ELSE ((user_count - prev_user_count) * 100.0 / prev_user_count)
             END, 2
         ) AS growth_rate_percent
     FROM weekly_growth
     ORDER BY year, week;
     `, { type: sequelize_1.QueryTypes.SELECT });
        return (0, modules_1.successResponse)(res, 'success', results);
    }
    catch (error) {
        console.log(error);
        return (0, modules_1.errorResponse)('error', 'Error fetching user analytics');
    }
});
exports.getWeeklyUserGrowth = getWeeklyUserGrowth;
const getCurrentVsPreviousWeekGrowth = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const results = yield db_1.default.query(`
      WITH weekly_users AS (
        SELECT
            YEAR(createdAt) AS year,
            WEEK(createdAt, 1) AS week,
            COUNT(*) AS user_count
        FROM Users
        WHERE createdAt >= DATE_SUB(CURDATE(), INTERVAL 4 WEEK)
        GROUP BY YEAR(createdAt), WEEK(createdAt, 1)
    ),
    current_week AS (
        SELECT * FROM weekly_users
        WHERE YEARWEEK(CURDATE(), 1) = (year * 100 + week)
    ),
    previous_week AS (
        SELECT * FROM weekly_users
        WHERE YEARWEEK(CURDATE() - INTERVAL 1 WEEK, 1) = (year * 100 + week)
    )
    SELECT
        COALESCE((SELECT user_count FROM current_week), 0) AS current_week_users,
        COALESCE((SELECT user_count FROM previous_week), 0) AS prev_week_users,
        ROUND(
            CASE
                WHEN COALESCE((SELECT user_count FROM previous_week), 0) = 0
                    THEN 0
                ELSE (
                    ((COALESCE((SELECT user_count FROM current_week), 0)) -
                     (COALESCE((SELECT user_count FROM previous_week), 0)))
                    * 100.0 / (COALESCE((SELECT user_count FROM previous_week), 0))
                )
            END, 2
        ) AS growth_rate_percent;
      `, { type: sequelize_1.QueryTypes.SELECT });
        console.log('Current vs Previous Week Growth:', results);
        return (0, modules_1.successResponse)(res, 'success', results);
    }
    catch (error) {
        console.log(error);
        return (0, modules_1.errorResponse)(res, 'error', 'Error fetching user analytics');
    }
});
exports.getCurrentVsPreviousWeekGrowth = getCurrentVsPreviousWeekGrowth;
