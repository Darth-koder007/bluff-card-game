import { GameState, Move, Player, Rules, GameEvent } from '@bluff/shared';
import { dealCards, applyMove } from '@bluff/shared';

export class Room {
  private gameState: GameState;
  private players = new Map<string, Player>();
  private rematchRequested = new Set<string>();

  constructor(
    private name: string,
    private rules: Rules
  ) {
    this.gameState = {
      players: [],
      pile: [],
      currentPlayerIndex: 0,
      lastMove: null,
      rules: this.rules,
    };
  }

  addPlayer(playerId: string) {
    const player: Player = { id: playerId, hand: [] };
    this.players.set(playerId, player);
    this.gameState.players.push(player);
  }

  removePlayer(playerId: string) {
    this.players.delete(playerId);
    this.rematchRequested.delete(playerId);
    this.gameState.players = this.gameState.players.filter(
      (p) => p.id !== playerId
    );
  }

  startGame(starterId: string) {
    const playerIds = Array.from(this.players.keys());
    const starterIndex = playerIds.indexOf(starterId);
    if (starterIndex > 0) {
      const [starter] = playerIds.splice(starterIndex, 1);
      playerIds.unshift(starter);
    }
    this.gameState = dealCards(playerIds, this.rules);
    this.resetRematch();
  }

  applyMove(move: Move): [GameState, GameEvent[]] {
    const [newGameState, gameEvents] = applyMove(this.gameState, move);
    this.gameState = newGameState;
    return [newGameState, gameEvents];
  }

  getGameState(): GameState {
    return this.gameState;
  }

  requestRematch(playerId: string) {
    this.rematchRequested.add(playerId);
  }

  get playersWhoRequestedRematch(): string[] {
    return Array.from(this.rematchRequested);
  }

  get allPlayersVoted(): boolean {
    return (
      this.players.size > 0 && this.rematchRequested.size === this.players.size
    );
  }

  resetRematch() {
    this.rematchRequested.clear();
  }

  getPlayerCount(): number {
    return this.players.size;
  }
}
