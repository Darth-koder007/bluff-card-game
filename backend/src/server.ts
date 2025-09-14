import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { Move } from '@bluff/shared';
import { ServerToClientEvents, ClientToServerEvents } from '@bluff/shared';
import { Room } from './room';
import { prisma } from './db';

const app = express();
const server = http.createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
    cors: {
        origin: ['http://localhost:5173', 'http://localhost:5174'],
        methods: ['GET', 'POST'],
    }
});

interface SocketWithRoom extends NodeJS.EventEmitter {
    room?: string;
    userId?: string;
}

const rooms = new Map<string, Room>();

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('joinRoom', async (roomName) => {
    socket.join(roomName);
    (socket as SocketWithRoom).room = roomName;
    console.log(`a user joined room: ${roomName}`);

    let user = await prisma.user.findUnique({
        where: { email: socket.id },
    });

    if (!user) {
        user = await prisma.user.create({
            data: { email: socket.id },
        });
    }
    (socket as SocketWithRoom).userId = user.id;

    if (!rooms.has(roomName)) {
        rooms.set(roomName, new Room(roomName, { allowPass: false }));
    }

    const room = rooms.get(roomName)!;
    room.addPlayer(user.id);

    socket.emit('joinedRoom', { userId: user.id, gameState: room.getGameState() });
    socket.to(roomName).emit('gameUpdated', room.getGameState());
  });

  socket.on('startGame', () => {
    const roomName = (socket as SocketWithRoom).room;
    const userId = (socket as SocketWithRoom).userId;
    if (roomName && rooms.has(roomName) && userId) {
        const room = rooms.get(roomName)!;
        room.startGame(userId);
        io.to(roomName).emit('gameUpdated', room.getGameState());
    }
  });

  socket.on('move', (move) => {
    const roomName = (socket as SocketWithRoom).room;
    if (roomName && rooms.has(roomName)) {
        const room = rooms.get(roomName)!;
        const newGameState = room.applyMove(move);
        io.to(roomName).emit('gameUpdated', newGameState);
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    const roomName = (socket as SocketWithRoom).room;
    const userId = (socket as SocketWithRoom).userId;
    if (roomName && rooms.has(roomName) && userId) {
        const room = rooms.get(roomName)!;
        room.removePlayer(userId);
        io.to(roomName).emit('gameUpdated', room.getGameState());
    }
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});