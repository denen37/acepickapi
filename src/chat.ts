import config from './config/configSetup';
import { Server } from 'socket.io';
import { socketAuthorize } from './middlewares/authorize';

const chatSocket = (httpServer: any) => {
    const io = new Server(httpServer, {
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

        socket.on('disconnect', async () => {

            console.log('A user disconnected', socket.id);
        })
    });

    return io;
}

export default chatSocket;