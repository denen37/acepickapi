"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobStatusQuerySchema = void 0;
const zod_1 = require("zod");
const enum_1 = require("../enum");
exports.jobStatusQuerySchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(enum_1.JobStatus).optional(),
});
