import { Card, GameState, Move, Rules } from './types';
export declare function createDeck(): Card[];
export declare function shuffleDeck(deck: Card[]): Card[];
export declare function dealCards(playerIds: string[], rules: Rules): GameState;
export declare function applyMove(state: GameState, move: Move): GameState;
