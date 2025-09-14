import { GameState, Card } from '@bluff/shared';

interface Props {
  gameState: GameState;
  myId: string;
  selectedCards: Card[];
  onCardClick: (card: Card) => void;
}

const suitSymbols = {
  HEARTS: '♥',
  DIAMONDS: '♦',
  CLUBS: '♣',
  SPADES: '♠',
};

function CardComponent({
  card,
  isSelected,
  onClick,
}: {
  card: Card;
  isSelected: boolean;
  onClick: () => void;
}) {
  const isRed = card.suit === 'HEARTS' || card.suit === 'DIAMONDS';
  return (
    <div
      className={`flex-shrink-0 w-24 h-36 bg-white border rounded-lg shadow-md flex flex-col justify-between p-2 m-1 cursor-pointer transition-all duration-200 transform hover:-translate-y-2 ${isSelected ? 'border-blue-500 border-4 -translate-y-4' : 'border-gray-300'}`}
      onClick={onClick}
    >
      <div
        className={`text-2xl font-bold ${isRed ? 'text-red-500' : 'text-black'}`}
      >
        {card.rank}
        <span className="ml-1">{suitSymbols[card.suit]}</span>
      </div>
      <div
        className={`text-2xl font-bold self-end transform rotate-180 ${isRed ? 'text-red-500' : 'text-black'}`}
      >
        {card.rank}
        <span className="ml-1">{suitSymbols[card.suit]}</span>
      </div>
    </div>
  );
}

export function Hand({ gameState, myId, selectedCards, onCardClick }: Props) {
  const myPlayer = gameState.players.find((p) => p.id === myId);

  if (!myPlayer) {
    return <div>You are not in this game.</div>;
  }

  return (
    <div className="w-full">
      <div className="flex overflow-x-auto p-4 space-x-2 bg-gray-800 bg-opacity-50 rounded-lg">
        {myPlayer.hand.map((card, i) => (
          <CardComponent
            key={i}
            card={card}
            isSelected={selectedCards.some(
              (c) => c.rank === card.rank && c.suit === card.suit
            )}
            onClick={() => onCardClick(card)}
          />
        ))}
      </div>
    </div>
  );
}
