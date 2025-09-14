import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { ServerToClientEvents, ClientToServerEvents } from '@bluff/shared';
import { Room } from './room';
import authRouter from './auth';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/auth', authRouter);

const server = http.createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST'],
  },
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

interface SocketWithAuth extends Socket {
  room?: string;
  userId?: string;
}

const rooms = new Map<string, Room>();

// Socket.IO authentication middleware
io.use((socket: SocketWithAuth, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error: Token not provided'));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    return next(new Error('Authentication error: Invalid token'));
  }
});

io.on('connection', (socket: SocketWithAuth) => {
  if (!socket.userId) {
    // This should not happen due to the middleware, but as a safeguard:
    return socket.disconnect();
  }
  console.log('a user connected:', socket.userId);
  socket.emit('authenticated', { userId: socket.userId });

  socket.on('joinRoom', async (roomName) => {
    if (!socket.userId) return;

    socket.join(roomName);
    socket.room = roomName;
    console.log(`user ${socket.userId} joined room: ${roomName}`);

    if (!rooms.has(roomName)) {
      rooms.set(roomName, new Room(roomName, { allowPass: true }));
    }

    const room = rooms.get(roomName)!;
    room.addPlayer(socket.userId);

    socket.emit('joinedRoom', {
      userId: socket.userId,
      gameState: room.getGameState(),
    });
    socket.to(roomName).emit('gameUpdated', room.getGameState());
  });

  socket.on('startGame', (starterId) => {
    const roomName = socket.room;
    if (roomName && rooms.has(roomName)) {
      const room = rooms.get(roomName)!;
      room.startGame(starterId);
      io.to(roomName).emit('gameUpdated', room.getGameState());
    }
  });

  socket.on('move', (move) => {
    const roomName = socket.room;
    const userId = socket.userId;
    if (roomName && rooms.has(roomName) && userId) {
      const room = rooms.get(roomName)!;
      const gameState = room.getGameState();

      if (
        move.type !== 'CALL_BLUFF' &&
        gameState.players[gameState.currentPlayerIndex].id !== userId
      ) {
        // It's not this player's turn, and it's not a bluff call.
        // Any player can call a bluff, so we only block other moves.
        return;
      }

      const [newGameState, gameEvents] = room.applyMove(move);
      io.to(roomName).emit('gameUpdated', newGameState);

      for (const event of gameEvents) {
        switch (event.type) {
          case 'PLAYER_EMPTIED_HAND':
            io.to(roomName).emit('playerEmptiedHand', {
              playerId: event.playerId,
            });
            break;
          case 'PILE_TAKEN':
            io.to(roomName).emit('pileTaken', {
              playerId: event.playerId,
              reason: event.reason,
            });
            break;
        }
      }
    }
  });

  socket.on('rematch', () => {
    const roomName = socket.room;
    const userId = socket.userId;
    if (roomName && rooms.has(roomName) && userId) {
      const room = rooms.get(roomName)!;
      room.requestRematch(userId);

      io.to(roomName).emit('rematchStatusUpdate', {
        requestedBy: room.playersWhoRequestedRematch,
      });

      if (room.allPlayersVoted) {
        room.startGame(userId); // The player who completes the vote starts the next game
        io.to(roomName).emit('gameUpdated', room.getGameState());
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.userId);
    const roomName = socket.room;
    const userId = socket.userId;
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
