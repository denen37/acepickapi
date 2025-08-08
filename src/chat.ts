// import config from './config/configSetup';
import { Server } from 'socket.io';
import { socketAuthorize } from './middlewares/authorize';
// import { OnlineUser } from './models/OnlineUser';
import { Emit, Listen } from './utils/events';
// import { emitLatestJob } from './controllers/socket/jobs';
// import { ChatRoom } from './models/Models';
// import { Op } from 'sequelize';
import { ChatMessage, getContacts, getMsgs, getPrevChats, joinRoom, onConnect, onDisconnect, sendMessage, uploadFile } from './controllers/socket/chat';
import { OnlineUser } from './models/OnlineUser';

let io: Server;

export const initSocket = (httpServer: any) => {
    io = new Server(httpServer, {
        path: '/chat',
        cors: {
            origin: "*",          // not allowed
            // credentials: true,
        }

    });

    io.use(async (socket, next) => {
        console.log('Attempting to connect...')
        await socketAuthorize(socket, next);
    });

    io.on("connection_error", (err) => {
        console.error("Connection error:", err);
    });


    io.on(Listen.CONNECTION, async (socket) => {
        await onConnect(socket)

        socket.emit(Emit.CONNECTED, socket.id)


        socket.on('call-user', async (data: any) => {
            const partner = await OnlineUser.findOne({ where: { userId: data.to } })

            if (!partner) return

            io.to(partner?.socketId).emit('call-made', {
                offer: data.offer,
                from: socket.user.id,
            });
        });

        // Answering the call
        socket.on('make-answer', async (data: any) => {
            const partner = await OnlineUser.findOne({ where: { userId: data.to } })

            if (!partner) return

            io.to(partner.socketId).emit('answer-made', {
                answer: data.answer,
                from: socket.user.id,
            });
        });

        // Exchange ICE candidates
        socket.on('ice-candidate', async (data: any) => {
            const partner = await OnlineUser.findOne({ where: { userId: data.to } })

            if (!partner) return

            io.to(partner.socketId).emit('ice-candidate', {
                candidate: data.candidate,
                from: socket.user.id,
            });
        });

        socket.on('end-call', async (data: any) => {
            const partner = await OnlineUser.findOne({ where: { userId: data.to } })

            if (!partner) return

            io.to(partner.socketId).emit('call-ended', {
                from: socket.user.id,
            });
        })

        socket.on('reject-call', async (data: any) => {
            const partner = await OnlineUser.findOne({ where: { userId: data.to } })

            if (!partner) return

            io.to(partner.socketId).emit('call-rejected', {
                from: socket.user.id,
            })
        })

        //Video call
        socket.on('video-call-user', async (data: any) => {
            const partner = await OnlineUser.findOne({ where: { userId: data.to } })

            if (!partner) return


            io.to(partner?.socketId).emit('video-call-made', {
                offer: data.offer,
                from: socket.user.id,
            });
        });

        // Answering the call
        socket.on('video-make-answer', async (data: any) => {
            const partner = await OnlineUser.findOne({ where: { userId: data.to } })

            if (!partner) return

            io.to(partner.socketId).emit('video-answer-made', {
                answer: data.answer,
                from: socket.user.id,
            });
        });

        // Exchange ICE candidates
        socket.on('video-ice-candidate', async (data: any) => {
            const partner = await OnlineUser.findOne({ where: { userId: data.to } })

            if (!partner) return

            io.to(partner.socketId).emit('video-ice-candidate', {
                candidate: data.candidate,
                from: socket.user.id,
            });
        });

        socket.on('video-end-call', async (data: any) => {
            const partner = await OnlineUser.findOne({ where: { userId: data.to } })

            if (!partner) return

            io.to(partner.socketId).emit('video-call-ended', {
                from: socket.user.id,
            });
        })

        socket.on('video-reject-call', async (data: any) => {
            const partner = await OnlineUser.findOne({ where: { userId: data.to } })

            if (!partner) return

            io.to(partner.socketId).emit('video-call-rejected', {
                from: socket.user.id,
            })
        })


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

