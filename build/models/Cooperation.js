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
exports.Cooperation = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const Profile_1 = require("./Profile");
const Profession_1 = require("./Profession");
const Director_1 = require("./Director");
let Cooperation = class Cooperation extends sequelize_typescript_1.Model {
};
exports.Cooperation = Cooperation;
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Cooperation.prototype, "nameOfOrg", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Cooperation.prototype, "phone", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Cooperation.prototype, "address", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Cooperation.prototype, "state", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Cooperation.prototype, "lga", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Cooperation.prototype, "regNum", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", Number)
], Cooperation.prototype, "noOfEmployees", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.ForeignKey)(() => Profession_1.Profession),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], Cooperation.prototype, "professionId", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.ForeignKey)(() => Profile_1.Profile),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], Cooperation.prototype, "profileId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Profile_1.Profile, { onDelete: 'CASCADE' }),
    __metadata("design:type", Profile_1.Profile)
], Cooperation.prototype, "profile", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Profession_1.Profession, { onDelete: 'CASCADE' }),
    __metadata("design:type", Profession_1.Profession)
], Cooperation.prototype, "profession", void 0);
__decorate([
    (0, sequelize_typescript_1.HasOne)(() => Director_1.Director),
    __metadata("design:type", Director_1.Director)
], Cooperation.prototype, "director", void 0);
exports.Cooperation = Cooperation = __decorate([
    (0, sequelize_typescript_1.Table)({ timestamps: true, tableName: 'cooperations' })
], Cooperation);
