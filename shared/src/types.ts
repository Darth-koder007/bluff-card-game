import { SUITS, RANKS } from './constants';

export type Suit = (typeof SUITS)[number];
export type Rank = (typeof RANKS)[number];

export interface Card {
  suit: Suit;
  rank: Rank;
}

export interface Player {
  id: string;
  hand: Card[];
}

export interface Rules {
  allowPass: boolean;
}

export interface GameState {
  players: Player[];
  pile: Card[];
  currentPlayerIndex: number;
  lastMove: Move | null;
  rules: Rules;
  winnerId?: string;
  currentDeclaredRank: Rank;
  expectedRank: Rank | null;
}

export type Move =
  | { type: 'PLAY'; payload: { cards: Card[]; declaredRank: Rank } }
  | { type: 'PASS' }
  | { type: 'CALL_BLUFF' };

export type GameEvent =
  | { type: 'PLAYER_EMPTIED_HAND'; playerId: string }
  | {
      type: 'PILE_TAKEN';
      takerId: string;
      blufferId: string;
      challengerId: string;
      bluffWasTruthful: boolean;
    };
