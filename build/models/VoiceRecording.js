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
exports.VoiceRecording = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const Profile_1 = require("./Profile");
const User_1 = require("./User");
let VoiceRecording = class VoiceRecording extends sequelize_typescript_1.Model {
};
exports.VoiceRecording = VoiceRecording;
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], VoiceRecording.prototype, "url", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], VoiceRecording.prototype, "duration", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => User_1.User),
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], VoiceRecording.prototype, "userId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => User_1.User),
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], VoiceRecording.prototype, "recieverId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Profile_1.Profile),
    (0, sequelize_typescript_1.AllowNull)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Number)
], VoiceRecording.prototype, "profileId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => User_1.User, { foreignKey: 'userId', as: 'user', onDelete: 'CASCADE' }),
    __metadata("design:type", User_1.User)
], VoiceRecording.prototype, "user", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => User_1.User, { foreignKey: 'recieverId', as: 'reciever', onDelete: 'CASCADE' }),
    __metadata("design:type", User_1.User)
], VoiceRecording.prototype, "reciever", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Profile_1.Profile, { onDelete: 'CASCADE' }),
    __metadata("design:type", Profile_1.Profile)
], VoiceRecording.prototype, "profile", void 0);
exports.VoiceRecording = VoiceRecording = __decorate([
    (0, sequelize_typescript_1.Table)({ timestamps: true, tableName: 'voicerecord' })
], VoiceRecording);
