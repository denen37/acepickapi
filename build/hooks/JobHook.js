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
exports.registerJobHook = void 0;
const Models_1 = require("../models/Models");
const enum_1 = require("../utils/enum");
const registerJobHook = () => __awaiter(void 0, void 0, void 0, function* () {
    Models_1.Job.afterUpdate((job, options) => __awaiter(void 0, void 0, void 0, function* () {
        if (job.changed('status')) {
            // Update the profile of the client
            const clientProfile = yield Models_1.Profile.findOne({
                where: { userId: job.clientId },
            });
            if (clientProfile) {
                clientProfile.totalJobs = yield Models_1.Job.count({ where: { clientId: job.clientId } });
                clientProfile.totalJobsPending = yield Models_1.Job.count({ where: { clientId: job.clientId, status: enum_1.JobStatus.PENDING } });
                clientProfile.totalJobsOngoing = yield Models_1.Job.count({ where: { clientId: job.clientId, status: enum_1.JobStatus.ONGOING } });
                clientProfile.totalJobsDeclined = yield Models_1.Job.count({ where: { clientId: job.clientId, status: enum_1.JobStatus.DECLINED } });
                clientProfile.totalJobsCompleted = yield Models_1.Job.count({ where: { clientId: job.clientId, status: enum_1.JobStatus.COMPLETED } });
                clientProfile.totalJobsApproved = yield Models_1.Job.count({ where: { clientId: job.clientId, status: enum_1.JobStatus.APPROVED } });
                clientProfile.totalJobsCanceled = yield Models_1.Job.count({ where: { clientId: job.clientId, status: enum_1.JobStatus.CANCELLED } });
                clientProfile.totalDisputes = yield Models_1.Job.count({ where: { clientId: job.clientId, status: enum_1.JobStatus.DISPUTED } });
                // clientProfile.totalExpense = await Job.sum('workmanship', { where: { clientId: job.clientId } });
                yield clientProfile.save();
            }
            const professionalProfile = yield Models_1.Profile.findOne({
                where: { userId: job.professionalId },
                include: [Models_1.Professional]
            });
            if (professionalProfile) {
                professionalProfile.totalJobs = yield Models_1.Job.count({ where: { professionalId: job.professionalId } });
                professionalProfile.totalJobsPending = yield Models_1.Job.count({ where: { professionalId: job.professionalId, status: enum_1.JobStatus.PENDING } });
                professionalProfile.totalJobsOngoing = yield Models_1.Job.count({ where: { professionalId: job.professionalId, status: enum_1.JobStatus.ONGOING } });
                professionalProfile.totalJobsDeclined = yield Models_1.Job.count({ where: { professionalId: job.professionalId, status: enum_1.JobStatus.DECLINED } });
                professionalProfile.totalJobsCompleted = yield Models_1.Job.count({ where: { professionalId: job.professionalId, status: enum_1.JobStatus.COMPLETED } });
                professionalProfile.totalJobsApproved = yield Models_1.Job.count({ where: { professionalId: job.professionalId, status: enum_1.JobStatus.APPROVED } });
                professionalProfile.totalJobsCanceled = yield Models_1.Job.count({ where: { professionalId: job.professionalId, status: enum_1.JobStatus.CANCELLED } });
                professionalProfile.totalDisputes = yield Models_1.Job.count({ where: { professionalId: job.professionalId, status: enum_1.JobStatus.DISPUTED } });
                yield professionalProfile.save();
                professionalProfile.professional.totalEarning = yield Models_1.Job.sum('workmanship', { where: { professionalId: job.professionalId, status: enum_1.JobStatus.APPROVED } });
                professionalProfile.professional.completedAmount = yield Models_1.Job.sum('workmanship', { where: { professionalId: job.professionalId, status: enum_1.JobStatus.COMPLETED } });
                professionalProfile.professional.pendingAmount = yield Models_1.Job.sum('workmanship', { where: { professionalId: job.professionalId, status: enum_1.JobStatus.PENDING } });
                professionalProfile.professional.rejectedAmount = yield Models_1.Job.sum('workmanship', { where: { professionalId: job.professionalId, status: enum_1.JobStatus.DECLINED } });
                //professionalProfile.professional.availableWithdrawalAmount = professionalProfile.professional.totalEarning - professionalProfile.professional.completedAmount;
                yield professionalProfile.professional.save();
            }
        }
    }));
    Models_1.Job.afterCreate((job, options) => __awaiter(void 0, void 0, void 0, function* () {
        const clientProfile = yield Models_1.Profile.findOne({
            where: { userId: job.clientId },
        });
        if (clientProfile) {
            clientProfile.totalJobs = yield Models_1.Job.count({ where: { clientId: job.clientId } });
            clientProfile.totalJobsPending = yield Models_1.Job.count({ where: { clientId: job.clientId, status: enum_1.JobStatus.PENDING } });
            //clientProfile.totalJobsOngoing = await Job.count({ where: { clientId: job.clientId, status: JobStatus.ONGOING } });
            //clientProfile.totalJobsDeclined = await Job.count({ where: { clientId: job.clientId, status: JobStatus.DECLINED } });
            // clientProfile.totalJobsCompleted = await Job.count({ where: { clientId: job.clientId, status: JobStatus.COMPLETED } });
            //clientProfile.totalJobsApproved = await Job.count({ where: { clientId: job.clientId, status: JobStatus.APPROVED } });
            //clientProfile.totalJobsCanceled = await Job.count({ where: { clientId: job.clientId, status: JobStatus.CANCELLED } });
            //clientProfile.totalDisputes = await Job.count({ where: { clientId: job.clientId, status: JobStatus.DISPUTED } });
            // clientProfile.totalExpense = await Job.sum('workmanship', { where: { clientId: job.clientId } });
            yield clientProfile.save();
        }
        const professionalProfile = yield Models_1.Profile.findOne({
            where: { userId: job.professionalId },
            include: [Models_1.Professional]
        });
        if (professionalProfile) {
            professionalProfile.totalJobs = yield Models_1.Job.count({ where: { professionalId: job.professionalId } });
            professionalProfile.totalJobsPending = yield Models_1.Job.count({ where: { professionalId: job.professionalId, status: enum_1.JobStatus.PENDING } });
            // professionalProfile.totalJobsOngoing = await Job.count({ where: { professionalId: job.professionalId, status: JobStatus.ONGOING } });
            // professionalProfile.totalJobsDeclined = await Job.count({ where: { professionalId: job.professionalId, status: JobStatus.DECLINED } });
            // professionalProfile.totalJobsCompleted = await Job.count({ where: { professionalId: job.professionalId, status: JobStatus.COMPLETED } });
            // professionalProfile.totalJobsApproved = await Job.count({ where: { professionalId: job.professionalId, status: JobStatus.APPROVED } });
            // professionalProfile.totalJobsCanceled = await Job.count({ where: { professionalId: job.professionalId, status: JobStatus.CANCELLED } });
            // professionalProfile.totalDisputes = await Job.count({ where: { professionalId: job.professionalId, status: JobStatus.DISPUTED } });
            yield professionalProfile.save();
            //professionalProfile.professional.totalEarning = await Job.sum('workmanship', { where: { professionalId: job.professionalId, status: JobStatus.APPROVED } });
            //professionalProfile.professional.completedAmount = await Job.sum('workmanship', { where: { professionalId: job.professionalId, status: JobStatus.COMPLETED } });
            professionalProfile.professional.pendingAmount = yield Models_1.Job.sum('workmanship', { where: { professionalId: job.professionalId, status: enum_1.JobStatus.PENDING } });
            //professionalProfile.professional.rejectedAmount = await Job.sum('workmanship', { where: { professionalId: job.professionalId, status: JobStatus.DECLINED } });
            //professionalProfile.professional.availableWithdrawalAmount = professionalProfile.professional.totalEarning - professionalProfile.professional.completedAmount;
            yield professionalProfile.professional.save();
        }
    }));
});
exports.registerJobHook = registerJobHook;
