"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsersQuerySchema = exports.getOrdersSchema = exports.boughtProductSchema = exports.getProductSchema = exports.professionalSearchQuerySchema = exports.jobStatusQuerySchema = void 0;
const zod_1 = require("zod");
const enum_1 = require("../utils/enum");
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
exports.getProductSchema = zod_1.z.object({
    categoryId: zod_1.z.coerce.number().optional(),
    locationId: zod_1.z.coerce.number().optional(),
    category: zod_1.z.string().optional(),
    state: zod_1.z.string().optional(),
    lga: zod_1.z.string().optional(),
    search: zod_1.z.string().optional(),
    page: zod_1.z.coerce.number().min(1).default(1),
    limit: zod_1.z.coerce.number().min(1).default(10),
});
exports.boughtProductSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(enum_1.ProductTransactionStatus).optional(),
});
exports.getOrdersSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(enum_1.OrderStatus).optional(),
    page: zod_1.z.coerce.number().min(1).default(1),
    limit: zod_1.z.coerce.number().min(1).default(10)
});
exports.getUsersQuerySchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    professionId: zod_1.z.coerce.number().optional(),
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().default(10),
    role: zod_1.z.nativeEnum(enum_1.UserRole).optional(),
});
