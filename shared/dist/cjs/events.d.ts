import { GameState, Move } from "./types";
export interface ServerToClientEvents {
    gameState: (gameState: GameState) => void;
}
export interface ClientToServerEvents {
    move: (move: Move) => void;
    joinRoom: (room: string) => void;
}
