import { GameState } from "@bluff/shared";

interface Props {
    gameState: GameState;
}

export function Pile({ gameState }: Props) {
    return (
        <div>
            <h2 className="text-xl font-bold">Pile</h2>
            <p>Cards in pile: {gameState.pile.length}</p>
            {gameState.lastMove && (
                <p>Last move: {gameState.lastMove.type}</p>
            )}
        </div>
    );
}
