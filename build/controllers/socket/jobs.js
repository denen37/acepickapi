"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitLatestJob = void 0;
const enum_1 = require("../../enum");
const Models_1 = require("../../models/Models");
const emitLatestJob = (io, socket) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, role } = socket.user;
    if (role === enum_1.UserRole.PROFESSIONAL) {
        try {
            const job = yield Models_1.Job.findOne({
                where: {
                    professionalId: id,
                    status: enum_1.JobStatus.PENDING,
                    accepted: false
                },
                order: [['createdAt', 'DESC']],
                include: [Models_1.Material]
            });
            if (job) {
                io.to(socket.id).emit('JOB_LATEST', { text: 'You have a pending job', data: job });
            }
        }
        catch (error) {
            console.log(error);
        }
    }
});
exports.emitLatestJob = emitLatestJob;
