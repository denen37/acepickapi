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
const authorize_1 = require("./middlewares/authorize");
const OnlineUser_1 = require("./models/OnlineUser");
const chatSocket = (httpServer) => {
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: '*',
            credentials: true,
        },
    });
    io.use((socket, next) => __awaiter(void 0, void 0, void 0, function* () {
        (0, authorize_1.socketAuthorize)(socket, next);
    }));
    io.on('connection', (socket) => __awaiter(void 0, void 0, void 0, function* () {
        console.log('a user connected', socket.id);
        const [onlineuser, created] = yield OnlineUser_1.OnlineUser.findOrCreate({
            where: { userId: socket.user.id },
            defaults: {
                socketId: socket.id,
                lastActive: new Date(),
                isOnline: true,
            }
        });
        if (!created) {
            onlineuser.socketId = socket.id;
            onlineuser.lastActive = new Date();
            onlineuser.isOnline = true;
            yield onlineuser.save();
        }
        socket.on('disconnect', () => __awaiter(void 0, void 0, void 0, function* () {
            console.log('A user disconnected', socket.id);
            const onlineUser = yield OnlineUser_1.OnlineUser.findOne({ where: { userId: socket.user.id } });
            if (onlineUser) {
                onlineUser.isOnline = false;
                onlineUser.lastActive = new Date();
                yield onlineUser.save();
            }
        }));
    }));
    return io;
};
exports.default = chatSocket;
