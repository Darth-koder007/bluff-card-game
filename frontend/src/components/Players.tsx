import { GameState } from "@bluff/shared";

interface Props {
    gameState: GameState;
}

export function Players({ gameState }: Props) {
    return (
        <div>
            <h2 className="text-xl font-bold">Players</h2>
            <ul>
                {gameState.players.map((player, index) => (
                    <li key={player.id} className={index === gameState.currentPlayerIndex ? 'font-bold' : ''}>
                        {player.id}
                    </li>
                ))}
            </ul>
        </div>
    );
}
