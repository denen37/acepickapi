"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Job = exports.PayStatus = exports.PaidFor = exports.modeType = exports.JobStatus = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
// import { Profile } from './Profile';
// import { Wallet } from './Wallet';
// import { LanLog } from './LanLog';
// import { User } from './User';
const Models_1 = require("./Models");
// import { VoiceRecording } from './VoiceRecording';
// export enum UserGender {
// 	MALE = 'MALE',
// 	FEMALE = 'FEMALE',
// 	OTHER = 'OTHER',
// }
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
var modeType;
(function (modeType) {
    modeType["VIRTUAL"] = "VIRTUAL";
    modeType["PHYSICAL"] = "PHYSICAL";
})(modeType || (exports.modeType = modeType = {}));
var PaidFor;
(function (PaidFor) {
    PaidFor["WORKMANSHIP"] = "workmanship";
    PaidFor["MATERIAL"] = "material";
    PaidFor["BOTH"] = "both";
})(PaidFor || (exports.PaidFor = PaidFor = {}));
var PayStatus;
(function (PayStatus) {
    PayStatus["UNPAID"] = "unpaid";
    PayStatus["PAID"] = "paid";
    PayStatus["PARTIALLY_PAID"] = "partially_paid";
    PayStatus["REFUNDED"] = "refunded";
    PayStatus["RELEASED"] = "released";
})(PayStatus || (exports.PayStatus = PayStatus = {}));
let Job = class Job extends sequelize_typescript_1.Model {
};
exports.Job = Job;
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Job.prototype, "description", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Job.prototype, "title", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(false),
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.BOOLEAN),
    __metadata("design:type", Boolean)
], Job.prototype, "accepted", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(false),
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.BOOLEAN),
    __metadata("design:type", Boolean)
], Job.prototype, "approved", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(modeType.VIRTUAL),
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM(modeType.VIRTUAL, modeType.PHYSICAL)),
    __metadata("design:type", String)
], Job.prototype, "mode", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Job.prototype, "state", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Job.prototype, "lga", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Job.prototype, "fullAddress", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DOUBLE),
    __metadata("design:type", Number)
], Job.prototype, "long", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], Job.prototype, "total", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(0),
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], Job.prototype, "departureDaysCount", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(0),
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], Job.prototype, "arrivalDaysCount", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(null),
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.JSON),
    __metadata("design:type", Object)
], Job.prototype, "clientLocation", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(null),
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.JSON),
    __metadata("design:type", Object)
], Job.prototype, "clientLocationArrival", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(null),
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.JSON),
    __metadata("design:type", Object)
], Job.prototype, "clientLocationDeparture", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(false),
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.BOOLEAN),
    __metadata("design:type", String)
], Job.prototype, "isLocationMatch", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(PayStatus.UNPAID),
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM(...Object.values(PayStatus))),
    __metadata("design:type", String)
], Job.prototype, "payStatus", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(PaidFor.WORKMANSHIP),
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM(PaidFor.WORKMANSHIP, PaidFor.MATERIAL, PaidFor.BOTH)),
    __metadata("design:type", String)
], Job.prototype, "paidFor", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], Job.prototype, "paymentRef", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DECIMAL(10, 2)),
    __metadata("design:type", Number)
], Job.prototype, "workmanship", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DECIMAL(10, 2)),
    __metadata("design:type", Number)
], Job.prototype, "materials", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.BOOLEAN),
    __metadata("design:type", Boolean)
], Job.prototype, "isMaterial", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DOUBLE),
    __metadata("design:type", Number)
], Job.prototype, "lan", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Job.prototype, "durationUnit", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Job.prototype, "reason", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", String)
], Job.prototype, "durationValue", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(JobStatus.PENDING),
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM(...Object.values(JobStatus))),
    __metadata("design:type", String)
], Job.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Models_1.User),
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], Job.prototype, "clientId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Models_1.User),
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], Job.prototype, "professionalId", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", String)
], Job.prototype, "sectorId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Models_1.User, { foreignKey: 'userId' }),
    __metadata("design:type", Models_1.User)
], Job.prototype, "client", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Models_1.User, { foreignKey: 'professionalId' }),
    __metadata("design:type", Models_1.User)
], Job.prototype, "professional", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Models_1.Dispute, { onDelete: 'CASCADE' }),
    __metadata("design:type", Array)
], Job.prototype, "dispute", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Models_1.Material, { onDelete: 'CASCADE' }),
    __metadata("design:type", Array)
], Job.prototype, "material", void 0);
exports.Job = Job = __decorate([
    (0, sequelize_typescript_1.Table)({ timestamps: true, tableName: 'jobs' })
], Job);
