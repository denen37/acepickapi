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
exports.Order = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const ProductTransaction_1 = require("./ProductTransaction");
const enum_1 = require("../utils/enum");
const User_1 = require("./User");
const Location_1 = require("./Location");
let Order = class Order extends sequelize_typescript_1.Model {
};
exports.Order = Order;
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    (0, sequelize_typescript_1.ForeignKey)(() => ProductTransaction_1.ProductTransaction),
    __metadata("design:type", Number)
], Order.prototype, "productTransactionId", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(enum_1.OrderStatus.PENDING),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM(...Object.values(enum_1.OrderStatus))),
    __metadata("design:type", String)
], Order.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(0),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DECIMAL(10, 2)),
    __metadata("design:type", Number)
], Order.prototype, "cost", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DECIMAL(10, 2)),
    __metadata("design:type", Number)
], Order.prototype, "distance", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DECIMAL(10, 2)),
    __metadata("design:type", Number)
], Order.prototype, "weight", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.ForeignKey)(() => Location_1.Location),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], Order.prototype, "locationId", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.ForeignKey)(() => User_1.User),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], Order.prototype, "riderId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Location_1.Location, { as: 'dropoffLocation', foreignKey: 'locationId' }),
    __metadata("design:type", Location_1.Location)
], Order.prototype, "dropoffLocation", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => ProductTransaction_1.ProductTransaction),
    __metadata("design:type", ProductTransaction_1.ProductTransaction)
], Order.prototype, "productTransaction", void 0);
exports.Order = Order = __decorate([
    (0, sequelize_typescript_1.Table)({ timestamps: true, tableName: 'orders' })
], Order);
