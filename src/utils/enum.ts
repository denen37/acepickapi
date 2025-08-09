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
    CORPERATE = 'corperate',
    DELIVERY = 'delivery',
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


export enum JobMode {
    VIRTUAL = "VIRTUAL",
    PHYSICAL = "PHYSICAL"
}


export enum PayStatus {
    UNPAID = 'unpaid',
    PAID = 'paid',
    //PARTIALLY_PAID = 'partially_paid',
    REFUNDED = 'refunded',
    RELEASED = 'released',
}

export enum JobStatus {
    COMPLETED = 'COMPLETED',
    APPROVED = 'APPROVED',
    DISPUTED = 'DISPUTED',
    PENDING = 'PENDING',
    DECLINED = 'DECLINED',
    ONGOING = "ONGOING",
    CANCELLED = "CANCELLED",
    REJECTED = "REJECTED",
}


export enum PaidFor {
    WORKMANSHIP = 'workmanship',
    MATERIAL = 'material',
    BOTH = 'both'
}

export enum TransactionStatus {
    SUCCESS = 'success',
    FAILED = 'failed',
    PENDING = 'pending',
}

export enum TransactionType {
    DEBIT = 'debit',
    CREDIT = 'credit'
}

export enum TransferStatus {
    SUCCESS = 'success',
    FAILED = 'failed',
    PENDING = 'pending'
}

export enum ProductStatus {
    SOLD = 'sold',
    BOUGHT = 'bought'
}


export enum ProductTransactionStatus {
    PENDING = 'pending',
    ORDERED = 'ordered',
    DELIVERED = 'delivered',
}

export enum OrderMethod {
    SELF_PICKUP = "self_pickup",
    DELIVERY = "delivery",
}

export enum OrderStatus {
    PENDING = 'pending',
    PAID = 'paid',
    ACCEPTED = 'accepted',
    PICKED_UP = 'picked_up',
    CONFIRM_PICKUP = 'confirm_pickup',
    IN_TRANSIT = 'in_transit',
    DELIVERED = 'delivered',
    CONFIRM_DELIVERY = 'confirm_delivery',
    CANCELLED = 'cancelled',
}

export enum TransactionDescription {
    JOB_PAYMENT = 'job payment',
    PRODUCT_PAYMENT = 'product payment',
    PRODUCT_ORDER_PAYMENT = 'product_order payment',
    WALLET_TOPUP = 'wallet topup'
}

export enum VehicleType {
    CAR = 'car',
    BIKE = 'bike',
    BUS = 'bus',
    TRUCK = 'truck',
    KEKE = 'keke'
}

export enum RiderStatus {
    BUSY = 'busy',
    AVAILABLE = 'available',
    SUSPENDED = 'suspended',
    INACTIVE = 'inactive',
}