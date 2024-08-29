import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import Button from '../ui/Button';

interface Card {
  content: string;
  type: 'number' | 'symbol';
  grade: 'gold' | 'silver' | 'bronze' |null;
  hidden?: boolean;  // hidden 속성 추가
}

interface NFT {
  id: string;
  name: string;
  image: string;
  floorPrice: number;
  tier: number;
  chips: number;
}

interface MathHighLowGameProps {
  selectedNFT: {
    id: string;
    name: string;
    image: string;
    tier: number;
    maxChips: number;
  } | null;
}

const NUMBERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
const SYMBOLS = ['√', '×'];

const GRADE_COLORS = {
  gold: 'bg-yellow-500',
  silver: 'bg-gray-400',
  bronze: 'bg-amber-600'
};

const CardComponent: React.FC<Card & { onClick: () => void; selected: boolean }> = 
  ({ content, type, grade, onClick, selected, hidden }) => {
  let backgroundColor = 'bg-white';
  if (type === 'number') {
    backgroundColor = grade ? GRADE_COLORS[grade] : 'bg-white';
  }
  
  return (
    <div 
      className={`w-16 h-24 rounded-lg shadow-md flex items-center justify-center m-2 cursor-pointer 
        ${backgroundColor} ${selected ? 'ring-2 ring-blue-500' : ''} ${hidden ? 'bg-gray-400' : ''}`}
      onClick={onClick}
    >
      <span className={`text-4xl font-bold ${hidden ? 'invisible' : ''}`}>{content}</span>
    </div>
  );
};

const MathHighLowGame: React.FC<MathHighLowGameProps> = ({ selectedNFT }) => {  const [deck, setDeck] = useState<Card[]>([]);
  const [myHand, setMyHand] = useState<Card[]>([]);
  const [opponentHand, setOpponentHand] = useState<Card[]>([]);
  const [myEquation, setMyEquation] = useState<Card[]>([]);
  const [opponentEquation, setOpponentEquation] = useState<Card[]>([]);
  const [myResult, setMyResult] = useState<number | null>(null);
  const [opponentResult, setOpponentResult] = useState<number | null>(null);
  const [gamePhase, setGamePhase] = useState<'init' | 'dealBase' | 'dealHidden' | 'dealOpen1' | 'dealOpen2' | 'firstBet' | 'dealFinal' | 'finalBet' | 'createEquation' | 'chooseBet' | 'result'>('init');
  const [myBetAmount, setMyBetAmount] = useState<number>(0);
  const [opponentBetAmount, setOpponentBetAmount] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(90);
  const [myBet, setMyBet] = useState<'high' | 'low' | null>(null);
  const [opponentBet, setOpponentBet] = useState<'high' | 'low' | null>(null);
  const [showRemoveCardModal, setShowRemoveCardModal] = useState<boolean>(false);
  const [tempCard, setTempCard] = useState<Card | null>(null);
  const [myChips, setMyChips] = useState<number>(0);
  const [opponentChips, setOpponentChips] = useState<number>(1000);
  const [pot, setPot] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (gamePhase === 'createEquation' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gamePhase, timeLeft]);

  const location = useLocation();

  useEffect(() => {
    if (selectedNFT) {
      setMyChips(selectedNFT.maxChips);
    }
    initializeGame();
  }, [selectedNFT]);

  const startGame = () => {
    // Implement game start logic here
    // This function will be called automatically when the component mounts
  };

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
    setOpponentChips(1000);
    setPot(0);
    setMyBet(null);
    setOpponentBet(null);
    setGamePhase('dealBase');
  };

  const createDeck = (): Card[] => {
    let deck: Card[] = [];
    NUMBERS.forEach(num => {
      deck.push({ content: num, type: 'number', grade: 'gold' });
      deck.push({ content: num, type: 'number', grade: 'silver' });
      deck.push({ content: num, type: 'number', grade: 'bronze' });
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
    setMyHand(prev => [...prev, { ...myHiddenCard, hidden: true }]);
    await new Promise(resolve => setTimeout(resolve, 500));

    let [opponentHiddenCard, deck2] = drawCard(deck1, 'number');
    setOpponentHand(prev => [...prev, { ...opponentHiddenCard, hidden: true }]);
    await new Promise(resolve => setTimeout(resolve, 500));

    currentDeck = deck2;

    // Deal two open cards one by one
    for (let i = 0; i < 2; i++) {
      setGamePhase(i === 0 ? 'dealOpen1' : 'dealOpen2');
      let [myCard, deck3] = drawCard(currentDeck);
      currentDeck = await handleNewCard(myCard, true, deck3);
      await new Promise(resolve => setTimeout(resolve, 500));

      let [opponentCard, deck4] = drawCard(currentDeck);
      currentDeck = await handleNewCard(opponentCard, false, deck4);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check if both cards are symbols
      if (myCard.type === 'symbol' && opponentCard.type === 'symbol') {
        while (true) {
          let [newCard, newDeck] = drawCard(currentDeck, 'number');
          currentDeck = newDeck;
          if (newCard.type === 'number') {
            currentDeck = await handleNewCard(newCard, i === 0, currentDeck);
            break;
          }
        }
      }
    }

    setDeck(currentDeck);
    setGamePhase('firstBet');
  };

  const handleNewCard = async (card: Card, isMyCard: boolean, currentDeck: Card[]): Promise<Card[]> => {
    const setHand = isMyCard ? setMyHand : setOpponentHand;

    if (card.type === 'symbol') {
      if (card.content === '√') {
        setHand(prev => [...prev, card]);
        let [numberCard, newDeck] = drawCard(currentDeck, 'number');
        setHand(prev => [...prev, numberCard]);
        return newDeck;
      } else if (card.content === '×') {
        return handleMultiplyCard(card, isMyCard, currentDeck);
      }
    }
    
    setHand(prev => [...prev, card]);
    return currentDeck;
  };

  const handleMultiplyCard = async (card: Card, isMyCard: boolean, currentDeck: Card[]): Promise<Card[]> => {
    const setHand = isMyCard ? setMyHand : setOpponentHand;
    const hand = isMyCard ? myHand : opponentHand;

    if (isMyCard) {
      setTempCard(card);
      setShowRemoveCardModal(true);
      await new Promise<void>(resolve => {
        const checkInterval = setInterval(() => {
          if (!showRemoveCardModal) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
      });
    } else {
      // Simulate opponent's choice
      const removableCards = hand.filter(c => ['×', '+', '-'].includes(c.content));
      if (removableCards.length > 0) {
        const randomIndex = Math.floor(Math.random() * removableCards.length);
        const removedCard = removableCards[randomIndex];
        setHand(prev => prev.filter(c => c !== removedCard).concat(card));
        
        // Draw a new number card for the opponent
        let [numberCard, newDeck] = drawCard(currentDeck, 'number');
        setHand(prev => [...prev, numberCard]);
        return newDeck;
      }
    }
    
    // 곱하기 카드만 추가하고, 숫자 카드는 아직 추가하지 않습니다.
    setHand(prev => [...prev, card]);
    return currentDeck;
  };

  const handleRemoveCard = (cardToRemove: Card) => {
    setMyHand(prev => prev.filter(card => card !== cardToRemove));
    // 곱하기 카드는 이미 패에 추가되어 있으므로, 여기서 추가하지 않습니다.
    setShowRemoveCardModal(false);
    setTempCard(null);

    // 새로운 숫자 카드를 뽑아 추가합니다.
    let [newCard, newDeck] = drawCard(deck, 'number');
    setMyHand(prev => [...prev, newCard]);
    setDeck(newDeck);
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
    let updatedDeck = await handleNewCard(myFinalCard, true, deck1);
    await new Promise(resolve => setTimeout(resolve, 500));

    let [opponentFinalCard, deck2] = drawCard(updatedDeck);
    updatedDeck = await handleNewCard(opponentFinalCard, false, deck2);
    await new Promise(resolve => setTimeout(resolve, 500));

    setDeck(updatedDeck);
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

  // calculateResult 함수 수정
  const calculateResult = (equation: Card[]): number | null => {
    try {
      let equationString = '';
      let isSqrt = false;
  
      // 수식 문자열 생성
      equation.forEach((card, index) => {
        if (card.content === '√') {
          equationString += 'Math.sqrt(';
          isSqrt = true;  // 루트 기호 뒤에 숫자를 감싸기 위해 플래그 설정
        } else {
          if (isSqrt && card.type === 'number') {
            equationString += `${card.content})`;  // 루트 기호 뒤의 숫자를 닫아줌
            isSqrt = false;  // 루트 기호 플래그 리셋
          } else {
            if (card.content === '÷') {
              equationString += '/';
            } else if (card.content === '×') {
              equationString += '*';
            } else {
              equationString += card.content;
            }
          }
        }
      });
  
      console.log('Equation string:', equationString);
  
      const result = Function(`'use strict'; return (${equationString})`)();
      console.log('Calculated result:', result);
      
      return Number.isFinite(result) ? Number(result.toFixed(2)) : null;
    } catch (e) {
      console.error('Error in calculation:', e);
      return null;
    }
  };
  
  

  // handleCreateEquation 함수 수정
  const handleCreateEquation = () => {
    console.log('My equation:', myEquation);
    const myResult = calculateResult(myEquation);
    setMyResult(myResult);
    console.log('My result:', myResult);
  
    // 상대방의 방정식 시뮬레이션 개선
    const opponentEq = generateValidEquation(opponentHand);
    setOpponentEquation(opponentEq);
    console.log('Opponent equation:', opponentEq);
    const opponentResult = calculateResult(opponentEq);
    setOpponentResult(opponentResult);
    console.log('Opponent result:', opponentResult);
  
    setGamePhase('chooseBet');
  };

  const generateValidEquation = (hand: Card[]): Card[] => {
    const numbers = hand.filter(card => card.type === 'number');
    const symbols = hand.filter(card => card.type === 'symbol');
    
    let equation: Card[] = [];
    
    // 모든 숫자 카드를 사용
    numbers.forEach(number => {
      equation.push(number);
      // 숫자 다음에 기호가 올 수 있으면 기호 추가
      if (symbols.length > 0 && equation.length < hand.length) {
        equation.push(symbols.shift()!);
      }
    });
    
    // 남은 기호 카드를 모두 사용
    while (symbols.length > 0 && equation.length < hand.length) {
      equation.push(symbols.shift()!);
    }
    
    return equation;
  };

  const handleChooseBet = (bet: 'high' | 'low') => {
    setMyBet(bet);
    // Simulate opponent's bet
    setOpponentBet(Math.random() > 0.5 ? 'high' : 'low');
    setGamePhase('result');
  };

  // determineWinner 함수 수정
  const determineWinner = (): string => {
    console.log('Determining winner...');
    console.log('My result:', myResult);
    console.log('Opponent result:', opponentResult);
    console.log('My bet:', myBet);
    console.log('Opponent bet:', opponentBet);
  
    if (myResult === null && opponentResult === null) {
      return "두 플레이어 모두 유효한 방정식을 만들지 못했습니다.";
    } else if (myResult === null) {
      return "상대방이 이겼습니다. (유효한 방정식 생성)";
    } else if (opponentResult === null) {
      return "당신이 이겼습니다! (유효한 방정식 생성)";
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
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-6 text-center">Math High-Low Game</h1>
      <div className="text-xl font-bold mb-4">Your Chips: {myChips}</div>
      <div className="text-xl font-bold mb-4">Opponent's Chips: {opponentChips}</div>
      <div className="text-xl font-bold mb-4">Pot: {pot}</div>

      {showRemoveCardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded">
            <h2 className="text-lg font-bold mb-2">곱하기 카드를 받았습니다. 제거할 카드를 선택하세요:</h2>
            <div className="flex justify-center">
              {myHand.filter(card => ['×', '+', '-'].includes(card.content)).map((card, index) => (
                <CardComponent
                  key={index}
                  {...card}
                  onClick={() => handleRemoveCard(card)}
                  selected={false}
                />
              ))}
            </div>
          </div>
        </div>
      )}

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