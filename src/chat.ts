// import config from './config/configSetup';
import { Server } from 'socket.io';
import { socketAuthorize } from './middlewares/authorize';
// import { OnlineUser } from './models/OnlineUser';
import { Emit, Listen } from './utils/events';
// import { emitLatestJob } from './controllers/socket/jobs';
// import { ChatRoom } from './models/Models';
// import { Op } from 'sequelize';
import { ChatMessage, getContacts, getMsgs, getPrevChats, joinRoom, onConnect, onDisconnect, sendMessage, uploadFile } from './controllers/socket/chat';

let io: Server;

export const initSocket = (httpServer: any) => {
    io = new Server(httpServer, {
        path: '/chat',
        // cors: {
        //     origin: '*',
        //     credentials: true,
        // },

        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"],
            credentials: true,
        },

    });

    io.use(async (socket, next) => {
        console.log('Attempting to connect...')
        await socketAuthorize(socket, next);
    });

    io.on(Listen.CONNECTION, async (socket) => {
        await onConnect(socket)

        socket.on("offer", (offer: any) => socket.broadcast.emit("offer", offer));

        socket.on("answer", (answer: any) => socket.broadcast.emit("answer", answer));

        socket.on("candidate", (candidate: any) => socket.broadcast.emit("candidate", candidate))

        socket.emit(Emit.CONNECTED, socket.id)

        socket.on(Listen.UPLOAD_FILE, (data: any) => uploadFile(io, socket, data));

        socket.on(Listen.SEND_MSG, async (data: ChatMessage) => await sendMessage(io, socket, data));

        socket.on(Listen.DISCONNECT, () => onDisconnect(socket));

        socket.on(Listen.GET_CONTACTS, () => getContacts(io, socket));

        socket.on(Listen.JOIN_ROOM, (data: any) => joinRoom(io, socket, data))

        socket.on(Listen.GET_MSGs, (data: any) => getMsgs(io, socket, data))

        socket.on(Listen.PREV_CHATS, (data: any) => getPrevChats(io, socket, data))
    });

    return io;
}

export const getIO = (): Server => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

