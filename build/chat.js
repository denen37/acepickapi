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
const socket_io_1 = require("socket.io");
const chatSocket = (httpServer) => {
    const io = new socket_io_1.Server(httpServer, {
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
    io.on('connection', (socket) => __awaiter(void 0, void 0, void 0, function* () {
        console.log('a user connected', socket.id);
        socket.on('disconnect', () => __awaiter(void 0, void 0, void 0, function* () {
            console.log('A user disconnected', socket.id);
        }));
    }));
    return io;
};
exports.default = chatSocket;
