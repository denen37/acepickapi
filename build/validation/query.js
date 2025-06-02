"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.professionalSearchQuerySchema = exports.jobStatusQuerySchema = void 0;
const zod_1 = require("zod");
const enum_1 = require("../enum");
exports.jobStatusQuerySchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(enum_1.JobStatus).optional(),
});
exports.professionalSearchQuerySchema = zod_1.z.object({
    professionId: zod_1.z.coerce.number().int().positive("Profession ID must be a positive integer").optional(),
    profession: zod_1.z.string().optional(),
    sector: zod_1.z.string().optional(),
    span: zod_1.z.coerce.number().int().positive("Span must be a positive integer").optional(),
    state: zod_1.z.string().optional(),
    lga: zod_1.z.string().optional(),
    rating: zod_1.z.coerce.number().int().min(0).max(5).optional(),
    chargeFrom: zod_1.z.coerce.number().int().min(0).optional(),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(10),
    // sortBy: z.enum(['rating', 'chargeFrom', 'available']).optional(),
    // sortOrder: z.enum(['asc', 'desc']).optional(),
});
