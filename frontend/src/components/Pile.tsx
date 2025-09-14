import { GameState } from "@bluff/shared";

interface Props {
    gameState: GameState;
}

export function Pile({ gameState }: Props) {
    const pileSize = gameState.pile.length;

    return (
        <div className="my-4 flex flex-col items-center justify-center">
            <div className="relative w-28 h-40">
                {/* Base of the pile */}
                <div className="absolute top-0 left-0 w-full h-full bg-gray-300 border-2 border-gray-400 rounded-lg"></div>

                {/* Visual stack effect */}
                {pileSize > 1 && <div className="absolute top-0 left-0 w-full h-full bg-gray-400 border-2 border-gray-500 rounded-lg transform -translate-x-1 -translate-y-1"></div>}
                {pileSize > 0 && <div className="absolute top-0 left-0 w-full h-full bg-white border-2 border-gray-400 rounded-lg shadow-lg transform -translate-x-2 -translate-y-2 flex items-center justify-center">
                    <span className="text-4xl font-bold text-gray-700">{pileSize}</span>
                </div>}
            </div>
            {gameState.lastMove?.type === 'PLAY' && (
                <div className="mt-4 text-center text-sm text-gray-600">
                    <p>Last move: {gameState.lastMove.payload.cards.length} card(s) declared as <span className="font-bold">{gameState.lastMove.payload.declaredRank}s</span></p>
                </div>
            )}
        </div>
    );
}
