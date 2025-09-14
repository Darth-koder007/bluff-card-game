import { useEffect, useState } from 'react';
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
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [declaredRank, setDeclaredRank] = useState<Rank | null>(null);

  useEffect(() => {
    connect();
    // Clean up the console.log from debugging
    return () => {};
  }, [connect]);

  const handleCardClick = (card: Card) => {
    if (gameState?.winnerId) return; // Don't allow changes if game is over
    setSelectedCards(prev => 
      prev.find(c => c.rank === card.rank && c.suit === card.suit) 
        ? prev.filter(c => !(c.rank === card.rank && c.suit === card.suit))
        : [...prev, card]
    );
  };

  const handlePlay = () => {
    if (!gameState || !userId || selectedCards.length === 0 || !declaredRank) return;

    const move: Move = {
        type: 'PLAY',
        payload: { cards: selectedCards, declaredRank },
    };
    makeMove(move);
    setSelectedCards([]);
    setDeclaredRank(null);
  }

  const handleCallBluff = () => {
    const move: Move = { type: 'CALL_BLUFF' };
    makeMove(move);
  }

  const handlePass = () => {
    const move: Move = { type: 'PASS' };
    makeMove(move);
  }

  const isMyTurn = gameState && userId && gameState.players[gameState.currentPlayerIndex].id === userId;
  const canCallBluff = gameState && gameState.lastMove && gameState.lastMove.type === 'PLAY';

  const winner = gameState?.winnerId ? gameState.players.find(p => p.id === gameState.winnerId) : null;

  return (
    <main className="bg-green-700 min-h-screen flex flex-col items-center justify-center p-2 md:p-4 font-sans">
      {!gameState ? (
        <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-8">Bluff</h1>
            <button onClick={() => joinRoom('room1')} className="px-8 py-4 bg-blue-500 text-white font-bold rounded-lg shadow-xl hover:bg-blue-600 transition-colors text-2xl">Join Room</button>
        </div>
      ) : (
        <div className="w-full h-full max-w-5xl mx-auto flex flex-col justify-between">
          {/* Opponents Area */}
          <div className="w-full">
            <Players gameState={gameState} />
          </div>

          {/* Table Center Area */}
          <div className="flex-grow flex flex-col items-center justify-center my-4">
            {winner && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="p-8 bg-white rounded-lg shadow-2xl text-center">
                        <h2 className="text-4xl font-bold mb-4">Game Over!</h2>
                        <p className="text-2xl">Winner is <span className="font-bold text-green-600">{winner.id === userId ? 'You' : winner.id.substring(0, 8)}!</span></p>
                    </div>
                </div>
            )}
            <Pile gameState={gameState} />
          </div>

          {/* Player Area */}
          <div className="w-full">
            <div className="p-2 md:p-4 bg-gray-900 bg-opacity-30 rounded-lg flex flex-col items-center space-y-4">
              <div className="flex flex-wrap items-center justify-center gap-2">
                  <button onClick={startGame} disabled={!!winner} className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-sm hover:bg-green-600 disabled:bg-gray-400 transition-colors">Start Game</button>
                  <button onClick={handlePlay} disabled={!isMyTurn || selectedCards.length === 0 || !declaredRank || !!winner} className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-600 disabled:bg-gray-400 transition-colors">Play Cards</button>
                  <button onClick={handleCallBluff} disabled={!canCallBluff || !!winner} className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-sm hover:bg-red-600 disabled:bg-gray-400 transition-colors">Call Bluff</button>
                  {isMyTurn && !winner && (
                      <select onChange={(e) => setDeclaredRank(e.target.value as Rank)} value={declaredRank || ''} className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="" disabled>Declare Rank</option>
                          {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                  )}
              </div>
              {userId && <Hand gameState={gameState} myId={userId} selectedCards={selectedCards} onCardClick={handleCardClick} />}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default App