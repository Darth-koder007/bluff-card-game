import { createDeck, shuffleDeck, dealCards, applyMove } from '../src/game';
import { RANKS } from '../src/constants';
import { GameState, Move, Rules } from '../src/types';

describe('Game Engine', () => {
  const rules: Rules = { allowPass: true };

  describe('createDeck', () => {
    it('should create a deck of 52 cards', () => {
      const deck = createDeck();
      expect(deck.length).toBe(52);
    });
  });

  describe('shuffleDeck', () => {
    it('should shuffle the deck', () => {
      const deck = createDeck();
      const shuffled = shuffleDeck([...deck]);
      expect(shuffled).not.toEqual(deck);
      expect(shuffled.length).toBe(52);
    });
  });

  describe('dealCards', () => {
    it('should deal cards to players', () => {
      const playerIds = ['a', 'b', 'c'];
      const gameState = dealCards(playerIds, rules);
      expect(gameState.players.length).toBe(3);
      expect(gameState.players[0].hand.length).toBe(18);
      expect(gameState.players[1].hand.length).toBe(17);
      expect(gameState.players[2].hand.length).toBe(17);
      expect(gameState.rules).toEqual(rules);
    });
  });

  describe('applyMove', () => {
    const baseState: GameState = {
        players: [
          { id: 'a', hand: [{ suit: 'CLUBS', rank: 'A' }, { suit: 'HEARTS', rank: '2' }] },
          { id: 'b', hand: [] },
        ],
        pile: [],
        currentPlayerIndex: 0,
        lastMove: null,
        rules: rules,
        currentDeclaredRank: RANKS[0],
        expectedRank: null
      };

    it('should apply a PLAY move', () => {
      const move: Move = {
        type: 'PLAY',
        payload: { cards: [{ suit: 'CLUBS', rank: 'A' }], declaredRank: 'A' },
      };

      const [newState] = applyMove(baseState, move);

      expect(newState.players[0].hand.length).toBe(1);
      expect(newState.pile.length).toBe(1);
      expect(newState.currentPlayerIndex).toBe(1);
      expect(newState.lastMove).toEqual(move);
    });

    it('should apply a CALL_BLUFF move (bluff caught)', () => {
        const lastMove: Move = {
            type: 'PLAY',
            payload: { cards: [{ suit: 'CLUBS', rank: 'A' }], declaredRank: 'K' },
        };
        const initialState: GameState = {
            ...baseState,
            players: [
              { id: 'a', hand: [] },
              { id: 'b', hand: [] },
            ],
            pile: [{ suit: 'CLUBS', rank: 'A' }],
            currentPlayerIndex: 1,
            lastMove: lastMove,
          };
    
          const move: Move = { type: 'CALL_BLUFF' };
    
          const [newState] = applyMove(initialState, move);
    
          expect(newState.players[0].hand.length).toBe(1);
          expect(newState.players[1].hand.length).toBe(0);
          expect(newState.pile.length).toBe(0);
          expect(newState.lastMove).toEqual(move);
    });

    it('should apply a CALL_BLUFF move (no bluff)', () => {
        const lastMove: Move = {
            type: 'PLAY',
            payload: { cards: [{ suit: 'CLUBS', rank: 'A' }], declaredRank: 'A' },
        };
        const initialState: GameState = {
            ...baseState,
            players: [
              { id: 'a', hand: [] },
              { id: 'b', hand: [] },
            ],
            pile: [{ suit: 'CLUBS', rank: 'A' }],
            currentPlayerIndex: 1,
            lastMove: lastMove,
          };
    
          const move: Move = { type: 'CALL_BLUFF' };
    
          const [newState] = applyMove(initialState, move);
    
          expect(newState.players[0].hand.length).toBe(0);
          expect(newState.players[1].hand.length).toBe(1);
          expect(newState.pile.length).toBe(0);
          expect(newState.lastMove).toEqual(move);
    });

    it('should apply a PASS move', () => {
        const move: Move = { type: 'PASS' };
  
        const [newState] = applyMove(baseState, move);
  
        expect(newState.currentPlayerIndex).toBe(1);
        expect(newState.lastMove).toEqual(move);
      });

      it('should not apply a PASS move if not allowed', () => {
        const move: Move = { type: 'PASS' };
        const state = { ...baseState, rules: { allowPass: false } };
  
        const [newState] = applyMove(state, move);
  
        expect(newState).toEqual(state);
      });
  });
});
