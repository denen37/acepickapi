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
exports.User = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const uuid_1 = require("uuid");
const Models_1 = require("./Models");
const enum_1 = require("../utils/enum");
let User = class User extends sequelize_typescript_1.Model {
};
exports.User = User;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)((0, uuid_1.v4)()),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Index)({ name: 'email-index', type: 'UNIQUE', unique: true }),
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", Object)
], User.prototype, "password", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], User.prototype, "fcmToken", void 0);
__decorate([
    (0, sequelize_typescript_1.Index)({ name: 'phone-index', type: 'UNIQUE', unique: true }),
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], User.prototype, "phone", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(enum_1.UserStatus.ACTIVE),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM(...Object.values(enum_1.UserStatus))),
    __metadata("design:type", String)
], User.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(enum_1.UserRole.CLIENT),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM(...Object.values(enum_1.UserRole))),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.BOOLEAN),
    __metadata("design:type", Boolean)
], User.prototype, "agreed", void 0);
__decorate([
    (0, sequelize_typescript_1.HasOne)(() => Models_1.Wallet),
    __metadata("design:type", Models_1.Wallet)
], User.prototype, "wallet", void 0);
__decorate([
    (0, sequelize_typescript_1.HasOne)(() => Models_1.Profile),
    __metadata("design:type", Models_1.Profile)
], User.prototype, "profile", void 0);
__decorate([
    (0, sequelize_typescript_1.HasOne)(() => Models_1.Location),
    __metadata("design:type", Models_1.Location)
], User.prototype, "location", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Models_1.Review, { foreignKey: 'professionalUserId', as: 'professionalReviews' }),
    __metadata("design:type", Array)
], User.prototype, "professionalReviews", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Models_1.Review, { foreignKey: 'clientUserId', as: 'clientReviews' }),
    __metadata("design:type", Array)
], User.prototype, "clientReviews", void 0);
__decorate([
    (0, sequelize_typescript_1.HasOne)(() => Models_1.OnlineUser),
    __metadata("design:type", Models_1.OnlineUser)
], User.prototype, "onlineUser", void 0);
exports.User = User = __decorate([
    (0, sequelize_typescript_1.Table)({ timestamps: true, tableName: 'users' })
], User);
