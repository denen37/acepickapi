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
exports.User = exports.UserRole = exports.UserState = exports.UserStatus = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const uuid_1 = require("uuid");
const Profile_1 = require("./Profile");
// import { Profile } from './Profile';
const Wallet_1 = require("./Wallet");
const LanLog_1 = require("./LanLog");
// import { Profession } from './Profession';
// import { Jobs } from './Jobs';
// import { Review } from './Review';
const Education_1 = require("./Education");
const Experience_1 = require("./Experience");
// import { Certificate } from 'crypto';
const Portfolio_1 = require("./Portfolio");
const Certification_1 = require("./Certification");
// import { Dispute } from './Dispute';
// import Sequelize from 'sequelize/types/sequelize';
// import { Professional } from './Professional';
// import { MarketPlace } from './Market';
// import { ProfessionalSector } from './ProffesionalSector';
// export enum UserGender {
// 	MALE = 'MALE',
// 	FEMALE = 'FEMALE',
// 	OTHER = 'OTHER',
// }
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
var UserRole;
(function (UserRole) {
    UserRole["PROFESSIONAL"] = "professional";
    UserRole["CLIENT"] = "client";
})(UserRole || (exports.UserRole = UserRole = {}));
let User = class User extends sequelize_typescript_1.Model {
};
exports.User = User;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(uuid_1.v4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Default)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.BOOLEAN),
    __metadata("design:type", String)
], User.prototype, "setPin", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], User.prototype, "fcmToken", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], User.prototype, "phone", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(UserStatus.ACTIVE),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM(UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.SUSPENDED)),
    __metadata("design:type", String)
], User.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(UserRole.CLIENT),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM(UserRole.PROFESSIONAL, UserRole.CLIENT)),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(UserState.STEP_TWO),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM(UserState.STEP_ONE, UserState.STEP_TWO, UserState.STEP_THREE, UserState.VERIFIED)),
    __metadata("design:type", String)
], User.prototype, "state", void 0);
__decorate([
    (0, sequelize_typescript_1.HasOne)(() => Wallet_1.Wallet),
    __metadata("design:type", Wallet_1.Wallet)
], User.prototype, "wallet", void 0);
__decorate([
    (0, sequelize_typescript_1.HasOne)(() => Profile_1.Profile),
    __metadata("design:type", Profile_1.Profile)
], User.prototype, "profile", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => LanLog_1.LanLog),
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], User.prototype, "locationId", void 0);
__decorate([
    (0, sequelize_typescript_1.HasOne)(() => LanLog_1.LanLog),
    __metadata("design:type", LanLog_1.LanLog)
], User.prototype, "location", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Education_1.Education, { onDelete: 'CASCADE' }),
    __metadata("design:type", Array)
], User.prototype, "education", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Experience_1.Experience, { onDelete: 'CASCADE' }),
    __metadata("design:type", Array)
], User.prototype, "experience", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Certification_1.Certification, { onDelete: 'CASCADE' }),
    __metadata("design:type", Array)
], User.prototype, "certification", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Portfolio_1.Portfolio, { onDelete: 'CASCADE' }),
    __metadata("design:type", Array)
], User.prototype, "portfolio", void 0);
exports.User = User = __decorate([
    (0, sequelize_typescript_1.Table)({ timestamps: true, tableName: 'users' })
], User);
