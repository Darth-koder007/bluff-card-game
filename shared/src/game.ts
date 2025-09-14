import { SUITS, RANKS } from './constants';
import { Card, Player, GameState, Move, Rules } from './types';

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank });
    }
  }
  return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function dealCards(playerIds: string[], rules: Rules): GameState {
  const deck = shuffleDeck(createDeck());
  const players: Player[] = playerIds.map(id => ({ id, hand: [] }));

  let cardIndex = 0;
  while (cardIndex < deck.length) {
    for (const player of players) {
      if (cardIndex < deck.length) {
        player.hand.push(deck[cardIndex++]);
      }
    }
  }

  return {
    players,
    pile: [],
    currentPlayerIndex: 0,
    lastMove: null,
    rules,
  };
}

function getPreviousPlayerIndex(state: GameState): number {
    return (state.currentPlayerIndex - 1 + state.players.length) % state.players.length;
}

export function applyMove(state: GameState, move: Move): GameState {
  switch (move.type) {
    case 'PLAY': {
      const player = state.players[state.currentPlayerIndex];
      const newHand = player.hand.filter(card => 
        !move.payload.cards.some(c => c.rank === card.rank && c.suit === card.suit)
      );

      const newPlayers = [...state.players];
      newPlayers[state.currentPlayerIndex] = { ...player, hand: newHand };

      return {
        ...state,
        players: newPlayers,
        pile: [...state.pile, ...move.payload.cards],
        currentPlayerIndex: (state.currentPlayerIndex + 1) % state.players.length,
        lastMove: move,
      };
    }
    case 'CALL_BLUFF': {
        if (!state.lastMove || state.lastMove.type !== 'PLAY') {
            return state; // Invalid move
        }

        const lastMove = state.lastMove;
        const lastPlayerIndex = getPreviousPlayerIndex(state);
        const lastPlayer = state.players[lastPlayerIndex];

        const allCardsMatch = lastMove.payload.cards.every(c => c.rank === lastMove.payload.declaredRank);

        const newPlayers = [...state.players];

        if (allCardsMatch) {
            // Challenger takes the pile
            const challenger = state.players[state.currentPlayerIndex];
            newPlayers[state.currentPlayerIndex] = { ...challenger, hand: [...challenger.hand, ...state.pile] };
        } else {
            // Last player takes the pile
            newPlayers[lastPlayerIndex] = { ...lastPlayer, hand: [...lastPlayer.hand, ...state.pile] };
        }

        return {
            ...state,
            players: newPlayers,
            pile: [],
            lastMove: move,
        };
    }
    case 'PASS': {
        if (!state.rules.allowPass) {
            return state; // Invalid move
        }
        return {
            ...state,
            currentPlayerIndex: (state.currentPlayerIndex + 1) % state.players.length,
            lastMove: move,
        };
    }
    default:
      return state;
  }
}
