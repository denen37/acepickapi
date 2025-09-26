import { Request, Response } from 'express'
import { Op, QueryTypes } from "sequelize";
import { User } from '../../models/Models'
import sequelize from '../../config/db'
import { errorResponse, successResponse, handleResponse } from "../../utils/modules";

export const newUsersTodayCount = async (req: Request, res: Response) => {
  try {
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    const userCount = await User.count({
      where: {
        createdAt: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        },
      },
    });

    return successResponse(res, 'success', userCount);
  } catch (error) {
    console.log(error);
    return errorResponse(res, 'error', 'Internal server error');
  }
};


export const cumulativeUsersByMonth = async (req: Request, res: Response) => {
  try {
    const results = await sequelize.query(
      `
      SELECT 
          DATE_FORMAT(createdAt, '%Y-%m') AS month,
          COUNT(*) AS users_in_month,
          SUM(COUNT(*)) OVER (ORDER BY DATE_FORMAT(createdAt, '%Y-%m')) AS cumulative_users
      FROM Users
      GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
      ORDER BY month;
      `,
      { type: QueryTypes.SELECT }
    );

    // return res.json({
    //   status: true,
    //   data: results,
    // });

    return successResponse(res, 'success', results);
  } catch (error) {
    // return res.status(500).json({
    //   status: false,
    //   message: "Error fetching cumulative users",
    //   error: error instanceof Error ? error.message : error,
    // });

    console.log(error);
    return errorResponse(res, 'error', 'Internal server error')
  }
};


export const getWeeklyUserGrowth = async (req: Request, res: Response) => {
  try {
    const results = await sequelize.query(
      `
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
     `,
      { type: QueryTypes.SELECT }
    );

    return successResponse(res, 'success', results);
  } catch (error) {
    console.log(error);
    return errorResponse('error', 'Error fetching user analytics');
  }
};

export const getCurrentVsPreviousWeekGrowth = async (req: Request, res: Response) => {
  try {
    const results = await sequelize.query(
      `
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
      `,
      { type: QueryTypes.SELECT }
    );

    console.log('Current vs Previous Week Growth:', results);

    return successResponse(res, 'success', results);
  } catch (error) {
    console.log(error);
    return errorResponse(res, 'error', 'Error fetching user analytics');
  }
};


