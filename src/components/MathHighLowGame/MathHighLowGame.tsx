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
    backgroundColor = grade ? GRADE_COLORS[grade] : 'bg-white';
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
  const [myEquation, setMyEquation] = useState<Card[]>([]);
  const [opponentEquation, setOpponentEquation] = useState<Card[]>([]);
  const [myResult, setMyResult] = useState<number | null>(null);
  const [opponentResult, setOpponentResult] = useState<number | null>(null);
  const [gamePhase, setGamePhase] = useState<'init' | 'dealBase' | 'dealHidden' | 'dealOpen1' | 'dealOpen2' | 'firstBet' | 'dealFinal' | 'finalBet' | 'createEquation' | 'chooseBet' | 'result'>('init');
  const [myBetAmount, setMyBetAmount] = useState<number>(0);
  const [opponentBetAmount, setOpponentBetAmount] = useState<number>(0);
  const [myChips, setMyChips] = useState<number>(1000);
  const [opponentChips, setOpponentChips] = useState<number>(1000);
  const [pot, setPot] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(90);
  const [myBet, setMyBet] = useState<'high' | 'low' | null>(null);
  const [opponentBet, setOpponentBet] = useState<'high' | 'low' | null>(null);

  useEffect(() => {
    if (gamePhase === 'createEquation' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gamePhase, timeLeft]);

  const initializeGame = () => {
    const newDeck = createDeck();
    setDeck(newDeck);
    setMyHand([]);
    setOpponentHand([]);
    setMyEquation([]);
    setOpponentEquation([]);
    setMyResult(null);
    setOpponentResult(null);
    setMyBetAmount(0);
    setOpponentBetAmount(0);
    setMyChips(1000);
    setOpponentChips(1000);
    setPot(0);
    setMyBet(null);
    setOpponentBet(null);
    setGamePhase('dealBase');
    // dealCards 함수 호출 제거 (useEffect에서 처리)
  };

  const createDeck = (): Card[] => {
    let deck: Card[] = [];
    NUMBERS.forEach(num => {
      deck.push({ content: num, type: 'number', grade: 'gold' });
      deck.push({ content: num, type: 'number', grade: 'silver' });
    });
    SYMBOLS.forEach(symbol => {
      for (let i = 0; i < 4; i++) {
        deck.push({ content: symbol, type: 'symbol', grade: null });
      }
    });
    return shuffleArray(deck);
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  const drawCard = (currentDeck: Card[], type?: 'number' | 'symbol'): [Card, Card[]] => {
    const availableCards = type ? currentDeck.filter(card => card.type === type) : currentDeck;
    const index = Math.floor(Math.random() * availableCards.length);
    const card = availableCards[index];
    const updatedDeck = currentDeck.filter((_, i) => i !== currentDeck.indexOf(card));
    return [card, updatedDeck];
  };

  const dealCards = async () => {
    let currentDeck = [...deck];
    const baseCards: Card[] = [
      { content: '+', type: 'symbol', grade: null },
      { content: '-', type: 'symbol', grade: null },
      { content: '÷', type: 'symbol', grade: null },
    ];
    setMyHand(baseCards);
    setOpponentHand([...baseCards]);
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Deal hidden card
    let [myHiddenCard, deck1] = drawCard(currentDeck, 'number');
    setMyHand(prev => [...prev, myHiddenCard]);
    await new Promise(resolve => setTimeout(resolve, 500));

    let [opponentHiddenCard, deck2] = drawCard(deck1, 'number');
    setOpponentHand(prev => [...prev, opponentHiddenCard]);
    await new Promise(resolve => setTimeout(resolve, 500));

    currentDeck = deck2;

    // Deal two open cards
    for (let i = 0; i < 2; i++) {
      let [myCard, deck3] = drawCard(currentDeck);
      setMyHand(prev => [...prev, myCard]);
      await new Promise(resolve => setTimeout(resolve, 500));

      let [opponentCard, deck4] = drawCard(deck3);
      setOpponentHand(prev => [...prev, opponentCard]);
      await new Promise(resolve => setTimeout(resolve, 500));

      currentDeck = deck4;
    }

    setDeck(currentDeck);
    setGamePhase('firstBet');
  };

  const handleBet = (amount: number) => {
    if (amount <= myChips) {
      setMyChips(prev => prev - amount);
      setPot(prev => prev + amount);
      setMyBetAmount(amount);

      // Simulate opponent's bet
      const opponentBet = Math.min(Math.floor(Math.random() * opponentChips) + 1, opponentChips);
      setOpponentChips(prev => prev - opponentBet);
      setPot(prev => prev + opponentBet);
      setOpponentBetAmount(opponentBet);

      if (gamePhase === 'firstBet') {
        dealFinalCard();
      } else if (gamePhase === 'finalBet') {
        setGamePhase('createEquation');
        setTimeLeft(90);
      }
    }
  };

  const dealFinalCard = async () => {
    let [myFinalCard, deck1] = drawCard(deck);
    setMyHand(prev => [...prev, myFinalCard]);
    await new Promise(resolve => setTimeout(resolve, 500));

    let [opponentFinalCard, deck2] = drawCard(deck1);
    setOpponentHand(prev => [...prev, opponentFinalCard]);
    await new Promise(resolve => setTimeout(resolve, 500));

    setDeck(deck2);
    setGamePhase('finalBet');
  };

  const handleCardClick = (card: Card) => {
    if (gamePhase === 'createEquation') {
      if (myEquation.includes(card)) {
        setMyEquation(prev => prev.filter(c => c !== card));
      } else {
        setMyEquation(prev => [...prev, card]);
      }
    }
  };

  useEffect(() => {
    if (gamePhase === 'dealBase') {
      dealCards();
    }
  }, [gamePhase]);

  const calculateResult = (equation: Card[]): number | null => {
    const equationString = equation.map(card => {
      if (card.content === '√') return 'Math.sqrt';
      if (card.content === '÷') return '/';
      if (card.content === '×') return '*';
      return card.content;
    }).join('');
    try {
      const result = Function(`'use strict'; return (${equationString})`)();
      return Number.isFinite(result) ? Number(result.toFixed(2)) : null;
    } catch (e) {
      return null;
    }
  };

  const handleCreateEquation = () => {
    const myResult = calculateResult(myEquation);
    setMyResult(myResult);
  
    // Simulate opponent's equation
    const opponentEq = opponentHand.slice(0, Math.floor(Math.random() * 3) + 3);
    setOpponentEquation(opponentEq);
    const opponentResult = calculateResult(opponentEq);
    setOpponentResult(opponentResult);
  
    setGamePhase('chooseBet');
  };

  const handleChooseBet = (bet: 'high' | 'low') => {
    setMyBet(bet);
    // Simulate opponent's bet
    setOpponentBet(Math.random() > 0.5 ? 'high' : 'low');
    setGamePhase('result');
  };

  const determineWinner = (): string => {
    if (myResult === null || opponentResult === null || myBet === null || opponentBet === null) {
      return "결과를 계산할 수 없습니다.";
    }

    const myDiff = myBet === 'high' ? Math.abs(20 - myResult) : Math.abs(1 - myResult);
    const opponentDiff = opponentBet === 'high' ? Math.abs(20 - opponentResult) : Math.abs(1 - opponentResult);

    if (myBet === opponentBet) {
      // 같은 베팅일 경우
      if (myDiff < opponentDiff) {
        return "당신이 이겼습니다!";
      } else if (myDiff > opponentDiff) {
        return "상대방이 이겼습니다.";
      } else {
        // 동점일 경우 등급 비교
        const myHighestGrade = Math.max(...myEquation.map(card => card.grade === 'gold' ? 2 : card.grade === 'silver' ? 1 : 0));
        const opponentHighestGrade = Math.max(...opponentEquation.map(card => card.grade === 'gold' ? 2 : card.grade === 'silver' ? 1 : 0));
        
        if (myHighestGrade > opponentHighestGrade) {
          return "당신이 이겼습니다! (더 높은 등급)";
        } else if (myHighestGrade < opponentHighestGrade) {
          return "상대방이 이겼습니다. (더 높은 등급)";
        } else {
          return "무승부입니다.";
        }
      }
    } else {
      // 다른 베팅일 경우
      if (myDiff < opponentDiff) {
        return "당신이 이겼습니다!";
      } else if (myDiff > opponentDiff) {
        return "상대방이 이겼습니다.";
      } else {
        return "무승부입니다.";
      }
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
        return <div className="text-xl font-bold">Dealing cards...</div>;
      case 'firstBet':
      case 'finalBet':
        return (
          <div className="flex flex-col items-center mt-4">
            <input 
              type="number" 
              value={myBetAmount} 
              onChange={(e) => setMyBetAmount(Number(e.target.value))}
              className="mb-2 p-2 border rounded"
            />
            <Button onClick={() => handleBet(myBetAmount)}>Place Bet</Button>
          </div>
        );
      case 'createEquation':
        return (
          <>
            <div className="text-xl font-bold mb-2">Time left: {timeLeft} seconds</div>
            <div className="flex justify-center mt-4">
              <Button onClick={handleCreateEquation} className="mr-2">Submit Equation</Button>
              <Button onClick={() => setMyEquation([])} variant="outline">Clear Equation</Button>
            </div>
            <div className="mt-4 p-4 bg-white rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Your Equation:</h3>
              <div className="flex justify-center">
                {myEquation.map((card, index) => (
                  <CardComponent key={index} {...card} onClick={() => handleCardClick(card)} selected={true} hidden={false} />
                ))}
              </div>
            </div>
          </>
        );
      case 'chooseBet':
        return (
          <div className="flex flex-col items-center mt-4">
            <div className="text-xl font-bold mb-2">Your Result: {myResult !== null ? myResult.toFixed(2) : 'N/A'}</div>
            <div className="flex justify-center">
              <Button onClick={() => handleChooseBet('high')} className="mr-2">Bet High</Button>
              <Button onClick={() => handleChooseBet('low')}>Bet Low</Button>
            </div>
          </div>
        );
      case 'result':
        return (
          <div className="text-center mt-4">
            <h2 className="text-2xl font-bold">{determineWinner()}</h2>
            <div className="mt-4">
              <h3 className="text-xl font-semibold">Your Equation:</h3>
              <div className="flex justify-center">
                {myEquation.map((card, index) => (
                  <CardComponent key={index} {...card} onClick={() => {}} selected={false} hidden={false} />
                ))}
              </div>
              <div>Result: {myResult !== null ? myResult.toFixed(2) : 'N/A'}</div>
              <div>Your bet: {myBet}</div>
            </div>
            <div className="mt-4">
              <h3 className="text-xl font-semibold">Opponent's Equation:</h3>
              <div className="flex justify-center">
              {opponentEquation.map((card, index) => (
                  <CardComponent key={index} {...card} onClick={() => {}} selected={false} hidden={false} />
                ))}
              </div>
              <div>Result: {opponentResult !== null ? opponentResult.toFixed(2) : 'N/A'}</div>
              <div>Opponent's bet: {opponentBet}</div>
            </div>
            <div className="mt-4">
              <div>Your chips: {myChips}</div>
              <div>Opponent's chips: {opponentChips}</div>
              <div>Pot: {pot}</div>
            </div>
            <Button onClick={initializeGame} className="mt-2">Play Again</Button>
          </div>
        );
    }
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold mb-6 text-center">Math High-Low Game</h1>
      <div className="text-xl font-bold mb-4">Your Chips: {myChips}</div>
      <div className="text-xl font-bold mb-4">Opponent's Chips: {opponentChips}</div>
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
                  selected={myEquation.includes(card)}
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