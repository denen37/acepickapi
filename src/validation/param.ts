import { z } from "zod";
import { ProductTransactionStatus } from "../utils/enum";

export const jobIdParamSchema = z.object({
    jobId: z.string()
        .refine((val) => !isNaN(+val) && Number.isInteger(+val) && +val > 0, {
            message: "jobId must be a positive integer",
        }),
});



export const productTransactionSchema = z.object({
    status: z.enum([ProductTransactionStatus.SOLD, ProductTransactionStatus.BOUGHT]),
});


