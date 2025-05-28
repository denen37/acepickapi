import { z } from "zod";
import { JobStatus } from "../enum";

export const jobStatusQuerySchema = z.object({
    status: z.nativeEnum(JobStatus).optional(),
});