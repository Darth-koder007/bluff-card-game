import { SUITS, RANKS } from './constants';
import { Card, Player, GameState, Move, Rules, GameEvent } from './types';

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
    rankSelectionMode: 'FREE',
  };
}

function getPreviousPlayerIndex(state: GameState): number {
  return (
    (state.currentPlayerIndex - 1 + state.players.length) % state.players.length
  );
}

export function applyMove(
  state: GameState,
  move: Move
): [GameState, GameEvent[]] {
  const gameEvents: GameEvent[] = [];
  if (state.winnerId) return [state, gameEvents]; // Game is already over

  // Check if the previous player's move made them win.
  // This happens if the current move is NOT a challenge.
  if (state.lastMove?.type === 'PLAY' && move.type !== 'CALL_BLUFF') {
    const lastPlayerIndex = getPreviousPlayerIndex(state);
    const lastPlayer = state.players[lastPlayerIndex];
    if (lastPlayer.hand.length === 0) {
      return [{ ...state, winnerId: lastPlayer.id }, gameEvents];
    }
  }

  switch (move.type) {
    case 'PLAY': {
      const player = state.players[state.currentPlayerIndex];

      // Validate declared rank based on rankSelectionMode
      if (
        state.rankSelectionMode === 'FIXED' &&
        move.payload.declaredRank !== state.currentDeclaredRank
      ) {
        return [state, gameEvents]; // Invalid move: declared rank must match current rank
      }

      const newHand = player.hand.filter(
        (card) =>
          !move.payload.cards.some(
            (c) => c.rank === card.rank && c.suit === card.suit
          )
      );

      const newPlayers = [...state.players];
      newPlayers[state.currentPlayerIndex] = { ...player, hand: newHand };

      const newState = {
        ...state,
        players: newPlayers,
        pile: [...state.pile, ...move.payload.cards],
        currentPlayerIndex:
          (state.currentPlayerIndex + 1) % state.players.length,
        lastMove: move,
        currentDeclaredRank: move.payload.declaredRank,
        rankSelectionMode: 'FIXED' as 'FREE' | 'FIXED',
      };

      if (newHand.length === 0) {
        gameEvents.push({ type: 'PLAYER_EMPTIED_HAND', playerId: player.id });
      }

      return [newState, gameEvents];
    }
    case 'CALL_BLUFF': {
      if (!state.lastMove || state.lastMove.type !== 'PLAY') {
        return [state, gameEvents]; // Invalid move
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
        gameEvents.push({
          type: 'PILE_TAKEN',
          playerId: challenger.id,
          reason: 'BLUFF_CALLED_CORRECTLY',
        });

        return [
          {
            ...state,
            players: newPlayers,
            pile: [],
            lastMove: move,
            winnerId: lastPlayer.id,
            currentDeclaredRank: RANKS[0],
            rankSelectionMode: 'FREE',
          },
          gameEvents,
        ];
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
        gameEvents.push({
          type: 'PILE_TAKEN',
          playerId: challenger.id,
          reason: 'BLUFF_CALLED_CORRECTLY',
        });
      } else {
        // Last player takes the pile
        newPlayers[lastPlayerIndex] = {
          ...lastPlayer,
          hand: [...lastPlayer.hand, ...state.pile],
        };
        nextPlayerIndex = lastPlayerIndex;
        gameEvents.push({
          type: 'PILE_TAKEN',
          playerId: lastPlayer.id,
          reason: 'BLUFF_CALLED_INCORRECTLY',
        });
      }

      return [
        {
          ...state,
          players: newPlayers,
          pile: [],
          lastMove: move,
          currentPlayerIndex: nextPlayerIndex,
          currentDeclaredRank: RANKS[0],
          rankSelectionMode: 'FREE',
        },
        gameEvents,
      ];
    }
    case 'PASS': {
      if (!state.rules.allowPass) {
        return [state, gameEvents]; // Invalid move
      }
      if (state.lastMove?.type === 'PASS') {
        return [state, gameEvents]; // Cannot pass if the previous move was also a pass
      }
      return [
        {
          ...state,
          currentPlayerIndex:
            (state.currentPlayerIndex + 1) % state.players.length,
          lastMove: move,
        },
        gameEvents,
      ];
    }
    default:
      return [state, gameEvents];
  }
}
