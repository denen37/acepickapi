import { Op } from "sequelize";
import { Commission } from "../models/Commison";
import { CommissionType } from "../utils/enum";

export class CommissionService {
    static async calculateCommission(amount: number, type: string) {
        try {
            const commission = await Commission.findOne({
                where: {
                    active: true,
                    type: {
                        [Op.in]: ['all', type],
                    },
                    [Op.and]: [
                        {
                            [Op.or]: [
                                { effectiveFrom: { [Op.lte]: new Date() } },
                                { effectiveFrom: null },
                            ],
                        },
                        {
                            [Op.or]: [
                                { effectiveTo: { [Op.gte]: new Date() } },
                                { effectiveTo: null },
                            ],
                        },
                    ],
                    minAmount: {
                        [Op.lte]: amount,
                    },
                }

            })

            if (!commission) {
                return 0
            }

            if (commission.type === CommissionType.PERCENTAGE) {
                return amount * commission.rate
            }

            return commission.fixedAmount
        } catch (error) {
            console.log(error)
            return 0
        }

    }
}