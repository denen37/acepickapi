import rateLimit from "express-rate-limit";

export const otpLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 3,
    message: { success: false, message: "Too many OTP requests. Try again later." },
    headers: true
});

