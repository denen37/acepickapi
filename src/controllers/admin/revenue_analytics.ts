import { Request, Response } from "express";
import sequelize from '../../config/db'
import { Op, QueryTypes, fn, col, literal } from "sequelize";
import { errorResponse, successResponse } from "../../utils/modules";
import { LedgerEntry } from "../../models/LegderEntry";
import { Accounts } from "../../utils/enum";

export const getMonthlyRevenue = async (req: Request, res: Response) => {
    try {
        const results = await sequelize.query(
            `
        SELECT
            YEAR(createdAt) AS year,
            MONTH(createdAt) AS month,
            SUM(amount) AS monthly_revenue
        FROM ledger_entries
        WHERE account = 'platform_revenue'
        GROUP BY YEAR(createdAt), MONTH(createdAt)
        ORDER BY year, month;
        `,
            { type: QueryTypes.SELECT }
        );

        return successResponse(res, 'success', results);
    } catch (error) {
        console.log(error);
        return errorResponse(res, 'error', 'Internal server error');
    }
}


export const getMonthlyRevenueWithCumulative = async (req: Request, res: Response) => {
    try {
        const results = await sequelize.query(
            `
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
          `,
            { type: QueryTypes.SELECT }
        );

        return successResponse(res, 'success', results);
    } catch (error) {
        console.log(error);
        return errorResponse(res, 'error', 'Internal server error');
    }
};
// adjust path

export const getRevenueByCategory = async (req: Request, res: Response) => {
    try {
        const results = await LedgerEntry.findAll({
            attributes: [
                "category",
                [fn("SUM", col("amount")), "total_revenue"],
            ],
            where: { account: "platform_revenue" },
            group: ["category"],
            order: [[fn("SUM", col("amount")), "DESC"]],
            raw: true,
        });

        return successResponse(res, 'success', results);
    } catch (error) {
        console.log(error);
        return errorResponse(res, 'error', 'Internal server error');
    }
};


export const getMonthlyRevenueByCategory = async (req: Request, res: Response) => {
    try {
        const results = await LedgerEntry.findAll({
            attributes: [
                [fn("YEAR", col("createdAt")), "year"],
                [fn("MONTH", col("createdAt")), "month"],
                "category",
                [fn("SUM", col("amount")), "monthly_revenue"],
            ],
            where: { account: "platform_revenue" },
            group: [
                fn("YEAR", col("createdAt")),
                fn("MONTH", col("createdAt")),
                "category",
            ],
            order: [
                [literal("year"), "ASC"],
                [literal("month"), "ASC"],
                ["category", "ASC"],
            ],
            raw: true,
        });

        return successResponse(res, 'success', results);
    } catch (error) {
        console.log(error);
        return errorResponse(res, 'error', 'Internal server error');
    }
};

export const revenueOverview = async (req: Request, res: Response) => {
    try {
        const balances = await LedgerEntry.findAll({
            attributes: [
                'account',
                [
                    literal(`
            SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END) -
            SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END)
          `),
                    'balance'
                ]
            ],
            group: ['account']
        });

        return successResponse(res, 'success', balances);
    } catch (error) {
        console.log(error);
        return errorResponse(res, 'error', 'Internal server error');
    }
}


