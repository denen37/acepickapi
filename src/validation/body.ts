import { z } from "zod";
import { JobMode, OTPReason, UserRole } from "../enum"; // adjust the path
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
    smsCode: smsCodeSchema.nullable().optional(),
    emailCode: emailCodeSchema.nullable().optional(),
}).refine((data) => data.smsCode || data.emailCode, {
    message: "At least one of smsCode or emailCode must be provided",
});


export const registrationSchema = z.object({
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number is too short"),
    password: z.string().min(4, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(4, "Confirm Password is required"),
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


export const registrationProfSchema = z.object({
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number is too short"),
    password: z.string().min(4, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(4, "Confirm Password is required"),
    agreed: z.literal(true, {
        errorMap: () => ({ message: "You must agree to the terms and conditions" }),
    }),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    lga: z.string().min(1, "LGA is required"),
    state: z.string().min(1, "State is required"),
    address: z.string().min(1, "Address is required"),
    professionId: z.number().int().positive("Professional ID must be a positive integer"),
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
})
// Cooperation schema
const cooperationSchema = z.object({
    avatar: z.string().url("Invalid avatar URL"),
    nameOfOrg: z.string().min(1, "Organization name is required"),
    phone: z.string().min(10, "Organization phone is required"),
    address: z.string().min(1, "Organization address is required"),
    state: z.string().min(1, "Organization state is required"),
    lga: z.string().min(1, "Organization LGA is required"),
    regNum: z.string().min(1, "Registration number is required"),
    professionId: z.number().int().positive("Profession ID must be a positive integer"),
    noOfEmployees: z.number().int().positive("Number of employees must be a positive integer"),
    director: directorSchema,
});

// Main user registration schema
export const registerCoporateSchema = z.object({
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number is required"),
    password: z.string().min(4, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(4, "Confirm Password is required"),
    // role: z.literal("corperate", {
    //     errorMap: () => ({ message: "Role must be 'corperate'" }),
    // }),
    agreed: z.literal(true, {
        errorMap: () => ({ message: "You must agree to the terms and conditions" }),
    }),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    position: z.string().min(1, "Position is required"),
    cooperation: cooperationSchema,
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});



export const jobPostSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    address: z.string().min(1, "Address is required"),
    numOfJobs: z.number().int().positive("Number of jobs must be a positive integer").optional(),
    professionalId: z.string().uuid("Professional ID must be a valid UUID"),
    mode: z.nativeEnum(JobMode).optional(),
});

// Define the schema for a single Material
const materialSchema = z.object({
    description: z.string().min(1, "Description is required"),
    quantity: z.number().int().positive("Quantity must be a positive integer"),
    unit: z.string().max(20).optional().or(z.literal("").transform(() => undefined)),
    price: z.number().int().positive("Price must be a positive integer"),
});

const materialUpdateSchema = z.object({
    id: z.number().int().positive().optional(),
    description: z.string().min(1, "Description is required"),
    quantity: z.number().int().positive("Quantity must be a positive integer"),
    unit: z.string().max(20).optional().or(z.literal("").transform(() => undefined)),
    price: z.number().int().positive("Price must be a positive integer"),
});

// Full request body schema with optional `materials`
export const jobCostingSchema = z.object({
    jobId: z.number().int().positive("Job ID must be a positive integer"),
    durationUnit: z.string().min(1, "Duration unit is required"),
    durationValue: z.number().int().positive("Duration value must be a positive integer"),
    workmanship: z.number().int().nonnegative("Workmanship must be a non-negative integer"),
    materials: z.array(materialSchema).optional(),
});

export const jobCostingUpdateSchema = z.object({
    durationUnit: z.string().min(1, "Duration unit is required").optional(),
    durationValue: z.number().int().positive("Duration value must be a positive integer").optional(),
    workmanship: z.number().int().nonnegative("Workmanship must be a non-negative integer").optional(),
    materials: z.array(materialUpdateSchema).optional(),
});


// export const paymentSchema = z.object({
//     amount: z.number().positive("Amount must be a positive number"),
//     paidFor: z.string().min(1, "paidFor is required"),
//     pin: z.string().length(4, "PIN must be exactly 4 characters"),
//     jobId: z.number().int().positive("Job ID must be a positive integer"),
// });


export const updateLocationSchema = z.object({
    address: z.string().optional(),
    lga: z.string().optional(),
    state: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    zipcode: z.number().int().optional(),
    //userId: z.string().uuid({ message: "Invalid UUID for userId" }),
});

export const bankDetailsSchema = z.object({
    accountName: z.string().min(1, 'Account name is required'),
    bank: z.string().min(1, 'Bank is required'),
    bankCode: z.string().min(1, 'Bank code is required'),
    accountNumber: z
        .string()
        .regex(/^\d{10}$/, 'Account number must be exactly 10 digits'),
});


export const paymentSchema = z.object({
    amount: z.number().positive('Amount must be a positive number'),
    pin: z.string().regex(/^\d{4}$/, 'PIN must be exactly 4 digits'),
    reason: z.string().min(1, 'Reason is required'),
    jobId: z.number().int().positive("Job ID must be a positive integer"),
});


export const pinSchema = z
    .object({
        newPin: z.string().regex(/^\d{4}$/, 'PIN must be exactly 4 digits'),
        newPinconfirm: z.string().regex(/^\d{4}$/, 'Confirm PIN must be exactly 4 digits'),
    })
    .refine((data) => data.newPin === data.newPinconfirm, {
        message: "PINs do not match",
        path: ['newPinconfirm'], // Error will show under `newPinconfirm`
    });






