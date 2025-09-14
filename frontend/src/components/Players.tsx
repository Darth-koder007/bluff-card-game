import { GameState } from "@bluff/shared";

interface Props {
    gameState: GameState;
}

export function Players({ gameState }: Props) {
    return (
        <div className="w-full px-4">
            <div className="flex justify-center items-center flex-wrap gap-4">
                {gameState.players.map((player, index) => (
                    <div key={player.id} 
                         className={`p-3 md:p-4 border-2 rounded-lg text-center transition-all duration-300 w-24 md:w-32 ${index === gameState.currentPlayerIndex ? 'border-blue-500 bg-blue-100 scale-105 shadow-lg' : 'border-gray-300 bg-gray-50'}`}>
                        <div className="font-bold text-sm md:text-lg truncate">{player.id.substring(0, 8)}</div>
                        <div className="text-xs md:text-sm text-gray-600">{player.hand.length} cards</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
