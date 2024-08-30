import React from 'react';
import { Player, Card } from './types';

interface PlayerProps {
  player: Player;
  isCurrentPlayer: boolean;
  showCards: boolean;
}

const PlayerComponent: React.FC<PlayerProps> = ({ player, isCurrentPlayer, showCards }) => {
  return (
    <div className={`p-2 rounded-lg ${isCurrentPlayer ? 'bg-blue-200' : 'bg-gray-200'}`}>
      <div className="font-bold">{player.name}</div>
      <div>Chips: {player.chips}</div>
      <div>Bet: {player.bet}</div>
      {player.nft && (
        <img src={player.nft.image} alt={player.nft.name} className="w-16 h-16 object-cover rounded mt-2" />
      )}
      {showCards && (
        <div className="mt-2">
          {player.hand.map((card: Card, index: number) => (
            <span key={index} className="mr-1">{card.hidden ? '?' : card.content}</span>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlayerComponent;