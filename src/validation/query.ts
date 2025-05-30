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
});
