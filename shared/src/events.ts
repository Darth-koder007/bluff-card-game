import { GameState, Move } from './types';

export interface ServerToClientEvents {
  authenticated: (data: { userId: string }) => void;
  joinedRoom: (data: { userId: string; gameState: GameState }) => void;
  gameUpdated: (gameState: GameState) => void;
  rematchStatusUpdate: (data: { requestedBy: string[] }) => void;
  playerEmptiedHand: (data: { playerId: string }) => void;
  pileTaken: (data: {
    playerId: string;
    reason: 'BLUFF_CALLED_CORRECTLY' | 'BLUFF_CALLED_INCORRECTLY';
  }) => void;
}

export interface ClientToServerEvents {
  move: (move: Move) => void;
  joinRoom: (room: string) => void;
  startGame: (starterId: string) => void;
  rematch: () => void;
}
