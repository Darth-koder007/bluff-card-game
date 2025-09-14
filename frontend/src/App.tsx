import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { create } from 'zustand';
import { GameState, Move } from '@bluff/shared';
import { ServerToClientEvents, ClientToServerEvents } from '@bluff/shared';
import { Hand } from './components/Hand';
import { Pile } from './components/Pile';
import { Players } from './components/Players';

interface Store {
  gameState: GameState | null;
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  connect: () => void;
  joinRoom: (room: string) => void;
  startGame: () => void;
  makeMove: (move: Move) => void;
}

const useStore = create<Store>((set) => ({
  gameState: null,
  socket: null,
  connect: () => {
    const socket = io('http://localhost:3000');
    set({ socket });

    socket.on('gameState', (gameState) => {
      set({ gameState });
    });
  },
  joinRoom: (room) => {
    const socket = useStore.getState().socket;
    if (socket) {
      socket.emit('joinRoom', room);
    }
  },
  startGame: () => {
    const socket = useStore.getState().socket;
    if (socket) {
      socket.emit('startGame');
    }
  },
  makeMove: (move) => {
    const socket = useStore.getState().socket;
    if (socket) {
      socket.emit('move', move);
    }
  },
}));

function App() {
  const { connect, joinRoom, startGame, gameState, makeMove, socket } = useStore();

  useEffect(() => {
    connect();
  }, [connect]);

  const handlePlay = () => {
    if (!gameState || !socket) return;
    const me = gameState.players.find(p => p.id === socket.id);
    if (!me || me.hand.length === 0) return;

    import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { create } from 'zustand';
import { GameState, Move } from '@bluff/shared';
import { ServerToClientEvents, ClientToServerEvents } from '@bluff/shared';
import { Hand } from './components/Hand';
import { Pile } from './components/Pile';
import { Players } from './components/Players';

interface Store {
  gameState: GameState | null;
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  userId: string | null;
  connect: () => void;
  joinRoom: (room: string) => void;
  startGame: () => void;
  makeMove: (move: Move) => void;
}

const useStore = create<Store>((set) => ({
  gameState: null,
  socket: null,
  userId: null,
  connect: () => {
    const socket = io('http://localhost:3000');
    set({ socket });

    socket.on('joinedRoom', ({ userId, gameState }) => {
      set({ userId, gameState });
    });

    socket.on('gameUpdated', (gameState) => {
        set({ gameState });
    });
  },
  joinRoom: (room) => {
    const socket = useStore.getState().socket;
    if (socket) {
      socket.emit('joinRoom', room);
    }
  },
  startGame: () => {
    const socket = useStore.getState().socket;
    if (socket) {
      socket.emit('startGame');
    }
  },
  makeMove: (move) => {
    const socket = useStore.getState().socket;
    if (socket) {
      socket.emit('move', move);
    }
  },
}));

function App() {
  const { connect, joinRoom, startGame, gameState, makeMove, userId } = useStore();

  useEffect(() => {
    connect();
  }, [connect]);

  const handlePlay = () => {
    if (!gameState || !userId) return;
    const me = gameState.players.find(p => p.id === userId);
    if (!me || me.hand.length === 0) return;

    const move: Move = {
        type: 'PLAY',
        payload: { cards: [me.hand[0]], declaredRank: me.hand[0].rank },
    };
    makeMove(move);
  }

  const isMyTurn = gameState && userId && gameState.players[gameState.currentPlayerIndex].id === userId;

  return (
    <div className="App p-4">
      <h1 className="text-3xl font-bold underline mb-4">
        Bluff
      </h1>
      {!gameState ? (
        <div>
            <button onClick={() => joinRoom('room1')}>Join Room 1</button>
        </div>
      ) : (
        <div>
            <div className="mb-4">
                <button onClick={startGame}>Start Game</button>
                <button onClick={handlePlay} disabled={!isMyTurn}>Play Card</button>
            </div>
            <Players gameState={gameState} />
            <Pile gameState={gameState} />
            {userId && <Hand gameState={gameState} myId={userId} />}
        </div>
      )}
    </div>
  )
}

export default App
    makeMove(move);
  }

  const isMyTurn = gameState && socket && gameState.players[gameState.currentPlayerIndex].id === socket.id;

  return (
    <div className="App p-4">
      <h1 className="text-3xl font-bold underline mb-4">
        Bluff
      </h1>
      {!gameState ? (
        <div>
            <button onClick={() => joinRoom('room1')}>Join Room 1</button>
        </div>
      ) : (
        <div>
            <div className="mb-4">
                <button onClick={startGame}>Start Game</button>
                <button onClick={handlePlay} disabled={!isMyTurn}>Play Card</button>
            </div>
            <Players gameState={gameState} />
            <Pile gameState={gameState} />
            {socket && <Hand gameState={gameState} myId={socket.id} />}
        </div>
      )}
    </div>
  )
}

export default App