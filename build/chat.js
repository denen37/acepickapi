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
exports.getIO = exports.initSocket = void 0;
// import config from './config/configSetup';
const socket_io_1 = require("socket.io");
const authorize_1 = require("./middlewares/authorize");
// import { OnlineUser } from './models/OnlineUser';
const events_1 = require("./utils/events");
// import { emitLatestJob } from './controllers/socket/jobs';
// import { ChatRoom } from './models/Models';
// import { Op } from 'sequelize';
const chat_1 = require("./controllers/socket/chat");
const OnlineUser_1 = require("./models/OnlineUser");
let io;
const initSocket = (httpServer) => {
    io = new socket_io_1.Server(httpServer, {
        path: '/chat',
        cors: {
            origin: "*", // not allowed
            // credentials: true,
        }
    });
    io.use((socket, next) => __awaiter(void 0, void 0, void 0, function* () {
        console.log('Attempting to connect...');
        yield (0, authorize_1.socketAuthorize)(socket, next);
    }));
    io.on("connection_error", (err) => {
        console.error("Connection error:", err);
    });
    io.on(events_1.Listen.CONNECTION, (socket) => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, chat_1.onConnect)(socket);
        socket.emit(events_1.Emit.CONNECTED, socket.id);
        socket.on('call-user', (data) => __awaiter(void 0, void 0, void 0, function* () {
            console.log('call-user', data);
            const partner = yield OnlineUser_1.OnlineUser.findOne({ where: { userId: data.to } });
            if (!partner)
                return;
            io.to(partner === null || partner === void 0 ? void 0 : partner.socketId).emit('call-made', {
                offer: data.offer,
                from: socket.user.id,
            });
        }));
        // Answering the call
        socket.on('make-answer', (data) => __awaiter(void 0, void 0, void 0, function* () {
            const partner = yield OnlineUser_1.OnlineUser.findOne({ where: { userId: data.to } });
            if (!partner)
                return;
            io.to(partner.socketId).emit('answer-made', {
                answer: data.answer,
                from: socket.user.id,
            });
        }));
        // Exchange ICE candidates
        socket.on('ice-candidate', (data) => __awaiter(void 0, void 0, void 0, function* () {
            const partner = yield OnlineUser_1.OnlineUser.findOne({ where: { userId: data.to } });
            if (!partner)
                return;
            io.to(partner.socketId).emit('ice-candidate', {
                candidate: data.candidate,
                from: socket.user.id,
            });
        }));
        socket.on('end-call', (data) => __awaiter(void 0, void 0, void 0, function* () {
            const partner = yield OnlineUser_1.OnlineUser.findOne({ where: { userId: data.to } });
            if (!partner)
                return;
            io.to(partner.socketId).emit('call-ended', {
                from: socket.user.id,
            });
        }));
        socket.on('reject-call', (data) => __awaiter(void 0, void 0, void 0, function* () {
            const partner = yield OnlineUser_1.OnlineUser.findOne({ where: { userId: data.to } });
            if (!partner)
                return;
            io.to(partner.socketId).emit('call-rejected', {
                from: socket.user.id,
            });
        }));
        //Video call
        socket.on('video-call-user', (data) => __awaiter(void 0, void 0, void 0, function* () {
            console.log('video-call-user', data);
            const partner = yield OnlineUser_1.OnlineUser.findOne({ where: { userId: data.to } });
            if (!partner)
                return;
            io.to(partner === null || partner === void 0 ? void 0 : partner.socketId).emit('video-call-made', {
                offer: data.offer,
                from: socket.user.id,
            });
        }));
        // Answering the call
        socket.on('video-make-answer', (data) => __awaiter(void 0, void 0, void 0, function* () {
            const partner = yield OnlineUser_1.OnlineUser.findOne({ where: { userId: data.to } });
            if (!partner)
                return;
            io.to(partner.socketId).emit('video-answer-made', {
                answer: data.answer,
                from: socket.user.id,
            });
        }));
        // Exchange ICE candidates
        socket.on('video-ice-candidate', (data) => __awaiter(void 0, void 0, void 0, function* () {
            const partner = yield OnlineUser_1.OnlineUser.findOne({ where: { userId: data.to } });
            if (!partner)
                return;
            io.to(partner.socketId).emit('video-ice-candidate', {
                candidate: data.candidate,
                from: socket.user.id,
            });
        }));
        socket.on('video-end-call', (data) => __awaiter(void 0, void 0, void 0, function* () {
            const partner = yield OnlineUser_1.OnlineUser.findOne({ where: { userId: data.to } });
            if (!partner)
                return;
            io.to(partner.socketId).emit('video-call-ended', {
                from: socket.user.id,
            });
        }));
        socket.on('video-reject-call', (data) => __awaiter(void 0, void 0, void 0, function* () {
            const partner = yield OnlineUser_1.OnlineUser.findOne({ where: { userId: data.to } });
            if (!partner)
                return;
            io.to(partner.socketId).emit('video-call-rejected', {
                from: socket.user.id,
            });
        }));
        socket.on(events_1.Listen.UPLOAD_FILE, (data) => (0, chat_1.uploadFile)(io, socket, data));
        socket.on(events_1.Listen.SEND_MSG, (data) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, chat_1.sendMessage)(io, socket, data); }));
        socket.on(events_1.Listen.DISCONNECT, () => (0, chat_1.onDisconnect)(socket));
        socket.on(events_1.Listen.GET_CONTACTS, () => (0, chat_1.getContacts)(io, socket));
        socket.on(events_1.Listen.JOIN_ROOM, (data) => (0, chat_1.joinRoom)(io, socket, data));
        socket.on(events_1.Listen.GET_MSGs, (data) => (0, chat_1.getMsgs)(io, socket, data));
        socket.on(events_1.Listen.PREV_CHATS, (data) => (0, chat_1.getPrevChats)(io, socket, data));
    }));
    return io;
};
exports.initSocket = initSocket;
const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};
exports.getIO = getIO;
