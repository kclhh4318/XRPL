// src/components/MathEquationGame/MathCard.tsx
import React from 'react';
import { Card } from '../../types';

interface MathCardProps {
  card: Card;
  onClick: () => void;
  selected: boolean;
}

const MathCard: React.FC<MathCardProps> = ({ card, onClick, selected }) => (
  <div 
    className={`w-16 h-24 bg-white rounded-lg shadow-md flex items-center justify-center m-2 cursor-pointer ${card.color} ${card.grade} ${selected ? 'ring-2 ring-blue-500' : ''}`}
    onClick={onClick}
  >
    <span className="text-4xl font-bold">{card.content}</span>
  </div>
);

export default MathCard;