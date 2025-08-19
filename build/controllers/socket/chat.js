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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = exports.getPrevChats = exports.getMsgs = exports.joinRoom = exports.getContacts = exports.onDisconnect = exports.onConnect = exports.sendMessage = void 0;
const events_1 = require("../../utils/events");
const Models_1 = require("../../models/Models");
const sequelize_1 = require("sequelize");
const modules_1 = require("../../utils/modules");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const cryptography_1 = require("../../utils/cryptography");
const enum_1 = require("../../utils/enum");
const notification_1 = require("../../services/notification");
const sendMessage = (io, socket, data) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    let room = yield Models_1.ChatRoom.findOne({
        where: {
            name: data.room
        }
    });
    if (!room) {
        return;
    }
    const message = yield Models_1.Message.create({
        text: (0, cryptography_1.encryptMessage)(data.text),
        from: data.from,
        timestamp: new Date(),
        chatroomId: room === null || room === void 0 ? void 0 : room.id
    });
    let to = room.members.split(",").filter((member) => member !== data.from)[0];
    let otherUser = yield Models_1.User.findOne({
        where: {
            id: to
        },
        include: [Models_1.OnlineUser]
    });
    if (otherUser && !otherUser.onlineUser.isOnline) {
        //send push notification
        let user = yield Models_1.User.findOne({
            where: {
                userId: data.from
            },
            include: [Models_1.Profile]
        });
        yield (0, notification_1.sendPushNotification)(otherUser.fcmToken, `${(_a = user === null || user === void 0 ? void 0 : user.profile) === null || _a === void 0 ? void 0 : _a.firstName} ${(_b = user === null || user === void 0 ? void 0 : user.profile) === null || _b === void 0 ? void 0 : _b.lastName} sent you a message`, data.text, {});
    }
    io.to(room.name).emit(events_1.Emit.RECV_MSG, Object.assign(Object.assign({}, data), { timestamp: message.timestamp }));
});
exports.sendMessage = sendMessage;
const onConnect = (socket) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('a user connected', socket.id);
    const [onlineuser, created] = yield Models_1.OnlineUser.findOrCreate({
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
    //global.onlineUsers[socket.user.id] = socket.id
    const chatrooms = yield Models_1.ChatRoom.findAll({
        where: {
            members: {
                [sequelize_1.Op.like]: `%${socket.user.id}%`
            }
        }
    });
    chatrooms.forEach((chatroom) => __awaiter(void 0, void 0, void 0, function* () {
        socket.join(chatroom.name);
    }));
    //emit latest job
    //await emitLatestJob(io, socket);
});
exports.onConnect = onConnect;
const onDisconnect = (socket) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`User disconnected: ${socket.id}`);
    const onlineUser = yield Models_1.OnlineUser.findOne({ where: { userId: socket.user.id } });
    if (onlineUser) {
        onlineUser.isOnline = false;
        onlineUser.lastActive = new Date();
        yield onlineUser.save();
    }
});
exports.onDisconnect = onDisconnect;
const getContacts = (io, socket) => __awaiter(void 0, void 0, void 0, function* () {
    let token = socket.handshake.auth.token;
    const user = socket.user;
    if (!user) {
        return;
    }
    let contacts;
    // if (user.role === UserRole.CLIENT) {
    //     contacts = await User.findAll({
    //         attributes: { exclude: ['password'] },
    //         where: {
    //             [Op.and]: [
    //                 { role: UserRole.PROFESSIONAL },
    //                 { [Op.not]: [{ id: user.id }] }
    //             ],
    //         },
    //         include: [{
    //             model: Profile,
    //             include: [{
    //                 model: Professional,
    //                 include: [Profession]
    //             }]
    //         }, {
    //             model: Location
    //         }]
    //     })
    // } else if (user.role === UserRole.PROFESSIONAL) {
    //     contacts = await User.findAll({
    //         attributes: { exclude: ['password'] },
    //         where: {
    //             [Op.and]: [
    //                 { role: UserRole.CLIENT },
    //                 { [Op.not]: [{ id: user.id }] }
    //             ],
    //         },
    //         include: [{
    //             model: Profile,
    //         }, {
    //             model: Location
    //         }]
    //     })
    // }
    contacts = yield Models_1.User.findAll({
        attributes: { exclude: ['password'] },
        where: {
            [sequelize_1.Op.not]: [{ id: user.id, role: enum_1.UserRole.PROFESSIONAL }]
        },
        include: [{
                model: Models_1.Profile,
                include: [{
                        model: Models_1.Professional,
                        include: [Models_1.Profession]
                    }]
            }, {
                model: Models_1.Location
            }]
    });
    socket.emit(events_1.Emit.ALL_CONTACTS, contacts);
});
exports.getContacts = getContacts;
const joinRoom = (io, socket, data) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("join room", data);
    //get the ids
    let room = yield Models_1.ChatRoom.findOne({
        where: {
            [sequelize_1.Op.and]: [{
                    members: {
                        [sequelize_1.Op.like]: `%${socket.user.id}%`
                    }
                }, {
                    members: {
                        [sequelize_1.Op.like]: `%${data.contactId}%`
                    }
                }],
        }
    });
    if (!room) {
        room = yield Models_1.ChatRoom.create({
            name: (0, modules_1.randomId)(12),
            members: `${socket.user.id},${data.contactId}`
        });
    }
    const existingRoom = io.of("/").adapter.rooms.get(room.name);
    if (!(existingRoom === null || existingRoom === void 0 ? void 0 : existingRoom.has(socket.id)))
        socket.join(room.name);
    const onlineUser = yield Models_1.OnlineUser.findOne({
        where: {
            userId: data.contactId
        }
    });
    if (onlineUser) {
        const sid = onlineUser.socketId;
        if (sid && !(existingRoom === null || existingRoom === void 0 ? void 0 : existingRoom.has(sid))) {
            const userSocket = io.sockets.sockets.get(sid);
            userSocket === null || userSocket === void 0 ? void 0 : userSocket.join(room.name);
        }
    }
    io.to(room.name).emit(events_1.Emit.JOINED_ROOM, room.name);
    console.log("joined room", room.name);
});
exports.joinRoom = joinRoom;
const getMsgs = (io, socket, data) => __awaiter(void 0, void 0, void 0, function* () {
    const chatroom = yield Models_1.ChatRoom.findOne({
        where: {
            name: data.room
        },
        include: [{
                model: Models_1.Message,
            }]
    });
    const members = chatroom === null || chatroom === void 0 ? void 0 : chatroom.members.split(",");
    const normalizedMessages = [];
    chatroom === null || chatroom === void 0 ? void 0 : chatroom.messages.forEach((msg) => {
        normalizedMessages.push({
            to: members === null || members === void 0 ? void 0 : members.filter((member) => member !== msg.from)[0],
            from: msg.from,
            text: (0, cryptography_1.decryptMessage)(msg.text),
            timestamp: msg.timestamp,
        });
    });
    io.to(data.room).emit(events_1.Emit.RECV_MSGs, normalizedMessages);
});
exports.getMsgs = getMsgs;
const getPrevChats = (io, socket, data) => __awaiter(void 0, void 0, void 0, function* () {
    const chatrooms = yield Models_1.ChatRoom.findAll({
        where: {
            members: {
                [sequelize_1.Op.like]: `%${socket.user.id}%`
            }
        }
    });
    const partners = chatrooms.map((room) => {
        const members = room.members.split(",");
        return members.filter((member) => member !== socket.user.id)[0];
    });
    const prevChats = yield Models_1.User.findAll({
        attributes: { exclude: ['password'] },
        where: {
            id: partners
        },
        include: [{
                model: Models_1.Profile,
                include: [{
                        model: Models_1.Professional,
                        include: [Models_1.Profession]
                    }]
            }, {
                model: Models_1.Location
            }, {
                model: Models_1.OnlineUser
            }]
    });
    socket.emit(events_1.Emit.GOT_PREV_CHATS, prevChats);
});
exports.getPrevChats = getPrevChats;
const uploadFile = (io, socket, data) => __awaiter(void 0, void 0, void 0, function* () {
    const { image, fileName } = data;
    const uploadDir = path_1.default.join(__dirname, "../../../public/uploads");
    if (!fs_1.default.existsSync(uploadDir)) {
        fs_1.default.mkdirSync(uploadDir);
    }
    const fileExt = path_1.default.extname(fileName).toLowerCase();
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    const documentExtensions = [".pdf", ".doc", ".docx", ".txt", ".xlsx"];
    let tag = "";
    if (imageExtensions.includes(fileExt)) {
        tag = '<img>';
    }
    else if (documentExtensions.includes(fileExt)) {
        tag = '<doc>';
    }
    const filePath = path_1.default.join(uploadDir, `${Date.now()}-${fileName}`);
    fs_1.default.writeFile(filePath, Buffer.from(image), (err) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            console.error("Error saving image:", err);
            return;
        }
        const imageUrl = `/uploads/${path_1.default.basename(filePath)}`;
        console.log(`Image saved and broadcasted: ${imageUrl}`);
        let room = yield Models_1.ChatRoom.findOne({
            where: {
                name: data.room
            }
        });
        if (!room) {
            return;
        }
        let url = `${tag}${imageUrl}`;
        const message = yield Models_1.Message.create({
            text: (0, cryptography_1.encryptMessage)(url),
            from: data.from,
            timestamp: new Date(),
            chatroomId: room === null || room === void 0 ? void 0 : room.id
        });
        io.to(room.name).emit(events_1.Emit.RECV_FILE, Object.assign(Object.assign({}, message.dataValues), { text: url }));
    }));
});
exports.uploadFile = uploadFile;
