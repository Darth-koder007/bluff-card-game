import { GameState, Move, Player, Rules } from "@bluff/shared";
import { dealCards, applyMove } from "@bluff/shared";

export class Room {
    private gameState: GameState;
    private players = new Map<string, Player>();

    constructor(private name: string, private rules: Rules) {
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
        this.gameState.players = this.gameState.players.filter(p => p.id !== playerId);
    }

    startGame(starterId: string) {
        const playerIds = Array.from(this.players.keys());
        const starterIndex = playerIds.indexOf(starterId);
        if (starterIndex > 0) {
            const [starter] = playerIds.splice(starterIndex, 1);
            playerIds.unshift(starter);
        }
        this.gameState = dealCards(playerIds, this.rules);
    }

    applyMove(move: Move): GameState {
        this.gameState = applyMove(this.gameState, move);
        return this.gameState;
    }

    getGameState(): GameState {
        return this.gameState;
    }
}
