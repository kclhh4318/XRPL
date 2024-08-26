// src/components/MathEquationGame/MathEquationGame.tsx
import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import MathCard from './MathCard';  // .tsx 확장자 제거
import { Card } from '../../types';

const NUMBERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
const SYMBOLS = ['√', '÷', '×', '+', '-'];
const GRADES = ['black', 'bronze', 'silver', 'gold'];

const EquationDisplay: React.FC<{ equation: Card[], result: number | null }> = ({ equation, result }) => (
  <div className="text-3xl font-bold my-4 p-4 bg-white rounded shadow flex items-center justify-center">
    {equation.map((card, index) => (
      <div key={index} className={`w-16 h-24 ${card.color} ${card.grade} flex items-center justify-center mx-1`}>
        <span className="text-4xl font-bold">{card.content}</span>
      </div>
    ))}
    <span className="mx-2">=</span>
    <span>{result !== null ? result.toFixed(2) : '?'}</span>
  </div>
);

const MathEquationGame: React.FC = () => {
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [equation, setEquation] = useState<Card[]>([]);
  const [result, setResult] = useState<number | null>(null);
  const [gamePhase, setGamePhase] = useState<'deal' | 'create' | 'bet' | 'result'>('deal');

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const newDeck = shuffleArray([
      ...NUMBERS.map(num => ({ content: num, color: 'bg-yellow-200', type: 'number' as const, grade: getRandomGrade() })),
      ...SYMBOLS.map(symbol => ({ content: symbol, color: 'bg-red-200', type: 'symbol' as const, grade: getRandomGrade() }))
    ]);
    setDeck(newDeck);
    dealCards(newDeck);
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  const getRandomGrade = (): string => {
    return GRADES[Math.floor(Math.random() * GRADES.length)];
  };

  const dealCards = (deck: Card[]) => {
    const dealtCards = deck.slice(0, 8);
    setPlayerHand([
      ...dealtCards,
      { content: '+', color: 'bg-green-200', type: 'symbol', grade: 'black' },
      { content: '-', color: 'bg-green-200', type: 'symbol', grade: 'black' },
      { content: '÷', color: 'bg-green-200', type: 'symbol', grade: 'black' }
    ]);
    setDeck(deck.slice(8));
    setGamePhase('create');
  };

  const handleCardClick = (card: Card) => {
    if (equation.includes(card)) {
      setEquation(equation.filter(c => c !== card));
    } else {
      setEquation([...equation, card]);
    }
  };

  const calculateResult = () => {
    const equationString = equation.map(card => {
      if (card.content === '√') return 'Math.sqrt';
      if (card.content === '÷') return '/';
      if (card.content === '×') return '*';
      return card.content;
    }).join('');
    try {
      const result = Function(`'use strict'; return (${equationString})`)();
      setResult(Number.isFinite(result) ? result : null);
    } catch (e) {
      setResult(null);
    }
    setGamePhase('bet');
  };

  const renderGamePhase = () => {
    switch (gamePhase) {
      case 'deal':
        return <Button onClick={initializeGame}>Deal Cards</Button>;
      case 'create':
        return (
          <>
            <EquationDisplay equation={equation} result={result} />
            <div className="flex justify-center mt-4">
              <Button onClick={calculateResult} className="mr-2">Calculate</Button>
              <Button onClick={() => setEquation([])} variant="outline">Clear</Button>
            </div>
          </>
        );
      case 'bet':
        return (
          <div className="flex justify-center mt-4">
            <Button onClick={() => setGamePhase('result')} className="mr-2">High</Button>
            <Button onClick={() => setGamePhase('result')} className="mr-2">Low</Button>
            <Button onClick={() => setGamePhase('result')}>Swing</Button>
          </div>
        );
      case 'result':
        return (
          <div className="text-center mt-4">
            <h2 className="text-2xl font-bold">Game Over!</h2>
            <Button onClick={initializeGame} className="mt-2">Play Again</Button>
          </div>
        );
    }
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold mb-6 text-center">Math High-Low Game</h1>
      
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Your Hand:</h2>
        <div className="flex flex-wrap justify-center">
          {playerHand.map((card, index) => (
            <MathCard
              key={index}
              card={card}
              onClick={() => handleCardClick(card)}
              selected={equation.includes(card)}
            />
          ))}
        </div>
      </div>

      {renderGamePhase()}
    </div>
  );
};

export default MathEquationGame;