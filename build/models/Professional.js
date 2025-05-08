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
exports.Professional = exports.WorkType = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const Profession_1 = require("./Profession");
const Profile_1 = require("./Profile");
var WorkType;
(function (WorkType) {
    WorkType["BUSY"] = "BUSY";
    WorkType["IDLE"] = "IDLE";
})(WorkType || (exports.WorkType = WorkType = {}));
let Professional = class Professional extends sequelize_typescript_1.Model {
};
exports.Professional = Professional;
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(500)),
    __metadata("design:type", String)
], Professional.prototype, "file", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Professional.prototype, "intro", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DECIMAL),
    __metadata("design:type", Number)
], Professional.prototype, "chargeFrom", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)("English"),
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(100)),
    __metadata("design:type", String)
], Professional.prototype, "language", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(true),
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.BOOLEAN),
    __metadata("design:type", Boolean)
], Professional.prototype, "available", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(WorkType.IDLE),
    (0, sequelize_typescript_1.IsIn)([[WorkType.IDLE, WorkType.BUSY]]),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Professional.prototype, "workType", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(0),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], Professional.prototype, "totalEarning", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(0.0),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DECIMAL(10, 2)),
    __metadata("design:type", Number)
], Professional.prototype, "completedAmount", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(0.0),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DECIMAL),
    __metadata("design:type", Number)
], Professional.prototype, "pendingAmount", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(0.0),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DECIMAL),
    __metadata("design:type", Number)
], Professional.prototype, "rejectedAmount", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(0.0),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DECIMAL),
    __metadata("design:type", Number)
], Professional.prototype, "availableWithdrawalAmount", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Professional.prototype, "regNum", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER) // Fixed to INTEGER if it is meant to be a number
    ,
    __metadata("design:type", Number)
], Professional.prototype, "yearsOfExp", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(false),
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.BOOLEAN),
    __metadata("design:type", Boolean)
], Professional.prototype, "online", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Profile_1.Profile),
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], Professional.prototype, "profileId", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.ForeignKey)(() => Profession_1.Profession),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], Professional.prototype, "professionId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Profession_1.Profession, { foreignKey: 'professionId' }),
    __metadata("design:type", Profession_1.Profession)
], Professional.prototype, "profession", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Profile_1.Profile, { foreignKey: 'profileId' }),
    __metadata("design:type", Profile_1.Profile)
], Professional.prototype, "profile", void 0);
exports.Professional = Professional = __decorate([
    (0, sequelize_typescript_1.Table)({ timestamps: true, tableName: 'professionals' })
], Professional);
