import { Job, Professional, Profile } from '../models/Models';
import { JobStatus } from '../utils/enum';

export const registerJobHook = async () => {
    Job.afterUpdate(async (job: Job, options: any) => {
        if (job.changed('status')) {
            // Update the profile of the client
            const clientProfile = await Profile.findOne({
                where: { userId: job.clientId },
            })


            if (clientProfile) {
                clientProfile.totalJobs = await Job.count({ where: { clientId: job.clientId } });

                clientProfile.totalJobsPending = await Job.count({ where: { clientId: job.clientId, status: JobStatus.PENDING } });

                clientProfile.totalJobsOngoing = await Job.count({ where: { clientId: job.clientId, status: JobStatus.ONGOING } });

                clientProfile.totalJobsDeclined = await Job.count({ where: { clientId: job.clientId, status: JobStatus.DECLINED } });

                clientProfile.totalJobsCompleted = await Job.count({ where: { clientId: job.clientId, status: JobStatus.COMPLETED } });

                clientProfile.totalJobsApproved = await Job.count({ where: { clientId: job.clientId, status: JobStatus.APPROVED } });

                clientProfile.totalJobsCanceled = await Job.count({ where: { clientId: job.clientId, status: JobStatus.CANCELLED } });

                clientProfile.totalDisputes = await Job.count({ where: { clientId: job.clientId, status: JobStatus.DISPUTED } });

                // clientProfile.totalExpense = await Job.sum('workmanship', { where: { clientId: job.clientId } });

                await clientProfile.save();
            }


            const professionalProfile = await Profile.findOne({
                where: { userId: job.professionalId },
                include: [Professional]
            })

            if (professionalProfile) {
                professionalProfile.totalJobs = await Job.count({ where: { professionalId: job.professionalId } });

                professionalProfile.totalJobsPending = await Job.count({ where: { professionalId: job.professionalId, status: JobStatus.PENDING } });

                professionalProfile.totalJobsOngoing = await Job.count({ where: { professionalId: job.professionalId, status: JobStatus.ONGOING } });

                professionalProfile.totalJobsDeclined = await Job.count({ where: { professionalId: job.professionalId, status: JobStatus.DECLINED } });

                professionalProfile.totalJobsCompleted = await Job.count({ where: { professionalId: job.professionalId, status: JobStatus.COMPLETED } });

                professionalProfile.totalJobsApproved = await Job.count({ where: { professionalId: job.professionalId, status: JobStatus.APPROVED } });

                professionalProfile.totalJobsCanceled = await Job.count({ where: { professionalId: job.professionalId, status: JobStatus.CANCELLED } });

                professionalProfile.totalDisputes = await Job.count({ where: { professionalId: job.professionalId, status: JobStatus.DISPUTED } });

                await professionalProfile.save();


                professionalProfile.professional.totalEarning = await Job.sum('workmanship', { where: { professionalId: job.professionalId, status: JobStatus.APPROVED } });

                professionalProfile.professional.completedAmount = await Job.sum('workmanship', { where: { professionalId: job.professionalId, status: JobStatus.COMPLETED } });

                professionalProfile.professional.pendingAmount = await Job.sum('workmanship', { where: { professionalId: job.professionalId, status: JobStatus.PENDING } });

                professionalProfile.professional.rejectedAmount = await Job.sum('workmanship', { where: { professionalId: job.professionalId, status: JobStatus.DECLINED } });

                //professionalProfile.professional.availableWithdrawalAmount = professionalProfile.professional.totalEarning - professionalProfile.professional.completedAmount;

                await professionalProfile.professional.save();
            }

        }
    });

    Job.afterCreate(async (job: Job, options: any) => {
        const clientProfile = await Profile.findOne({
            where: { userId: job.clientId },
        })


        if (clientProfile) {
            clientProfile.totalJobs = await Job.count({ where: { clientId: job.clientId } });

            clientProfile.totalJobsPending = await Job.count({ where: { clientId: job.clientId, status: JobStatus.PENDING } });

            //clientProfile.totalJobsOngoing = await Job.count({ where: { clientId: job.clientId, status: JobStatus.ONGOING } });

            //clientProfile.totalJobsDeclined = await Job.count({ where: { clientId: job.clientId, status: JobStatus.DECLINED } });

            // clientProfile.totalJobsCompleted = await Job.count({ where: { clientId: job.clientId, status: JobStatus.COMPLETED } });

            //clientProfile.totalJobsApproved = await Job.count({ where: { clientId: job.clientId, status: JobStatus.APPROVED } });

            //clientProfile.totalJobsCanceled = await Job.count({ where: { clientId: job.clientId, status: JobStatus.CANCELLED } });

            //clientProfile.totalDisputes = await Job.count({ where: { clientId: job.clientId, status: JobStatus.DISPUTED } });

            // clientProfile.totalExpense = await Job.sum('workmanship', { where: { clientId: job.clientId } });

            await clientProfile.save();
        }


        const professionalProfile = await Profile.findOne({
            where: { userId: job.professionalId },
            include: [Professional]
        })

        if (professionalProfile) {
            professionalProfile.totalJobs = await Job.count({ where: { professionalId: job.professionalId } });

            professionalProfile.totalJobsPending = await Job.count({ where: { professionalId: job.professionalId, status: JobStatus.PENDING } });

            // professionalProfile.totalJobsOngoing = await Job.count({ where: { professionalId: job.professionalId, status: JobStatus.ONGOING } });

            // professionalProfile.totalJobsDeclined = await Job.count({ where: { professionalId: job.professionalId, status: JobStatus.DECLINED } });

            // professionalProfile.totalJobsCompleted = await Job.count({ where: { professionalId: job.professionalId, status: JobStatus.COMPLETED } });

            // professionalProfile.totalJobsApproved = await Job.count({ where: { professionalId: job.professionalId, status: JobStatus.APPROVED } });

            // professionalProfile.totalJobsCanceled = await Job.count({ where: { professionalId: job.professionalId, status: JobStatus.CANCELLED } });

            // professionalProfile.totalDisputes = await Job.count({ where: { professionalId: job.professionalId, status: JobStatus.DISPUTED } });

            await professionalProfile.save();


            //professionalProfile.professional.totalEarning = await Job.sum('workmanship', { where: { professionalId: job.professionalId, status: JobStatus.APPROVED } });

            //professionalProfile.professional.completedAmount = await Job.sum('workmanship', { where: { professionalId: job.professionalId, status: JobStatus.COMPLETED } });

            professionalProfile.professional.pendingAmount = await Job.sum('workmanship', { where: { professionalId: job.professionalId, status: JobStatus.PENDING } });

            //professionalProfile.professional.rejectedAmount = await Job.sum('workmanship', { where: { professionalId: job.professionalId, status: JobStatus.DECLINED } });

            //professionalProfile.professional.availableWithdrawalAmount = professionalProfile.professional.totalEarning - professionalProfile.professional.completedAmount;

            await professionalProfile.professional.save();
        }

    })
}