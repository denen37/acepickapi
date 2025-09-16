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
exports.Rating = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const Models_1 = require("./Models");
let Rating = class Rating extends sequelize_typescript_1.Model {
};
exports.Rating = Rating;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.BIGINT),
    __metadata("design:type", Number)
], Rating.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], Rating.prototype, "value", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Models_1.User),
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], Rating.prototype, "professionalUserId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Models_1.User),
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], Rating.prototype, "clientUserId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Models_1.Job),
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], Rating.prototype, "jobId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Models_1.Order),
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], Rating.prototype, "orderId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Models_1.User, { onDelete: 'CASCADE', foreignKey: "professionalUserId", as: "professionalUser" }),
    __metadata("design:type", Models_1.User)
], Rating.prototype, "professionalUser", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Models_1.User, { onDelete: 'CASCADE', foreignKey: "clientUserId", as: "clientUser" }),
    __metadata("design:type", Models_1.User)
], Rating.prototype, "clientUser", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Models_1.Job, { onDelete: 'CASCADE' }),
    __metadata("design:type", Models_1.Job)
], Rating.prototype, "job", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Models_1.Order, { onDelete: 'CASCADE' }),
    __metadata("design:type", Models_1.Order)
], Rating.prototype, "order", void 0);
exports.Rating = Rating = __decorate([
    (0, sequelize_typescript_1.Table)({ timestamps: true, tableName: 'rating' })
], Rating);
