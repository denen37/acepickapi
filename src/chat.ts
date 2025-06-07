import config from './config/configSetup';
import { Server } from 'socket.io';
import { socketAuthorize } from './middlewares/authorize';
import { OnlineUser } from './models/OnlineUser';
import { emitLatestJob } from './controllers/socket/jobs';

let io: Server;

export const initSocket = (httpServer: any) => {
    io = new Server(httpServer, {
        cors: {
            origin: '*',
            credentials: true,
        },
    });

    io.use(async (socket, next) => {

        socketAuthorize(socket, next);

    });

    io.on('connection', async (socket) => {
        console.log('a user connected', socket.id);

        const [onlineuser, created] = await OnlineUser.findOrCreate({
            where: { userId: socket.user.id },
            defaults: {
                socketId: socket.id,
                lastActive: new Date(),
                isOnline: true,
            }
        })

        if (!created) {
            onlineuser.socketId = socket.id;
            onlineuser.lastActive = new Date();
            onlineuser.isOnline = true;
            await onlineuser.save();
        }

        //emit latest job
        await emitLatestJob(io, socket);

        socket.on('disconnect', async () => {
            console.log('A user disconnected', socket.id);
            const onlineUser = await OnlineUser.findOne({ where: { userId: socket.user.id } });
            if (onlineUser) {
                onlineUser.isOnline = false;
                onlineUser.lastActive = new Date();
                await onlineUser.save();
            }
        })
    });

    return io;
}

export const getIO = (): Server => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

