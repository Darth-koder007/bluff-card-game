import { GameState, Move } from "./types";
export interface ServerToClientEvents {
    joinedRoom: (data: {
        userId: string;
        gameState: GameState;
    }) => void;
    gameUpdated: (gameState: GameState) => void;
}
export interface ClientToServerEvents {
    move: (move: Move) => void;
    joinRoom: (room: string) => void;
    startGame: () => void;
}
