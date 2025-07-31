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
exports.ProductTransaction = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const Models_1 = require("./Models");
const enum_1 = require("../utils/enum");
let ProductTransaction = class ProductTransaction extends sequelize_typescript_1.Model {
};
exports.ProductTransaction = ProductTransaction;
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    (0, sequelize_typescript_1.ForeignKey)(() => Models_1.Product),
    __metadata("design:type", Number)
], ProductTransaction.prototype, "productId", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    (0, sequelize_typescript_1.ForeignKey)(() => Models_1.User),
    __metadata("design:type", String)
], ProductTransaction.prototype, "buyerId", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    (0, sequelize_typescript_1.ForeignKey)(() => Models_1.User),
    __metadata("design:type", String)
], ProductTransaction.prototype, "sellerId", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(1),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], ProductTransaction.prototype, "quantity", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DECIMAL(10, 2)),
    __metadata("design:type", Number)
], ProductTransaction.prototype, "price", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(enum_1.ProductTransactionStatus.PENDING),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM(...Object.values(enum_1.ProductTransactionStatus))),
    __metadata("design:type", String)
], ProductTransaction.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(enum_1.OrderMethod.SELF_PICKUP),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM(...Object.values(enum_1.OrderMethod))),
    __metadata("design:type", String)
], ProductTransaction.prototype, "orderMethod", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    __metadata("design:type", Date)
], ProductTransaction.prototype, "date", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Models_1.Product),
    __metadata("design:type", Models_1.Product)
], ProductTransaction.prototype, "product", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Models_1.User, { foreignKey: 'buyerId' }),
    __metadata("design:type", Models_1.User)
], ProductTransaction.prototype, "buyer", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Models_1.User, { foreignKey: 'sellerId' }),
    __metadata("design:type", Models_1.User)
], ProductTransaction.prototype, "seller", void 0);
__decorate([
    (0, sequelize_typescript_1.HasOne)(() => Models_1.Transaction),
    __metadata("design:type", Models_1.Transaction)
], ProductTransaction.prototype, "transaction", void 0);
exports.ProductTransaction = ProductTransaction = __decorate([
    (0, sequelize_typescript_1.Table)({ timestamps: true, tableName: 'product_transactions' })
], ProductTransaction);
