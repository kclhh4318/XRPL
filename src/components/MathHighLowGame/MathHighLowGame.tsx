import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';

interface Card {
  content: string;
  type: 'number' | 'symbol';
  grade: 'gold' | 'silver' | null;
}

const NUMBERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
const SYMBOLS = ['√', '×'];
const GRADES: Card['grade'][] = ['gold', 'silver'];

const GRADE_COLORS = {
  gold: 'bg-yellow-500',
  silver: 'bg-gray-400',
};

const CardComponent: React.FC<Card & { onClick: () => void; selected: boolean; hidden: boolean }> = ({ content, type, grade, onClick, selected, hidden }) => {
  let backgroundColor = 'bg-white';
  if (type === 'number') {
    backgroundColor = grade === 'gold' ? 'bg-yellow-500' : 'bg-gray-400';
  }
  
  return (
    <div 
      className={`w-16 h-24 rounded-lg shadow-md flex items-center justify-center m-2 cursor-pointer ${backgroundColor} ${selected ? 'ring-2 ring-blue-500' : ''} ${hidden ? 'bg-gray-400' : ''}`}
      onClick={onClick}
    >
      <span className={`text-4xl font-bold ${hidden ? 'invisible' : ''}`}>{content}</span>
    </div>
  );
};

const MathHighLowGame: React.FC = () => {
  const [deck, setDeck] = useState<Card[]>([]);
  const [myHand, setMyHand] = useState<Card[]>([]);
  const [opponentHand, setOpponentHand] = useState<Card[]>([]);
  const [equation, setEquation] = useState<Card[]>([]);
  const [result, setResult] = useState<number | null>(null);
  const [gamePhase, setGamePhase] = useState<'init' | 'dealBase' | 'dealHidden' | 'dealOpen1' | 'dealOpen2' | 'replaceCard' | 'firstBet' | 'dealFinal' | 'create' | 'finalBet' | 'result'>('init');
  const [betAmount, setBetAmount] = useState<number>(0);
  const [chips, setChips] = useState<number>(1000);
  const [pot, setPot] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [specialCardReplacement, setSpecialCardReplacement] = useState<Card | null>(null);
  const [replacementHistory, setReplacementHistory] = useState<string[]>([]);

  useEffect(() => {
    if (gamePhase !== 'init' && gamePhase !== 'result' && gamePhase !== 'firstBet' && gamePhase !== 'create' && gamePhase !== 'finalBet' && gamePhase !== 'replaceCard') {
      const timer = setTimeout(() => {
        progressGame();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [gamePhase]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if ((gamePhase === 'firstBet' || gamePhase === 'finalBet' || gamePhase === 'create') && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (gamePhase === 'firstBet') {
        handleFold();
      } else if (gamePhase === 'finalBet') {
        setGamePhase('create');
        setTimeLeft(90);
      } else if (gamePhase === 'create') {
        calculateResult();
        setGamePhase('result');
      }
    }
    return () => clearInterval(timer);
  }, [gamePhase, timeLeft]);

  const initializeGame = () => {
    const newDeck: Card[] = createDeck();
    setDeck(newDeck);
    setMyHand([]);
    setOpponentHand([]);
    setReplacementHistory([]);
    setEquation([]);
    setResult(null);
    setBetAmount(0);
    setPot(0);
    setTimeLeft(30);
    setGamePhase('dealBase');
  };

  const createDeck = (): Card[] => {
    let deck: Card[] = [];
    
    NUMBERS.forEach(num => {
      deck.push({ content: num, type: 'number', grade: 'gold' });
      deck.push({ content: num, type: 'number', grade: 'silver' });
    });

    for (let i = 0; i < 4; i++) {
      deck.push({ content: '×', type: 'symbol', grade: null });
      deck.push({ content: '√', type: 'symbol', grade: null });
    }

    return shuffleArray(deck);
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  const progressGame = () => {
    switch (gamePhase) {
      case 'dealBase':
        dealBaseCards();
        break;
      case 'dealHidden':
        dealHiddenCards();
        break;
      case 'dealOpen1':
        dealOpenCard(1);
        break;
      case 'dealOpen2':
        dealOpenCard(2);
        break;
      case 'dealFinal':
        dealFinalCard();
        break;
      default:
        break;
    }
  };

  const dealBaseCards = () => {
    const baseCards: Card[] = [
      { content: '+', type: 'symbol', grade: null },
      { content: '-', type: 'symbol', grade: null },
      { content: '÷', type: 'symbol', grade: null },
    ];
    setMyHand(baseCards);
    setOpponentHand([...baseCards]);
    setGamePhase('dealHidden');
  };

  const drawCard = (excludeCards: Card[], type?: 'number' | 'symbol'): Card => {
    const availableCards = deck.filter(card => 
      (!type || card.type === type) &&
      !excludeCards.some(c => c.content === card.content && c.grade === card.grade)
    );
    const card = availableCards[Math.floor(Math.random() * availableCards.length)];
    setDeck(prev => prev.filter(c => c !== card));
    return card;
  };

  const dealHiddenCards = () => {
    const myHiddenCard = drawCard([], 'number');
    const opponentHiddenCard = drawCard([myHiddenCard], 'number');
    
    setMyHand(prev => [...prev, myHiddenCard]);
    setOpponentHand(prev => [...prev, opponentHiddenCard]);
    setGamePhase('dealOpen1');
  };

  const dealOpenCard = (round: number) => {
    const dealToPlayer = (hand: Card[], setHand: React.Dispatch<React.SetStateAction<Card[]>>, otherHand: Card[]) => {
      const card = drawCard([...hand, ...otherHand]);
      if (card.content === '√') {
        const numCard = drawCard([...hand, ...otherHand, card], 'number');
        setHand(prev => [...prev, card, numCard]);
      } else if (card.content === '×') {
        setSpecialCardReplacement(card);
      } else {
        setHand(prev => [...prev, card]);
      }
      return card;
    };

    const myCard = dealToPlayer(myHand, setMyHand, opponentHand);
    const opponentCard = dealToPlayer(opponentHand, setOpponentHand, myHand);

    if (myCard.content === '×' || opponentCard.content === '×') {
      setGamePhase('replaceCard');
    } else if (round === 1) {
      setGamePhase('dealOpen2');
    } else {
      setGamePhase('firstBet');
      setTimeLeft(30);
    }
  };

  const handleSpecialCardReplacement = (cardToDiscard: '+' | '-' | '÷') => {
    if (specialCardReplacement) {
      setMyHand(prev => prev.map(c => c.content === cardToDiscard ? specialCardReplacement : c));
      setReplacementHistory(prev => [...prev, `You replaced ${cardToDiscard} with ×`]);
      const newCard = drawCard([...myHand, ...opponentHand], 'number');
      setMyHand(prev => [...prev, newCard]);
      setSpecialCardReplacement(null);
      setGamePhase('dealOpen2');
    }
  };

  const dealFinalCard = () => {
    const finalCard = drawCard([...myHand, ...opponentHand]);
    setMyHand(prev => [...prev, finalCard]);
    const opponentFinalCard = drawCard([...myHand, ...opponentHand, finalCard]);
    setOpponentHand(prev => [...prev, opponentFinalCard]);
    setGamePhase('finalBet');
    setTimeLeft(30);
  };

  const handleBet = () => {
    if (betAmount <= chips) {
      setChips(prev => prev - betAmount);
      setPot(prev => prev + betAmount);
      if (gamePhase === 'firstBet') {
        setGamePhase('dealFinal');
      } else {
        setGamePhase('create');
        setTimeLeft(90);
      }
    }
  };

  const handleFold = () => {
    // 상대방이 팟을 가져감
    setGamePhase('result');
  };

  const handleCardClick = (card: Card) => {
    if (gamePhase === 'create') {
      if (equation.includes(card)) {
        setEquation(equation.filter(c => c !== card));
      } else {
        setEquation([...equation, card]);
      }
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
  };

  const renderGamePhase = () => {
    switch (gamePhase) {
      case 'init':
        return <Button onClick={initializeGame}>Start Game</Button>;
      case 'dealBase':
      case 'dealHidden':
      case 'dealOpen1':
      case 'dealOpen2':
      case 'dealFinal':
        return <div className="text-xl font-bold">Dealing cards...</div>;
      case 'replaceCard':
        return (
          <div className="mt-4 p-4 bg-yellow-100 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Replace Special Card</h3>
            <div className="flex justify-center">
              <Button onClick={() => handleSpecialCardReplacement('+')} className="mr-2">+</Button>
              <Button onClick={() => handleSpecialCardReplacement('-')} className="mr-2">-</Button>
              <Button onClick={() => handleSpecialCardReplacement('÷')}>÷</Button>
            </div>
          </div>
        );
      case 'firstBet':
      case 'finalBet':
        return (
          <div className="flex flex-col items-center mt-4">
            <div className="text-xl font-bold mb-2">Time left: {timeLeft} seconds</div>
            <input 
              type="number" 
              value={betAmount} 
              onChange={(e) => setBetAmount(Number(e.target.value))}
              className="mb-2 p-2 border rounded"
            />
            <div className="flex justify-center">
              <Button onClick={handleBet} className="mr-2">Place Bet</Button>
              <Button onClick={handleFold}>Fold</Button>
            </div>
          </div>
        );
      case 'create':
        return (
          <>
            <div className="text-xl font-bold mb-2">Time left: {timeLeft} seconds</div>
            <div className="flex justify-center mt-4">
              <Button onClick={calculateResult} className="mr-2">Calculate Result</Button>
              <Button onClick={() => setEquation([])} variant="outline">Clear Equation</Button>
            </div>
            <div className="mt-4 p-4 bg-white rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Your Equation:</h3>
              <div className="flex justify-center">
                {equation.map((card, index) => (
                  <CardComponent key={index} {...card} onClick={() => handleCardClick(card)} selected={true} hidden={false} />
                ))}
              </div>
              <div className="text-xl font-bold mt-2">Result: {result !== null ? result.toFixed(2) : '?'}</div>
            </div>
          </>
        );
      case 'result':
        return (
          <div className="text-center mt-4">
            <h2 className="text-2xl font-bold">Game Over!</h2>
            <div>Your chips: {chips}</div>
            <div>Pot: {pot}</div>
            <Button onClick={initializeGame} className="mt-2">Play Again</Button>
          </div>
        );
    }
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold mb-6 text-center">Math High-Low Game</h1>
      <div className="text-xl font-bold mb-4">Your Chips: {chips}</div>
      <div className="text-xl font-bold mb-4">Pot: {pot}</div>
      
      {gamePhase !== 'init' && (
        <>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Your Hand:</h2>
            <div className="flex flex-wrap justify-center">
              {myHand.map((card, index) => (
                <CardComponent
                  key={index}
                  {...card}
                  onClick={() => handleCardClick(card)}
                  selected={equation.includes(card)}
                  hidden={index === 3} // Hide the 4th card (index 3) which is the hidden card
                />
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Opponent's Hand:</h2>
            <div className="flex flex-wrap justify-center">
              {opponentHand.map((card, index) => (
                <CardComponent
                  key={index}
                  {...card}
                  onClick={() => {}}
                  selected={false}
                  hidden={index === 3} // Hide the 4th card (index 3) which is the opponent's hidden card
                />
              ))}
            </div>
          </div>

          {replacementHistory.length > 0 && (
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">Replacement History:</h2>
              <ul>
                {replacementHistory.map((history, index) => (
                  <li key={index}>{history}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {renderGamePhase()}
    </div>
  );
};

export default MathHighLowGame;