export enum OTPReason {
    VERIFICATION = 'verification',
    FORGOT_PASSWORD = 'forgot_password'
}


export enum VerificationType {
    EMAIL = 'EMAIL',
    SMS = 'SMS',
    BOTH = 'BOTH',
    // RESET = 'RESET',
}

export enum UserRole {
    PROFESSIONAL = 'professional',
    CLIENT = 'client',
    CORPERATE = 'corperate'
}


export enum UserStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    SUSPENDED = 'SUSPENDED',
}


export enum UserState {
    STEP_ONE = 'STEP_ONE',
    STEP_TWO = 'STEP_TWO',
    STEP_THREE = 'STEP_THREE',
    VERIFIED = 'VERIFIED',
}
