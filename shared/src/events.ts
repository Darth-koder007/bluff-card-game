import { GameState, Move } from "./types";

export interface ServerToClientEvents {
  authenticated: (data: { userId: string }) => void;
  joinedRoom: (data: { userId: string, gameState: GameState }) => void;
  gameUpdated: (gameState: GameState) => void;
}

export interface ClientToServerEvents {
  move: (move: Move) => void;
  joinRoom: (room: string) => void;
  startGame: (starterId: string) => void;
}
