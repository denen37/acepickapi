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
exports.LedgerEntry = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const enum_1 = require("../utils/enum");
const Models_1 = require("./Models");
// import { User } from './Models';
let LedgerEntry = class LedgerEntry extends sequelize_typescript_1.Model {
};
exports.LedgerEntry = LedgerEntry;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.BIGINT),
    __metadata("design:type", Number)
], LedgerEntry.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Models_1.Transaction),
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.BIGINT),
    __metadata("design:type", Number)
], LedgerEntry.prototype, "transactionId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Models_1.User),
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], LedgerEntry.prototype, "userId", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DECIMAL),
    __metadata("design:type", Number)
], LedgerEntry.prototype, "amount", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Default)(enum_1.TransactionType.CREDIT),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM(enum_1.TransactionType.CREDIT, enum_1.TransactionType.DEBIT)),
    __metadata("design:type", String)
], LedgerEntry.prototype, "type", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM(...Object.values(enum_1.Accounts))),
    __metadata("design:type", String)
], LedgerEntry.prototype, "account", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Models_1.Transaction),
    __metadata("design:type", Models_1.Transaction)
], LedgerEntry.prototype, "transaction", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Models_1.User),
    __metadata("design:type", Models_1.User)
], LedgerEntry.prototype, "user", void 0);
exports.LedgerEntry = LedgerEntry = __decorate([
    (0, sequelize_typescript_1.Table)({ timestamps: true, tableName: 'ledger_entries' })
], LedgerEntry);
