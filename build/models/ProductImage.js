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
exports.ProductImage = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const Models_1 = require("./Models");
let ProductImage = class ProductImage extends sequelize_typescript_1.Model {
};
exports.ProductImage = ProductImage;
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], ProductImage.prototype, "path", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.ForeignKey)(() => Models_1.Product),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], ProductImage.prototype, "productId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Models_1.Product, { foreignKey: 'productId', targetKey: 'id', onDelete: 'CASCADE' }),
    __metadata("design:type", Models_1.Product)
], ProductImage.prototype, "product", void 0);
exports.ProductImage = ProductImage = __decorate([
    (0, sequelize_typescript_1.Table)({ timestamps: false, tableName: 'product_images' })
], ProductImage);
