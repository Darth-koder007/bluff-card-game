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
  const players: Player[] = playerIds.map((id) => ({ id, hand: [] }));

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
    currentDeclaredRank: RANKS[0],
  };
}

function getPreviousPlayerIndex(state: GameState): number {
  return (
    (state.currentPlayerIndex - 1 + state.players.length) % state.players.length
  );
}

export function applyMove(state: GameState, move: Move): GameState {
  if (state.winnerId) return state; // Game is already over

  // Check if the previous player's move made them win.
  // This happens if the current move is NOT a challenge.
  if (state.lastMove?.type === 'PLAY' && move.type !== 'CALL_BLUFF') {
    const lastPlayerIndex = getPreviousPlayerIndex(state);
    const lastPlayer = state.players[lastPlayerIndex];
    if (lastPlayer.hand.length === 0) {
      return { ...state, winnerId: lastPlayer.id };
    }
  }

  switch (move.type) {
    case 'PLAY': {
      const player = state.players[state.currentPlayerIndex];
      const newHand = player.hand.filter(
        (card) =>
          !move.payload.cards.some(
            (c) => c.rank === card.rank && c.suit === card.suit
          )
      );

      const newPlayers = [...state.players];
      newPlayers[state.currentPlayerIndex] = { ...player, hand: newHand };

      const nextRankIndex =
        (RANKS.indexOf(state.currentDeclaredRank) + 1) % RANKS.length;

      return {
        ...state,
        players: newPlayers,
        pile: [...state.pile, ...move.payload.cards],
        currentPlayerIndex:
          (state.currentPlayerIndex + 1) % state.players.length,
        lastMove: {
          ...move,
          payload: {
            ...move.payload,
            declaredRank: state.currentDeclaredRank,
          },
        },
        currentDeclaredRank: RANKS[nextRankIndex],
      };
    }
    case 'CALL_BLUFF': {
      if (!state.lastMove || state.lastMove.type !== 'PLAY') {
        return state; // Invalid move
      }

      const lastMove = state.lastMove;
      const lastPlayerIndex = getPreviousPlayerIndex(state);
      const lastPlayer = state.players[lastPlayerIndex];

      const allCardsMatch = lastMove.payload.cards.every(
        (c) => c.rank === lastMove.payload.declaredRank
      );

      // If the last player's hand is empty and they were telling the truth, they win.
      if (lastPlayer.hand.length === 0 && allCardsMatch) {
        const newPlayers = [...state.players];
        const challenger = state.players[state.currentPlayerIndex];
        newPlayers[state.currentPlayerIndex] = {
          ...challenger,
          hand: [...challenger.hand, ...state.pile],
        };

        return {
          ...state,
          players: newPlayers,
          pile: [],
          lastMove: move,
          winnerId: lastPlayer.id,
        };
      }

      const newPlayers = [...state.players];
      let nextPlayerIndex;

      if (allCardsMatch) {
        // Challenger takes the pile
        const challenger = state.players[state.currentPlayerIndex];
        newPlayers[state.currentPlayerIndex] = {
          ...challenger,
          hand: [...challenger.hand, ...state.pile],
        };
        nextPlayerIndex = state.currentPlayerIndex;
      } else {
        // Last player takes the pile
        newPlayers[lastPlayerIndex] = {
          ...lastPlayer,
          hand: [...lastPlayer.hand, ...state.pile],
        };
        nextPlayerIndex = lastPlayerIndex;
      }

      return {
        ...state,
        players: newPlayers,
        pile: [],
        lastMove: move,
        currentPlayerIndex: nextPlayerIndex,
      };
    }
    case 'PASS': {
      if (!state.rules.allowPass) {
        return state; // Invalid move
      }
      return {
        ...state,
        currentPlayerIndex:
          (state.currentPlayerIndex + 1) % state.players.length,
        lastMove: move,
      };
    }
    default:
      return state;
  }
}
