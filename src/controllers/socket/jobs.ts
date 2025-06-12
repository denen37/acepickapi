import { Server, Socket } from "socket.io";
import { JobStatus, UserRole } from "../../utils/enum";
import { Job, Material } from "../../models/Models";

export const emitLatestJob = async (io: Server, socket: Socket) => {
    const { id, role } = socket.user;

    if (role === UserRole.PROFESSIONAL) {
        try {
            const job = await Job.findOne({
                where: {
                    professionalId: id,
                    status: JobStatus.PENDING,
                    accepted: false
                },
                order: [['createdAt', 'DESC']],
                include: [Material]
            })

            if (job) {
                io.to(socket.id).emit('JOB_LATEST', { text: 'You have a pending job', data: job });
            }
        } catch (error) {
            console.log(error);
        }
    }
}
