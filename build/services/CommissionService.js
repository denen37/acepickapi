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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommissionService = void 0;
const sequelize_1 = require("sequelize");
const Commison_1 = require("../models/Commison");
const enum_1 = require("../utils/enum");
class CommissionService {
    static calculateCommission(amount, type) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const commission = yield Commison_1.Commission.findOne({
                    where: {
                        active: true,
                        type: {
                            [sequelize_1.Op.in]: ['all', type],
                        },
                        [sequelize_1.Op.and]: [
                            {
                                [sequelize_1.Op.or]: [
                                    { effectiveFrom: { [sequelize_1.Op.lte]: new Date() } },
                                    { effectiveFrom: null },
                                ],
                            },
                            {
                                [sequelize_1.Op.or]: [
                                    { effectiveTo: { [sequelize_1.Op.gte]: new Date() } },
                                    { effectiveTo: null },
                                ],
                            },
                        ],
                        minAmount: {
                            [sequelize_1.Op.lte]: amount,
                        },
                    }
                });
                if (!commission) {
                    return 0;
                }
                if (commission.type === enum_1.CommissionType.PERCENTAGE) {
                    return amount * commission.rate;
                }
                return commission.fixedAmount;
            }
            catch (error) {
                console.log(error);
                return 0;
            }
        });
    }
}
exports.CommissionService = CommissionService;
