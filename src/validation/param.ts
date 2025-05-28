import { z } from "zod";

export const jobIdParamSchema = z.object({
    jobId: z.string()
        .refine((val) => !isNaN(+val) && Number.isInteger(+val) && +val > 0, {
            message: "jobId must be a positive integer",
        }),
});
