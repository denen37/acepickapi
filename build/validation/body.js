"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLocationSchema = exports.paymentSchema = exports.jobCostingUpdateSchema = exports.jobCostingSchema = exports.jobPostSchema = exports.registerCoporateSchema = exports.registrationProfSchema = exports.registrationSchema = exports.verifyOTPSchema = exports.otpRequestSchema = void 0;
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
exports.registrationProfSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address"),
    phone: zod_1.z.string().min(10, "Phone number is too short"),
    password: zod_1.z.string().min(4, "Password must be at least 6 characters"),
    confirmPassword: zod_1.z.string().min(4, "Confirm Password is required"),
    agreed: zod_1.z.literal(true, {
        errorMap: () => ({ message: "You must agree to the terms and conditions" }),
    }),
    firstName: zod_1.z.string().min(1, "First name is required"),
    lastName: zod_1.z.string().min(1, "Last name is required"),
    lga: zod_1.z.string().min(1, "LGA is required"),
    state: zod_1.z.string().min(1, "State is required"),
    address: zod_1.z.string().min(1, "Address is required"),
    professionId: zod_1.z.number().int().positive("Professional ID must be a positive integer"),
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
    professionId: zod_1.z.number().int().positive("Profession ID must be a positive integer"),
    noOfEmployees: zod_1.z.number().int().positive("Number of employees must be a positive integer"),
    director: directorSchema,
});
// Main user registration schema
exports.registerCoporateSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address"),
    phone: zod_1.z.string().min(10, "Phone number is required"),
    password: zod_1.z.string().min(4, "Password must be at least 6 characters"),
    confirmPassword: zod_1.z.string().min(4, "Confirm Password is required"),
    // role: z.literal("corperate", {
    //     errorMap: () => ({ message: "Role must be 'corperate'" }),
    // }),
    agreed: zod_1.z.literal(true, {
        errorMap: () => ({ message: "You must agree to the terms and conditions" }),
    }),
    firstName: zod_1.z.string().min(1, "First name is required"),
    lastName: zod_1.z.string().min(1, "Last name is required"),
    position: zod_1.z.string().min(1, "Position is required"),
    cooperation: cooperationSchema,
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});
exports.jobPostSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, "Title is required"),
    description: zod_1.z.string().min(1, "Description is required"),
    address: zod_1.z.string().min(1, "Address is required"),
    numOfJobs: zod_1.z.number().int().positive("Number of jobs must be a positive integer").optional(),
    professionalId: zod_1.z.string().uuid("Professional ID must be a valid UUID"),
    mode: zod_1.z.nativeEnum(enum_1.JobMode).optional(),
});
// Define the schema for a single Material
const materialSchema = zod_1.z.object({
    description: zod_1.z.string().min(1, "Description is required"),
    quantity: zod_1.z.number().int().positive("Quantity must be a positive integer"),
    unit: zod_1.z.string().max(20).optional().or(zod_1.z.literal("").transform(() => undefined)),
    price: zod_1.z.number().int().positive("Price must be a positive integer"),
});
const materialUpdateSchema = zod_1.z.object({
    id: zod_1.z.number().int().positive().optional(),
    description: zod_1.z.string().min(1, "Description is required"),
    quantity: zod_1.z.number().int().positive("Quantity must be a positive integer"),
    unit: zod_1.z.string().max(20).optional().or(zod_1.z.literal("").transform(() => undefined)),
    price: zod_1.z.number().int().positive("Price must be a positive integer"),
});
// Full request body schema with optional `materials`
exports.jobCostingSchema = zod_1.z.object({
    jobId: zod_1.z.number().int().positive("Job ID must be a positive integer"),
    durationUnit: zod_1.z.string().min(1, "Duration unit is required"),
    durationValue: zod_1.z.number().int().positive("Duration value must be a positive integer"),
    workmanship: zod_1.z.number().int().nonnegative("Workmanship must be a non-negative integer"),
    materials: zod_1.z.array(materialSchema).optional(),
});
exports.jobCostingUpdateSchema = zod_1.z.object({
    durationUnit: zod_1.z.string().min(1, "Duration unit is required").optional(),
    durationValue: zod_1.z.number().int().positive("Duration value must be a positive integer").optional(),
    workmanship: zod_1.z.number().int().nonnegative("Workmanship must be a non-negative integer").optional(),
    materials: zod_1.z.array(materialUpdateSchema).optional(),
});
exports.paymentSchema = zod_1.z.object({
    amount: zod_1.z.number().positive("Amount must be a positive number"),
    paidFor: zod_1.z.string().min(1, "paidFor is required"),
    pin: zod_1.z.string().length(4, "PIN must be exactly 4 characters"),
    jobId: zod_1.z.number().int().positive("Job ID must be a positive integer"),
});
exports.updateLocationSchema = zod_1.z.object({
    address: zod_1.z.string().optional(),
    lga: zod_1.z.string().optional(),
    state: zod_1.z.string().optional(),
    latitude: zod_1.z.number().optional(),
    longitude: zod_1.z.number().optional(),
    zipcode: zod_1.z.number().int().optional(),
    //userId: z.string().uuid({ message: "Invalid UUID for userId" }),
});
