"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productTransactionSchema = exports.jobIdParamSchema = void 0;
const zod_1 = require("zod");
const enum_1 = require("../utils/enum");
exports.jobIdParamSchema = zod_1.z.object({
    jobId: zod_1.z.string()
        .refine((val) => !isNaN(+val) && Number.isInteger(+val) && +val > 0, {
        message: "jobId must be a positive integer",
    }),
});
exports.productTransactionSchema = zod_1.z.object({
    status: zod_1.z.enum([enum_1.ProductTransactionStatus.SOLD, enum_1.ProductTransactionStatus.BOUGHT]),
});
