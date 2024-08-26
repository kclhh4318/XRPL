import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';

interface Card {
  content: string;
  type: 'number' | 'symbol';
  grade: 'gold' | 'silver' | null;
}

const NUMBERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
const SYMBOLS = ['√', '×', '+', '-', '÷'];
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
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [specialCardReplacement, setSpecialCardReplacement] = useState<Card | null>(null);

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
    if ((gamePhase === 'firstBet' || gamePhase === 'finalBet') && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (gamePhase === 'firstBet') {
        setGamePhase('dealFinal');
      } else if (gamePhase === 'finalBet') {
        setGamePhase('create');
      }
    }
    return () => clearInterval(timer);
  }, [gamePhase, timeLeft]);

  const initializeGame = () => {
    const newDeck: Card[] = createDeck();
    setDeck(newDeck);
    setEquation([]);
    setResult(null);
    setBetAmount(0);
    setTimeLeft(30);
    setGamePhase('dealBase');
  };

  const createDeck = (): Card[] => {
    let deck: Card[] = [];
    
    // 숫자 카드 생성 (각 숫자당 금색, 은색 1장씩)
    NUMBERS.forEach(num => {
      deck.push({ content: num, type: 'number', grade: 'gold' });
      deck.push({ content: num, type: 'number', grade: 'silver' });
    });

    // 기호 카드 추가
    SYMBOLS.forEach(symbol => {
      deck.push({ content: symbol, type: 'symbol', grade: null });
    });

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

  const dealHiddenCards = () => {
    const myHiddenCard = deck.find(card => card.type === 'number') || deck[0];
    const opponentHiddenCard = deck.find(card => 
      card.type === 'number' && 
      (card.content !== myHiddenCard.content || card.grade !== myHiddenCard.grade)
    ) || deck[1];
    
    setMyHand(prev => [...prev, myHiddenCard]);
    setOpponentHand(prev => [...prev, opponentHiddenCard]);
    setDeck(prev => prev.filter(card => card !== myHiddenCard && card !== opponentHiddenCard));
    setGamePhase('dealOpen1');
  };

  const dealOpenCard = (round: number) => {
    const dealCardToPlayer = (playerHand: Card[], setPlayerHand: React.Dispatch<React.SetStateAction<Card[]>>, otherPlayerHand: Card[]) => {
      let card = deck[0];
      let additionalCard: Card | null = null;

      // Ensure the card is different from the other player's card
      while (otherPlayerHand.some(c => c.content === card.content && c.grade === card.grade && c.type === 'number')) {
        card = deck[Math.floor(Math.random() * deck.length)];
      }

      if (card.content === '√') {
        additionalCard = deck.find(c => 
          c.type === 'number' && 
          !otherPlayerHand.some(oc => oc.content === c.content && oc.grade === c.grade)
        ) || null;
      } else if (card.content === '×') {
        setSpecialCardReplacement(card);
      }
      
      setPlayerHand(prev => [...prev, card, ...(additionalCard ? [additionalCard] : [])]);
      setDeck(prev => prev.filter(c => c !== card && c !== additionalCard));
      return { card, additionalCard };
    };

    const { card: myCard, additionalCard: myAdditionalCard } = dealCardToPlayer(myHand, setMyHand, opponentHand);
    const { card: opponentCard, additionalCard: opponentAdditionalCard } = dealCardToPlayer(opponentHand, setOpponentHand, [...myHand, myCard, myAdditionalCard].filter(Boolean) as Card[]);

    if (myCard.content === '×' || opponentCard.content === '×') {
      setGamePhase('replaceCard');
    } else if (round === 1) {
      setGamePhase('dealOpen2');
    } else {
      setGamePhase('firstBet');
    }
  };

  const handleSpecialCardReplacement = (replaceWith: '+' | '-' | '×') => {
    if (specialCardReplacement) {
      const newCard: Card = deck.find(card => card.type === 'number') || deck[0];
      const updatedHand = (hand: Card[]) => 
        hand.map(card => card === specialCardReplacement ? { ...card, content: replaceWith } : card);
      
      setMyHand(prev => updatedHand(prev));
      setOpponentHand(prev => updatedHand(prev));
      setDeck(prev => prev.filter(card => card !== newCard));
      setSpecialCardReplacement(null);
      setGamePhase('dealOpen2');
    }
  };

  const dealFinalCard = () => {
    const finalCard = deck[0];
    setMyHand(prev => [...prev, finalCard]);
    setOpponentHand(prev => [...prev, { ...finalCard, grade: Math.random() < 0.3 ? 'gold' : finalCard.grade }]);
    setDeck(prev => prev.slice(1));
    setGamePhase('finalBet');
    setTimeLeft(30);
  };

  const handleBet = () => {
    if (gamePhase === 'firstBet') {
      setGamePhase('dealFinal');
    } else {
      setGamePhase('create');
      setTimeLeft(90);
    }
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
              <Button onClick={() => handleSpecialCardReplacement('×')}>×</Button>
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
            <Button onClick={handleBet}>Place Bet</Button>
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
            <Button onClick={initializeGame} className="mt-2">Play Again</Button>
          </div>
        );
    }
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold mb-6 text-center">Math High-Low Game</h1>
      
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
        </>
        )}

        {renderGamePhase()}
      </div>
    );
  };
  
  export default MathHighLowGame;