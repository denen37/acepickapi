import config from './config/configSetup';
import { Server } from 'socket.io';

const chatSocket = (httpServer: any) => {
    const io = new Server(httpServer, {
        cors: {
            origin: '*',
            credentials: true,
        },
    });

    // io.use(async (socket, next) => {
    //     const token = socket.handshake.auth.token;

    //     console.log('Session id', socket.handshake.auth.sessionId);

    //     try {
    //         const response = await authenticateParamToken(token);

    //         socket.user = response.payload;
    //     } catch (error) {
    //         logger.error(error.message);

    //         return next(new Error('Authentication error'));
    //     }

    //     next();
    // });

    io.on('connection', async (socket) => {
        console.log('a user connected', socket.id);

        socket.on('disconnect', async () => {

            console.log('A user disconnected', socket.id);
        })
    });

    return io;
}

export default chatSocket;