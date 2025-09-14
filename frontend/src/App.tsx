import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { create } from 'zustand';
import { GameState, Move, Card, Rank, RANKS } from '@bluff/shared';
import { ServerToClientEvents, ClientToServerEvents } from '@bluff/shared';
import { Hand } from './components/Hand';
import { Pile } from './components/Pile';
import { Players } from './components/Players';

interface Store {
  gameState: GameState | null;
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  userId: string | null;
  rematchRequestedBy: string[];
  connect: (token: string) => void;
  disconnect: () => void;
  joinRoom: (room: string) => void;
  startGame: () => void;
  makeMove: (move: Move) => void;
  rematch: () => void;
}

const useStore = create<Store>((set, get) => ({
  gameState: null,
  socket: null,
  userId: null,
  rematchRequestedBy: [],
  connect: (token) => {
    const socket = io('http://localhost:3000', {
      auth: { token },
    });
    set({ socket });

    socket.on('connect_error', (err) => {
      console.error(err.message);
      if (err.message.includes('Authentication error')) {
        localStorage.removeItem('session_token');
        window.location.href = '/login';
      }
    });

    socket.on('authenticated', ({ userId }) => {
      set({ userId });
    });

    socket.on('joinedRoom', ({ userId, gameState }) => {
      set({ userId, gameState });
    });

    socket.on('gameUpdated', (gameState) => {
      set({ gameState, rematchRequestedBy: [] });
    });

    socket.on('rematchStatusUpdate', ({ requestedBy }) => {
      set({ rematchRequestedBy: requestedBy });
    });
  },
  disconnect: () => {
    get().socket?.disconnect();
    set({
      socket: null,
      gameState: null,
      userId: null,
      rematchRequestedBy: [],
    });
  },
  joinRoom: (room) => {
    get().socket?.emit('joinRoom', room);
  },
  startGame: () => {
    const starterId = get().userId;
    if (starterId) {
      get().socket?.emit('startGame', starterId);
    }
  },
  makeMove: (move) => {
    get().socket?.emit('move', move);
  },
  rematch: () => {
    get().socket?.emit('rematch');
  },
}));

function App() {
  const navigate = useNavigate();
  const {
    connect,
    disconnect,
    joinRoom,
    startGame,
    gameState,
    makeMove,
    userId,
    rematch,
    rematchRequestedBy,
  } = useStore();
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [declaredRank, setDeclaredRank] = useState<Rank | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('session_token');
    if (!token) {
      navigate('/login');
      return;
    }
    connect(token);

    return () => {
      disconnect();
    };
  }, [connect, disconnect, navigate]);

  const handleCardClick = (card: Card) => {
    if (gameState?.winnerId) return;
    setSelectedCards((prev) =>
      prev.find((c) => c.rank === card.rank && c.suit === card.suit)
        ? prev.filter((c) => !(c.rank === card.rank && c.suit === card.suit))
        : [...prev, card]
    );
  };

  const handlePlay = () => {
    if (!gameState || !userId || selectedCards.length === 0 || !declaredRank)
      return;
    const move: Move = {
      type: 'PLAY',
      payload: { cards: selectedCards, declaredRank },
    };
    makeMove(move);
    setSelectedCards([]);
    setDeclaredRank(null);
  };

  const handleCallBluff = () => {
    makeMove({ type: 'CALL_BLUFF' });
  };

  const handleLogout = () => {
    localStorage.removeItem('session_token');
    disconnect();
    navigate('/login');
  };

  const handleRematch = () => {
    rematch();
  };

  const isMyTurn =
    gameState &&
    userId &&
    gameState.players[gameState.currentPlayerIndex].id === userId;
  const canCallBluff =
    gameState && gameState.lastMove && gameState.lastMove.type === 'PLAY';
  const winner = gameState?.winnerId
    ? gameState.players.find((p) => p.id === gameState.winnerId)
    : null;

  if (!userId) {
    return (
      <div className="bg-green-700 min-h-screen flex items-center justify-center text-white">
        Connecting...
      </div>
    );
  }

  return (
    <main className="bg-green-700 min-h-screen flex flex-col items-center justify-center p-2 md:p-4 font-sans">
      <div className="absolute top-4 right-4">
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-gray-500 text-white font-bold rounded-lg shadow-md hover:bg-gray-600 transition-colors"
        >
          Logout
        </button>
      </div>
      {!gameState ? (
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-8">Bluff</h1>
          <button
            onClick={() => joinRoom('room1')}
            className="px-8 py-4 bg-blue-500 text-white font-bold rounded-lg shadow-xl hover:bg-blue-600 transition-colors text-2xl"
          >
            Join Room
          </button>
        </div>
      ) : (
        <div className="w-full h-full max-w-5xl mx-auto flex flex-col justify-between">
          <div className="w-full">
            <Players gameState={gameState} />
          </div>
          <div className="flex-grow flex flex-col items-center justify-center my-4">
            {winner && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="p-8 bg-white rounded-lg shadow-2xl text-center">
                  <h2 className="text-4xl font-bold mb-4">Game Over!</h2>
                  <p className="text-2xl">
                    Winner is{' '}
                    <span className="font-bold text-green-600">
                      {winner.id === userId ? 'You' : winner.id.substring(0, 8)}
                      !
                    </span>
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={handleRematch}
                      disabled={rematchRequestedBy.includes(userId!)}
                      className="px-6 py-3 bg-blue-500 text-white font-bold rounded-lg shadow-md hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
                    >
                      {rematchRequestedBy.includes(userId!)
                        ? 'Waiting for others...'
                        : 'Rematch'}
                    </button>
                    {gameState && (
                      <div className="mt-4 text-sm">
                        <p>
                          Voted for rematch: {rematchRequestedBy.length} /{' '}
                          {gameState.players.length}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            <Pile gameState={gameState} />
          </div>
          <div className="w-full">
            <div className="p-2 md:p-4 bg-gray-900 bg-opacity-30 rounded-lg flex flex-col items-center space-y-4">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={startGame}
                  disabled={!!winner}
                  className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-sm hover:bg-green-600 disabled:bg-gray-400 transition-colors"
                >
                  Start Game
                </button>
                <button
                  onClick={handlePlay}
                  disabled={
                    !isMyTurn ||
                    selectedCards.length === 0 ||
                    !declaredRank ||
                    !!winner
                  }
                  className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
                >
                  Play Cards
                </button>
                <button
                  onClick={handleCallBluff}
                  disabled={!canCallBluff || !!winner}
                  className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-sm hover:bg-red-600 disabled:bg-gray-400 transition-colors"
                >
                  Call Bluff
                </button>
                {isMyTurn && !winner && (
                  <select
                    onChange={(e) => setDeclaredRank(e.target.value as Rank)}
                    value={declaredRank || ''}
                    className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="" disabled>
                      Declare Rank
                    </option>
                    {RANKS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              {userId && (
                <Hand
                  gameState={gameState}
                  myId={userId}
                  selectedCards={selectedCards}
                  onCardClick={handleCardClick}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
