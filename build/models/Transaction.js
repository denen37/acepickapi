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
exports.Transaction = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const enum_1 = require("../utils/enum");
const User_1 = require("./User");
const Job_1 = require("./Job");
const ProductTransaction_1 = require("./ProductTransaction");
// import { User } from './Models';
let Transaction = class Transaction extends sequelize_typescript_1.Model {
};
exports.Transaction = Transaction;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.BIGINT),
    __metadata("design:type", Number)
], Transaction.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DECIMAL),
    __metadata("design:type", Number)
], Transaction.prototype, "amount", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(enum_1.TransactionType.CREDIT),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM(enum_1.TransactionType.CREDIT, enum_1.TransactionType.DEBIT)),
    __metadata("design:type", String)
], Transaction.prototype, "type", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM(...Object.values(enum_1.TransactionStatus))),
    __metadata("design:type", String)
], Transaction.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Transaction.prototype, "channel", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)('NGN'),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Transaction.prototype, "currency", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    __metadata("design:type", Date)
], Transaction.prototype, "timestamp", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], Transaction.prototype, "description", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    sequelize_typescript_1.Unique,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(200)),
    __metadata("design:type", String)
], Transaction.prototype, "reference", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Job_1.Job),
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], Transaction.prototype, "jobId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => ProductTransaction_1.ProductTransaction),
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], Transaction.prototype, "productTransactionId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => User_1.User),
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], Transaction.prototype, "userId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => User_1.User, { onDelete: 'CASCADE' }),
    __metadata("design:type", User_1.User)
], Transaction.prototype, "user", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Job_1.Job, { onDelete: 'CASCADE' }),
    __metadata("design:type", Job_1.Job)
], Transaction.prototype, "job", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => ProductTransaction_1.ProductTransaction, { onDelete: 'CASCADE' }),
    __metadata("design:type", ProductTransaction_1.ProductTransaction)
], Transaction.prototype, "productTransaction", void 0);
exports.Transaction = Transaction = __decorate([
    (0, sequelize_typescript_1.Table)({ timestamps: true, tableName: 'transactions' })
], Transaction);
