"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCoporateSchema = exports.registrationSchema = exports.verifyOTPSchema = exports.otpRequestSchema = void 0;
const zod_1 = require("zod");
const enum_1 = require("../enum"); // adjust the path
const enum_2 = require("../enum");
const otpBaseSchema = zod_1.z.object({
    type: zod_1.z.nativeEnum(enum_2.VerificationType),
    reason: zod_1.z.nativeEnum(enum_1.OTPReason),
    email: zod_1.z.string().email("Invalid email").optional(),
    phone: zod_1.z.string().min(1, "Phone is required").optional(),
});
// Conditional logic based on type
exports.otpRequestSchema = otpBaseSchema.superRefine((data, ctx) => {
    if ((data.type === enum_2.VerificationType.EMAIL || data.type === enum_2.VerificationType.BOTH) && !data.email) {
        ctx.addIssue({
            path: ["email"],
            code: zod_1.z.ZodIssueCode.custom,
            message: "Email is required when type is 'email' or 'both'",
        });
    }
    if ((data.type === enum_2.VerificationType.SMS || data.type === enum_2.VerificationType.BOTH) && !data.phone) {
        ctx.addIssue({
            path: ["phone"],
            code: zod_1.z.ZodIssueCode.custom,
            message: "Phone is required when type is 'phone' or 'both'",
        });
    }
});
const smsCodeSchema = zod_1.z.object({
    phone: zod_1.z.string().min(1, "Phone is required"),
    code: zod_1.z.string().length(4, "Code must be exactly 4 characters"),
});
const emailCodeSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email"),
    code: zod_1.z.string().length(4, "Code must be exactly 4 characters"),
});
exports.verifyOTPSchema = zod_1.z.object({
    smsCode: smsCodeSchema.nullable().optional(),
    emailCode: emailCodeSchema.nullable().optional(),
}).refine((data) => data.smsCode || data.emailCode, {
    message: "At least one of smsCode or emailCode must be provided",
});
exports.registrationSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address"),
    phone: zod_1.z.string().min(10, "Phone number is too short"),
    password: zod_1.z.string().min(4, "Password must be at least 6 characters"),
    confirmPassword: zod_1.z.string().min(4, "Confirm Password is required"),
    role: zod_1.z.enum([enum_1.UserRole.CLIENT, enum_1.UserRole.PROFESSIONAL]),
    agreed: zod_1.z.literal(true, {
        errorMap: () => ({ message: "You must agree to the terms and conditions" }),
    }),
    firstName: zod_1.z.string().min(1, "First name is required"),
    lastName: zod_1.z.string().min(1, "Last name is required"),
    lga: zod_1.z.string().min(1, "LGA is required"),
    state: zod_1.z.string().min(1, "State is required"),
    address: zod_1.z.string().min(1, "Address is required"),
    avatar: zod_1.z.string().url("Avatar must be a valid URL").optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});
// Director schema
const directorSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1, "Director's first name is required"),
    lastName: zod_1.z.string().min(1, "Director's last name is required"),
    email: zod_1.z.string().email("Director's email is invalid"),
    phone: zod_1.z.string().min(10, "Director's phone is required"),
    address: zod_1.z.string().min(1, "Director's address is required"),
    state: zod_1.z.string().min(1, "Director's state is required"),
    lga: zod_1.z.string().min(1, "Director's LGA is required"),
});
// Cooperation schema
const cooperationSchema = zod_1.z.object({
    avatar: zod_1.z.string().url("Invalid avatar URL"),
    nameOfOrg: zod_1.z.string().min(1, "Organization name is required"),
    phone: zod_1.z.string().min(10, "Organization phone is required"),
    address: zod_1.z.string().min(1, "Organization address is required"),
    state: zod_1.z.string().min(1, "Organization state is required"),
    lga: zod_1.z.string().min(1, "Organization LGA is required"),
    regNum: zod_1.z.string().min(1, "Registration number is required"),
    noOfEmployees: zod_1.z.number().int().positive("Number of employees must be a positive integer"),
    director: directorSchema,
});
// Main user registration schema
exports.registerCoporateSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address"),
    phone: zod_1.z.string().min(10, "Phone number is required"),
    password: zod_1.z.string().min(4, "Password must be at least 6 characters"),
    confirmPassword: zod_1.z.string().min(4, "Confirm Password is required"),
    role: zod_1.z.literal("corperate", {
        errorMap: () => ({ message: "Role must be 'corperate'" }),
    }),
    agreed: zod_1.z.literal(true, {
        errorMap: () => ({ message: "You must agree to the terms and conditions" }),
    }),
    firstName: zod_1.z.string().min(1, "First name is required"),
    lastName: zod_1.z.string().min(1, "Last name is required"),
    cooperation: cooperationSchema,
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});
