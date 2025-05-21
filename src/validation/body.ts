import { z } from "zod";
import { OTPReason, UserRole } from "../enum"; // adjust the path
import { VerificationType } from "../enum";


const otpBaseSchema = z.object({
    type: z.nativeEnum(VerificationType),
    reason: z.nativeEnum(OTPReason),
    email: z.string().email("Invalid email").optional(),
    phone: z.string().min(1, "Phone is required").optional(),
});

// Conditional logic based on type
export const otpRequestSchema = otpBaseSchema.superRefine((data, ctx) => {
    if ((data.type === VerificationType.EMAIL || data.type === VerificationType.BOTH) && !data.email) {
        ctx.addIssue({
            path: ["email"],
            code: z.ZodIssueCode.custom,
            message: "Email is required when type is 'email' or 'both'",
        });
    }

    if ((data.type === VerificationType.SMS || data.type === VerificationType.BOTH) && !data.phone) {
        ctx.addIssue({
            path: ["phone"],
            code: z.ZodIssueCode.custom,
            message: "Phone is required when type is 'phone' or 'both'",
        });
    }
});


const smsCodeSchema = z.object({
    phone: z.string().min(1, "Phone is required"),
    code: z.string().length(4, "Code must be exactly 4 characters"),
});

const emailCodeSchema = z.object({
    email: z.string().email("Invalid email"),
    code: z.string().length(4, "Code must be exactly 4 characters"),
});

export const verifyOTPSchema = z.object({
    smsCode: smsCodeSchema.nullable(),
    emailCode: emailCodeSchema.nullable(),
});


export const registrationSchema = z.object({
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number is too short"),
    password: z.string().min(4, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(4, "Confirm Password is required"),
    role: z.enum([UserRole.CLIENT, UserRole.PROFESSIONAL]),
    agreed: z.literal(true, {
        errorMap: () => ({ message: "You must agree to the terms and conditions" }),
    }),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    lga: z.string().min(1, "LGA is required"),
    state: z.string().min(1, "State is required"),
    address: z.string().min(1, "Address is required"),
    avatar: z.string().url("Avatar must be a valid URL").optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});



// Director schema
const directorSchema = z.object({
    firstName: z.string().min(1, "Director's first name is required"),
    lastName: z.string().min(1, "Director's last name is required"),
    email: z.string().email("Director's email is invalid"),
    phone: z.string().min(10, "Director's phone is required"),
    address: z.string().min(1, "Director's address is required"),
    state: z.string().min(1, "Director's state is required"),
    lga: z.string().min(1, "Director's LGA is required"),
});

// Cooperation schema
const cooperationSchema = z.object({
    avatar: z.string().url("Invalid avatar URL"),
    nameOfOrg: z.string().min(1, "Organization name is required"),
    phone: z.string().min(10, "Organization phone is required"),
    address: z.string().min(1, "Organization address is required"),
    state: z.string().min(1, "Organization state is required"),
    lga: z.string().min(1, "Organization LGA is required"),
    regNum: z.string().min(1, "Registration number is required"),
    noOfEmployees: z.number().int().positive("Number of employees must be a positive integer"),
    director: directorSchema,
});

// Main user registration schema
export const registerCoporateSchema = z.object({
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number is required"),
    password: z.string().min(4, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(4, "Confirm Password is required"),
    role: z.literal("corperate", {
        errorMap: () => ({ message: "Role must be 'corperate'" }),
    }),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    cooperation: cooperationSchema,
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

