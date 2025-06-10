"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransferStatus = exports.TransactionType = exports.TransactionStatus = exports.PaidFor = exports.JobStatus = exports.PayStatus = exports.JobMode = exports.UserState = exports.UserStatus = exports.UserRole = exports.VerificationType = exports.OTPReason = void 0;
var OTPReason;
(function (OTPReason) {
    OTPReason["VERIFICATION"] = "verification";
    OTPReason["FORGOT_PASSWORD"] = "forgot_password";
})(OTPReason || (exports.OTPReason = OTPReason = {}));
var VerificationType;
(function (VerificationType) {
    VerificationType["EMAIL"] = "EMAIL";
    VerificationType["SMS"] = "SMS";
    VerificationType["BOTH"] = "BOTH";
    // RESET = 'RESET',
})(VerificationType || (exports.VerificationType = VerificationType = {}));
var UserRole;
(function (UserRole) {
    UserRole["PROFESSIONAL"] = "professional";
    UserRole["CLIENT"] = "client";
    UserRole["CORPERATE"] = "corperate";
})(UserRole || (exports.UserRole = UserRole = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "ACTIVE";
    UserStatus["INACTIVE"] = "INACTIVE";
    UserStatus["SUSPENDED"] = "SUSPENDED";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
var UserState;
(function (UserState) {
    UserState["STEP_ONE"] = "STEP_ONE";
    UserState["STEP_TWO"] = "STEP_TWO";
    UserState["STEP_THREE"] = "STEP_THREE";
    UserState["VERIFIED"] = "VERIFIED";
})(UserState || (exports.UserState = UserState = {}));
var JobMode;
(function (JobMode) {
    JobMode["VIRTUAL"] = "VIRTUAL";
    JobMode["PHYSICAL"] = "PHYSICAL";
})(JobMode || (exports.JobMode = JobMode = {}));
var PayStatus;
(function (PayStatus) {
    PayStatus["UNPAID"] = "unpaid";
    PayStatus["PAID"] = "paid";
    PayStatus["PARTIALLY_PAID"] = "partially_paid";
    PayStatus["REFUNDED"] = "refunded";
    PayStatus["RELEASED"] = "released";
})(PayStatus || (exports.PayStatus = PayStatus = {}));
var JobStatus;
(function (JobStatus) {
    JobStatus["COMPLETED"] = "COMPLETED";
    JobStatus["APPROVED"] = "APPROVED";
    JobStatus["DISPUTED"] = "DISPUTED";
    JobStatus["PENDING"] = "PENDING";
    JobStatus["DECLINED"] = "DECLINED";
    JobStatus["ONGOING"] = "ONGOING";
    JobStatus["CANCEL"] = "CANCEL";
    JobStatus["REJECTED"] = "REJECTED";
})(JobStatus || (exports.JobStatus = JobStatus = {}));
var PaidFor;
(function (PaidFor) {
    PaidFor["WORKMANSHIP"] = "workmanship";
    PaidFor["MATERIAL"] = "material";
    PaidFor["BOTH"] = "both";
})(PaidFor || (exports.PaidFor = PaidFor = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["SUCCESS"] = "success";
    TransactionStatus["FAILED"] = "failed";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
var TransactionType;
(function (TransactionType) {
    TransactionType["DEBIT"] = "debit";
    TransactionType["CREDIT"] = "credit";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var TransferStatus;
(function (TransferStatus) {
    TransferStatus["SUCCESS"] = "success";
    TransferStatus["FAILED"] = "failed";
    TransferStatus["PENDING"] = "pending";
})(TransferStatus || (exports.TransferStatus = TransferStatus = {}));
