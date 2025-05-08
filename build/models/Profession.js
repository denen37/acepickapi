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
exports.Profession = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const Sector_1 = require("./Sector");
const Professional_1 = require("./Professional");
let Profession = class Profession extends sequelize_typescript_1.Model {
};
exports.Profession = Profession;
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Profession.prototype, "title", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(""),
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Profession.prototype, "image", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Sector_1.Sector),
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], Profession.prototype, "sectorId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Sector_1.Sector, { onDelete: 'CASCADE' }),
    __metadata("design:type", Sector_1.Sector)
], Profession.prototype, "sector", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Professional_1.Professional, { onDelete: 'CASCADE' }),
    __metadata("design:type", Array)
], Profession.prototype, "professional", void 0);
exports.Profession = Profession = __decorate([
    (0, sequelize_typescript_1.Table)({ timestamps: false, tableName: 'profession' })
], Profession);
