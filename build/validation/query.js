"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.professionalSearchQuerySchema = exports.jobStatusQuerySchema = void 0;
const zod_1 = require("zod");
const enum_1 = require("../enum");
exports.jobStatusQuerySchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(enum_1.JobStatus).optional(),
});
exports.professionalSearchQuerySchema = zod_1.z.object({
    profession: zod_1.z.string().optional(),
    sector: zod_1.z.string().optional(),
    span: zod_1.z.coerce.number().int().positive("Span must be a positive integer").optional(),
    state: zod_1.z.string().optional(),
    lga: zod_1.z.string().optional(),
});
