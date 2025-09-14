import { GameState, Card } from "@bluff/shared";

interface Props {
    gameState: GameState;
    myId: string;
}

function CardComponent({ card }: { card: Card }) {
    return (
        <div className="border p-2 m-1">
            {card.rank} of {card.suit}
        </div>
    );
}

export function Hand({ gameState, myId }: Props) {
    const me = gameState.players.find(p => p.id === myId);

    if (!me) {
        return <div>You are not in this game.</div>;
    }

    return (
        <div>
            <h2 className="text-xl font-bold">Your Hand</h2>
            <div className="flex">
                {me.hand.map((card, i) => (
                    <CardComponent key={i} card={card} />
                ))}
            </div>
        </div>
    );
}
