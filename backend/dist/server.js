"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const shared_1 = require("@bluff/shared");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server);
const rooms = new Map();
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('joinRoom', (room) => {
        socket.join(room);
        console.log(`a user joined room: ${room}`);
        if (!rooms.has(room)) {
            const players = [socket.id];
            // @ts-ignore
            const gameState = (0, shared_1.dealCards)(players, { allowPass: false });
            rooms.set(room, gameState);
        }
        else {
            const gameState = rooms.get(room);
            gameState.players.push({ id: socket.id, hand: [] });
            rooms.set(room, gameState);
        }
        io.to(room).emit('gameState', rooms.get(room));
    });
    socket.on('move', (move) => {
        // apply move and broadcast new game state
    });
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});
server.listen(3000, () => {
    console.log('listening on *:3000');
});
