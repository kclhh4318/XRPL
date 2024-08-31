// src/utils/gameUtils.ts
import { Card } from '../types';

const NUMBERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
const SYMBOLS = ['√', '÷', '×', '+', '-'];
const GRADES = ['black', 'bronze', 'silver', 'gold'];

export const shuffleArray = <T>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

export const initializeDeck = (): Card[] => {
  const deck = [
    ...NUMBERS.map(num => ({ content: num, color: 'bg-yellow-200', type: 'number' as const })),
    ...SYMBOLS.map(symbol => ({ content: symbol, color: 'bg-red-200', type: 'symbol' as const }))
  ].map(card => ({ ...card, grade: GRADES[Math.floor(Math.random() * GRADES.length)] }));
  return shuffleArray(deck);
};

export const dealCards = (deck: Card[], count: number): Card[] => {
  return deck.slice(0, count);
};

export const evaluateEquation = (equation: string): number | null => {
  try {
    const normalizedEquation = equation.replace('√', 'Math.sqrt');
    const result = Function(`'use strict'; return (${normalizedEquation})`)();
    return Number.isFinite(result) ? Number(result) : null;
  } catch (e) {
    return null;
  }
};