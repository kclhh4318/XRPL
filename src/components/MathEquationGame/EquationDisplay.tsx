// src/components/MathEquationGame/EquationDisplay.tsx
import React from 'react';

interface EquationDisplayProps {
  equation: string;
  result: number | null;
}

const EquationDisplay: React.FC<EquationDisplayProps> = ({ equation, result }) => (
  <div className="text-3xl font-bold my-4 p-4 bg-white rounded shadow">
    {equation} = {result !== null ? result.toFixed(2) : '?'}
  </div>
);

export default EquationDisplay;