import React, { useState } from 'react';
import Button from '../ui/Button';
import { Player } from './types';

interface BettingControlsProps {
  onFold: () => void;
  onCall: () => void;
  onRaise: (amount: number) => void;
  currentPlayer: Player;
  maxBet: number;
}

const BettingControls: React.FC<BettingControlsProps> = ({ onFold, onCall, onRaise, currentPlayer, maxBet }) => {
  const [raiseAmount, setRaiseAmount] = useState(maxBet * 2);

  return (
    <div className="fixed bottom-4 right-4 flex items-center space-x-2">
      <Button onClick={onFold}>Fold</Button>
      <Button onClick={onCall}>Call {maxBet - currentPlayer.bet}</Button>
      <input
        type="number"
        value={raiseAmount}
        onChange={(e) => setRaiseAmount(Number(e.target.value))}
        className="w-20 p-2 border rounded"
      />
      <Button onClick={() => onRaise(raiseAmount)}>Raise</Button>
    </div>
  );
};

export default BettingControls;