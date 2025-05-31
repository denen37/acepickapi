import { z } from "zod";
import { JobStatus } from "../enum";

export const jobStatusQuerySchema = z.object({
    status: z.nativeEnum(JobStatus).optional(),
});


export const professionalSearchQuerySchema = z.object({
    profession: z.string().optional(),
    sector: z.string().optional(),
    span: z.coerce.number().int().positive("Span must be a positive integer").optional(),
    state: z.string().optional(),
    lga: z.string().optional(),
    rating: z.coerce.number().int().min(0).max(5).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    sortBy: z.enum(['rating', 'chargeFrom', 'available']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
});
