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
exports.Verify = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const enum_1 = require("../utils/enum");
let Verify = class Verify extends sequelize_typescript_1.Model {
};
exports.Verify = Verify;
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Verify.prototype, "contact", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Verify.prototype, "code", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(false),
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.BOOLEAN),
    __metadata("design:type", Boolean)
], Verify.prototype, "verified", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(enum_1.VerificationType.EMAIL),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM(enum_1.VerificationType.EMAIL, enum_1.VerificationType.SMS)),
    __metadata("design:type", String)
], Verify.prototype, "type", void 0);
exports.Verify = Verify = __decorate([
    (0, sequelize_typescript_1.Table)({ updatedAt: false, tableName: 'verify' })
], Verify);
