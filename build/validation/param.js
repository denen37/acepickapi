"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobIdParamSchema = void 0;
const zod_1 = require("zod");
exports.jobIdParamSchema = zod_1.z.object({
    jobId: zod_1.z.string()
        .refine((val) => !isNaN(+val) && Number.isInteger(+val) && +val > 0, {
        message: "jobId must be a positive integer",
    }),
});
