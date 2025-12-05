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
exports.Dispute = exports.DisputeStatus = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
// import { Profile } from './Profile';
// import { Wallet } from './Wallet';
// import { LanLog } from './LanLog';
// import { User } from './User';
const Job_1 = require("./Job");
const ProductTransaction_1 = require("./ProductTransaction");
const User_1 = require("./User");
var DisputeStatus;
(function (DisputeStatus) {
    DisputeStatus["RESOLVED"] = "RESOLVED";
    DisputeStatus["PENDING"] = "PENDING";
})(DisputeStatus || (exports.DisputeStatus = DisputeStatus = {}));
let Dispute = class Dispute extends sequelize_typescript_1.Model {
};
exports.Dispute = Dispute;
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Dispute.prototype, "reason", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", String)
], Dispute.prototype, "description", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(DisputeStatus.PENDING),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM(DisputeStatus.RESOLVED, DisputeStatus.PENDING)),
    __metadata("design:type", String)
], Dispute.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Dispute.prototype, "url", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Job_1.Job),
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], Dispute.prototype, "jobId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => ProductTransaction_1.ProductTransaction),
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], Dispute.prototype, "productTransactionId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => User_1.User),
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], Dispute.prototype, "reporterId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => User_1.User),
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], Dispute.prototype, "partnerId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Job_1.Job, { onDelete: 'CASCADE' }),
    __metadata("design:type", Job_1.Job)
], Dispute.prototype, "job", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => ProductTransaction_1.ProductTransaction, { onDelete: 'CASCADE' }),
    __metadata("design:type", ProductTransaction_1.ProductTransaction)
], Dispute.prototype, "productTransaction", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => User_1.User, { onDelete: 'CASCADE', foreignKey: 'reporterId', as: 'reporter', }),
    __metadata("design:type", User_1.User)
], Dispute.prototype, "reporter", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => User_1.User, { onDelete: 'CASCADE', foreignKey: 'partnerId', as: 'partner', }),
    __metadata("design:type", User_1.User)
], Dispute.prototype, "partner", void 0);
exports.Dispute = Dispute = __decorate([
    (0, sequelize_typescript_1.Table)({ timestamps: true, tableName: 'dispute' })
], Dispute);
