import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';

interface Card {
  content: string;
  type: 'number' | 'symbol';
  grade: 'gold' | 'silver' | 'bronze' | null;
  hidden?: boolean;
}

interface Player {
  id: number;
  name: string;
  chips: number;
  hand: Card[];
  equation: Card[];
  bet: number;
  result: number | null;
  betChoice: 'high' | 'low' | null;
  isAI: boolean;
  nft?: {
    id: string;
    name: string;
    image: string;
    tier: number;
    maxChips: number;
  } | null;
}

interface MathHighLowGameProps {
  selectedNFT: Player['nft'];
}

const NUMBERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
const SYMBOLS = ['√', '×'];
const BASE_CARDS: Card[] = [
  { content: '+', type: 'symbol', grade: null },
  { content: '-', type: 'symbol', grade: null },
  { content: '÷', type: 'symbol', grade: null },
];

const GRADE_COLORS = {
  gold: 'bg-yellow-500',
  silver: 'bg-gray-400',
  bronze: 'bg-amber-600',
};

// CardComponent 수정
const CardComponent: React.FC<Card & { onClick: () => void; selected: boolean; className?: string }> = 
  ({ content, type, grade, onClick, selected, hidden, className }) => {
  let backgroundColor = 'bg-white';
  if (type === 'number') {
    backgroundColor = grade ? GRADE_COLORS[grade] : 'bg-white';
  }
  
  return (
    <div 
      className={`rounded-lg shadow-md flex items-center justify-center cursor-pointer 
        ${backgroundColor} ${selected ? 'ring-2 ring-blue-500' : ''} ${hidden ? 'bg-gray-400' : ''} ${className}`}
      onClick={onClick}
    >
      <span className={`text-2xl font-bold ${hidden ? 'invisible' : ''}`}>{content}</span>
    </div>
  );
};

const MathHighLowGame: React.FC<MathHighLowGameProps> = ({ selectedNFT }) => {
  const [deck, setDeck] = useState<Card[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [gamePhase, setGamePhase] = useState<'init' | 'dealBase' | 'dealHidden' | 'dealOpen1' | 'dealOpen2' | 'firstBet' | 'dealFinal' | 'finalBet' | 'createEquation' | 'chooseBet' | 'result'>('init');
  const [pot, setPot] = useState(0);
  const [blinds] = useState({ small: 5, big: 10 });
  const [dealerIndex, setDealerIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [showRemoveCardModal, setShowRemoveCardModal] = useState(false);
  const [pendingMultiplyCard, setPendingMultiplyCard] = useState<Card | null>(null);
  const [cardsToChooseFrom, setCardsToChooseFrom] = useState<Card[]>([]);
  const [showOpponentCards, setShowOpponentCards] = useState<number>(-1);

  useEffect(() => {
    if (gamePhase === 'createEquation' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [gamePhase, timeLeft]);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const newDeck = createDeck();
    const initialPlayers: Player[] = [
      { id: 0, name: '당신', chips: 1000, hand: [], equation: [], bet: 0, result: null, betChoice: null, isAI: false, nft: selectedNFT },
      { id: 1, name: 'AI 1', chips: 1000, hand: [], equation: [], bet: 0, result: null, betChoice: null, isAI: true },
      { id: 2, name: 'AI 2', chips: 1000, hand: [], equation: [], bet: 0, result: null, betChoice: null, isAI: true },
      { id: 3, name: 'AI 3', chips: 1000, hand: [], equation: [], bet: 0, result: null, betChoice: null, isAI: true },
    ];

    setDeck(newDeck);
    setPlayers(initialPlayers);
    setDealerIndex(Math.floor(Math.random() * 4));
    setCurrentPlayerIndex((prevDealerIndex) => (prevDealerIndex + 3) % 4);
    setPot(blinds.small + blinds.big);

    // 블라인드 설정
    const updatedPlayers = initialPlayers.map((player, index) => {
      if (index === (dealerIndex + 1) % 4) {
        return { ...player, chips: player.chips - blinds.small, bet: blinds.small };
      }
      if (index === (dealerIndex + 2) % 4) {
        return { ...player, chips: player.chips - blinds.big, bet: blinds.big };
      }
      return player;
    });

    setPlayers(updatedPlayers);
    setGamePhase('dealBase');

    // dealCards 함수 호출 (비동기 처리)
    dealCards(updatedPlayers, newDeck);
  };

  // 카드 덱 생성 함수 수정
const createDeck = (): Card[] => {
  let deck: Card[] = [];
  const uniqueCards = new Set<string>();

  NUMBERS.forEach(num => {
    ['gold', 'silver', 'bronze'].forEach(grade => {
      const cardKey = `${num}-${grade}`;
      if (!uniqueCards.has(cardKey)) {
        deck.push({ content: num, type: 'number', grade: grade as Card['grade'] });
        uniqueCards.add(cardKey);
      }
    });
  });

  SYMBOLS.forEach(symbol => {
    for (let i = 0; i < 4; i++) {
      const cardKey = `${symbol}-${i}`;
      if (!uniqueCards.has(cardKey)) {
        deck.push({ content: symbol, type: 'symbol', grade: null });
        uniqueCards.add(cardKey);
      }
    }
  });

  return shuffleArray(deck);
};

const removeDuplicateCards = (hand: Card[]): Card[] => {
  const uniqueCards: Card[] = [];
  const seenCards = new Set<string>();

  hand.forEach(card => {
    const cardKey = `${card.content}-${card.type}-${card.grade}`;
    if (!seenCards.has(cardKey)) {
      uniqueCards.push(card);
      seenCards.add(cardKey);
    }
  });

  return uniqueCards;
};

const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

  // drawCard 함수 수정 (중복 방지)
const drawCard = (currentDeck: Card[], type?: 'number' | 'symbol'): [Card, Card[]] => {
  const availableCards = type ? currentDeck.filter(card => card.type === type) : currentDeck;
  const index = Math.floor(Math.random() * availableCards.length);
  const card = availableCards[index];
  const updatedDeck = currentDeck.filter((_, i) => i !== currentDeck.indexOf(card));
  return [card, updatedDeck];
};

  // 플레이어에게 카드를 나누어주는 함수 수정
const dealCards = async (currentPlayers: Player[], currentDeck: Card[]) => {
  const updatedPlayers = [...currentPlayers];
  let updatedDeck = [...currentDeck];

  // 기본 카드 분배
  updatedPlayers.forEach(player => {
    player.hand = [...BASE_CARDS];
  });

  // 카드가 이미 핸드에 있는지 확인하는 함수
  const isCardInHand = (player: Player, card: Card) => {
    return player.hand.some(c => c.content === card.content && c.type === card.type && c.grade === card.grade);
  };

  // 숨겨진 카드 분배
  for (let i = 0; i < updatedPlayers.length; i++) {
    let [hiddenCard, newDeck] = drawCard(updatedDeck, 'number');
    while (isCardInHand(updatedPlayers[i], hiddenCard)) {
      [hiddenCard, newDeck] = drawCard(newDeck, 'number');
    }
    updatedPlayers[i].hand.push({ ...hiddenCard, hidden: i !== 0 });
    updatedDeck = newDeck;
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // 오픈 카드 2장 분배
  for (let j = 0; j < 2; j++) {
    setGamePhase(j === 0 ? 'dealOpen1' : 'dealOpen2');
    for (let i = 0; i < updatedPlayers.length; i++) {
      let [openCard, newDeck] = drawCard(updatedDeck);
      while (isCardInHand(updatedPlayers[i], openCard)) {
        [openCard, newDeck] = drawCard(newDeck);
      }
      updatedDeck = await handleNewCard(openCard, i, updatedPlayers, newDeck);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  setPlayers(updatedPlayers);
  setDeck(updatedDeck);
  setGamePhase('firstBet');
};

// handleNewCard 함수 수정
const handleNewCard = async (card: Card, playerIndex: number, currentPlayers: Player[], currentDeck: Card[]): Promise<Card[]> => {
  const updatedPlayers = [...currentPlayers];
  let updatedDeck = [...currentDeck];

  if (card.type === 'symbol' && card.content === '×') {
    if (playerIndex === 0) {
      const removableCards = updatedPlayers[playerIndex].hand.filter(c => ['+', '-', '×'].includes(c.content));
      setCardsToChooseFrom([...removableCards, card]);  // 곱하기 카드도 포함
      setPendingMultiplyCard(card);
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
      // AI 로직 (변경 없음)
    }
  } else {
    updatedPlayers[playerIndex].hand.push(card);
  }

  // 중복 카드 제거
  updatedPlayers[playerIndex].hand = removeDuplicateCards(updatedPlayers[playerIndex].hand);

  setPlayers(updatedPlayers);
  return updatedDeck;
};

  // handleRemoveCard 함수 수정
const handleRemoveCard = (cardToRemove: Card) => {
  setPlayers(prevPlayers => {
    const updatedPlayers = [...prevPlayers];
    // 선택된 카드를 제거
    updatedPlayers[0].hand = updatedPlayers[0].hand.filter(card => card !== cardToRemove);
    
    // 만약 제거된 카드가 곱하기 카드가 아니라면, 곱하기 카드를 추가
    if (cardToRemove.content !== '×') {
      updatedPlayers[0].hand.push(pendingMultiplyCard!);
    }
    
    return updatedPlayers;
  });
  setShowRemoveCardModal(false);

  // 새로운 숫자 카드를 뽑아 추가
  let [newCard, newDeck] = drawCard(deck, 'number');
  setPlayers(prevPlayers => {
    const updatedPlayers = [...prevPlayers];
    updatedPlayers[0].hand.push(newCard);
    // 중복 카드 제거
    updatedPlayers[0].hand = removeDuplicateCards(updatedPlayers[0].hand);
    return updatedPlayers;
  });
  setDeck(newDeck);
  setPendingMultiplyCard(null);
  setCardsToChooseFrom([]);
};

  const handlePlayerAction = (action: 'fold' | 'call' | 'raise', amount?: number) => {
    const currentPlayer = players[currentPlayerIndex];
    const updatedPlayers = [...players];

    switch (action) {
      case 'fold':
        currentPlayer.hand = [];
        break;
      case 'call':
        const callAmount = Math.max(...players.map(p => p.bet)) - currentPlayer.bet;
        currentPlayer.chips -= callAmount;
        currentPlayer.bet += callAmount;
        setPot(prev => prev + callAmount);
        break;
      case 'raise':
        if (amount && amount <= currentPlayer.chips) {
          currentPlayer.chips -= amount;
          currentPlayer.bet += amount;
          setPot(prev => prev + amount);
        }
        break;
    }

    updatedPlayers[currentPlayerIndex] = currentPlayer;
    setPlayers(updatedPlayers);

    if (updatedPlayers.every(p => p.bet === Math.max(...updatedPlayers.map(p => p.bet)) || p.hand.length === 0)) {
      if (gamePhase === 'firstBet') {
        dealFinalCard();
      } else if (gamePhase === 'finalBet') {
        setGamePhase('createEquation');
        setTimeLeft(90);
      }
    } else {
      nextTurn();
    }
  };

  const nextTurn = () => {
    setCurrentPlayerIndex((prevIndex) => (prevIndex + 1) % 4);
  };

  const dealFinalCard = async () => {
    const updatedPlayers = [...players];
    let updatedDeck = [...deck];

    for (let i = 0; i < updatedPlayers.length; i++) {
      let [finalCard, newDeck] = drawCard(updatedDeck);
      updatedDeck = await handleNewCard(finalCard, i, updatedPlayers, newDeck);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setPlayers(updatedPlayers);
    setDeck(updatedDeck);
    setGamePhase('finalBet');
    nextTurn();
  };

  useEffect(() => {
    if (players[currentPlayerIndex]?.isAI && (gamePhase === 'firstBet' || gamePhase === 'finalBet')) {
      const timer = setTimeout(() => {
        const aiAction = decideAIAction(players[currentPlayerIndex]);
        handlePlayerAction(aiAction.action, aiAction.amount);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentPlayerIndex, players, gamePhase]);

  const decideAIAction = (player: Player): { action: 'fold' | 'call' | 'raise', amount?: number } => {
    const maxBet = Math.max(...players.map(p => p.bet));
    const callAmount = maxBet - player.bet;

    if (Math.random() < 0.1) return { action: 'fold' };
    if (Math.random() < 0.7) return { action: 'call' };
    return { action: 'raise', amount: Math.min(player.chips, callAmount + Math.floor(Math.random() * 50) + 10) };
  };

  const handleCardClick = (card: Card) => {
    if (gamePhase === 'createEquation') {
      setPlayers(prevPlayers => {
        const updatedPlayers = [...prevPlayers];
        const currentPlayer = updatedPlayers[0]; // 현재 사용자 플레이어
        
        // 카드가 이미 선택된 경우 삭제, 그렇지 않으면 추가
        if (currentPlayer.equation.some(c => c.content === card.content && c.type === card.type)) {
          currentPlayer.equation = currentPlayer.equation.filter(c => !(c.content === card.content && c.type === card.type));
        } else {
          currentPlayer.equation.push(card);
        }
  
        console.log('Updated equation:', currentPlayer.equation); // 디버깅용 로그
  
        return updatedPlayers;
      });
    }
  };

  const calculateResult = (equation: Card[]): number | null => {
    try {
      let equationString = '';
      let isSqrt = false;

      equation.forEach((card, index) => {
        if (card.content === '√') {
          equationString += 'Math.sqrt(';
          isSqrt = true;
        } else {
          if (isSqrt && card.type === 'number') {
            equationString += `${card.content})`;
            isSqrt = false;
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

      const result = Function(`'use strict'; return (${equationString})`)();
      return Number.isFinite(result) ? Number(result.toFixed(2)) : null;
    } catch (e) {
      return null;
    }
  };

  const handleCreateEquation = () => {
    const updatedPlayers = players.map(player => {
      if (player.isAI) {
        const aiEquation = generateValidEquation(player.hand);
        const result = calculateResult(aiEquation);
        return { ...player, equation: aiEquation, result };
      } else {
        const result = calculateResult(player.equation);
        return { ...player, result };
      }
    });
    setPlayers(updatedPlayers);
    setGamePhase('chooseBet');
  };

  const generateValidEquation = (hand: Card[]): Card[] => {
    const numbers = hand.filter(card => card.type === 'number');
    const symbols = hand.filter(card => card.type === 'symbol');
    
    let equation: Card[] = [];
    
    numbers.forEach(number => {
      equation.push(number);
      if (symbols.length > 0 && equation.length < hand.length) {
        equation.push(symbols.shift()!);
      }
    });
    
    while (symbols.length > 0 && equation.length < hand.length) {
      equation.push(symbols.shift()!);
    }
    
    return equation;
  };

  const handleChooseBet = (bet: 'high' | 'low') => {
    setPlayers(prevPlayers => {
      return prevPlayers.map(player => {
        if (player.isAI) {
          return { ...player, betChoice: Math.random() > 0.5 ? 'high' : 'low' };
        } else {
          return { ...player, betChoice: bet };
        }
      });
    });
    setGamePhase('result');
  };

  const determineWinner = (): string => {
    const validPlayers = players.filter(p => p.result !== null);
    
    if (validPlayers.length === 0) {
      return "모든 플레이어가 유효한 방정식을 만들지 못했습니다.";
    }
  
    const highPlayers = validPlayers.filter(p => p.betChoice === 'high');
    const lowPlayers = validPlayers.filter(p => p.betChoice === 'low');
  
    const getWinnerFromGroup = (group: Player[], targetNumber: number) => {
      return group.reduce((closest, player) => {
        const closestDiff = Math.abs(closest.result! - targetNumber);
        const playerDiff = Math.abs(player.result! - targetNumber);
        if (playerDiff < closestDiff) return player;
        if (playerDiff === closestDiff) {
          const closestGrade = Math.max(...closest.equation.map(card => card.grade === 'gold' ? 2 : card.grade === 'silver' ? 1 : 0));
          const playerGrade = Math.max(...player.equation.map(card => card.grade === 'gold' ? 2 : card.grade === 'silver' ? 1 : 0));
          return playerGrade > closestGrade ? player : closest;
        }
        return closest;
      });
    };
  
    const highWinner = highPlayers.length > 0 ? getWinnerFromGroup(highPlayers, 20) : null;
    const lowWinner = lowPlayers.length > 0 ? getWinnerFromGroup(lowPlayers, 1) : null;
  
    if (highWinner && lowWinner) {
      const highDiff = Math.abs(highWinner.result! - 20);
      const lowDiff = Math.abs(lowWinner.result! - 1);
      if (highDiff < lowDiff) return `${highWinner.name}이(가) 이겼습니다! (High)`;
      if (lowDiff < highDiff) return `${lowWinner.name}이(가) 이겼습니다! (Low)`;
      return "무승부입니다.";
    } else if (highWinner) {
      return `${highWinner.name}이(가) 이겼습니다! (High)`;
    } else if (lowWinner) {
      return `${lowWinner.name}이(가) 이겼습니다! (Low)`;
    }
  
    return "승자를 결정할 수 없습니다.";
  };

  const renderGamePhase = () => {
    switch (gamePhase) {
      case 'createEquation':
      return (
        <>
          <div className="text-xl font-bold mb-2">남은 시간: {timeLeft}초</div>
          {currentPlayerIndex === 0 && (
            <div className="text-green-500 text-xl font-bold">당신의 차례입니다</div>
          )}
          <div className="flex justify-center mt-4">
            <Button onClick={handleCreateEquation} className="mr-2">수식 제출</Button>
            <Button onClick={() => setPlayers(prevPlayers => {
              const updatedPlayers = [...prevPlayers];
              updatedPlayers[0].equation = []; // 사용자 수식 초기화
              return updatedPlayers;
            })} variant="outline">수식 초기화</Button>
          </div>
          <div className="mt-4 p-4 bg-white rounded-lg">
            <h3 className="text-lg font-semibold mb-2">당신의 카드:</h3>
            <div className="flex justify-center">
              {players[0].hand.map((card, index) => (
                <CardComponent 
                  key={index} 
                  {...card} 
                  onClick={() => handleCardClick(card)} 
                  selected={players[0].equation.some(c => c.content === card.content && c.type === card.type)} 
                  hidden={card.hidden}
                  className="w-16 h-24 m-1" // 여기서 크기와 마진을 조정했습니다
                />
              ))}
            </div>
            <h3 className="text-lg font-semibold mt-4 mb-2">당신의 수식:</h3>
            <div className="flex justify-center">
              {players[0].equation.map((card, index) => (
                <CardComponent 
                  key={index} 
                  {...card} 
                  onClick={() => handleCardClick(card)} 
                  selected={true} 
                  hidden={false}
                  className="w-16 h-24 m-1" // 여기도 동일하게 크기와 마진을 조정했습니다
                />
              ))}
            </div>
          </div>
        </>
      );
        return (
          <>
            <div className="text-xl font-bold mb-2">남은 시간: {timeLeft}초</div>
            {currentPlayerIndex === 0 && (
              <div className="text-green-500 text-xl font-bold">당신의 차례입니다</div>
            )}
            <div className="flex justify-center mt-4">
              <Button onClick={handleCreateEquation} className="mr-2">수식 제출</Button>
              <Button onClick={() => setPlayers(prevPlayers => {
                const updatedPlayers = [...prevPlayers];
                updatedPlayers[0].equation = []; // 사용자 수식 초기화
                return updatedPlayers;
              })} variant="outline">수식 초기화</Button>
            </div>
            <div className="mt-4 p-4 bg-white rounded-lg">
              <h3 className="text-lg font-semibold mb-2">당신의 카드:</h3>
              <div className="flex justify-center">
                {players[0].hand.map((card, index) => (
                  <CardComponent 
                    key={index} 
                    {...card} 
                    onClick={() => handleCardClick(card)} 
                    selected={players[0].equation.some(c => c.content === card.content && c.type === card.type)} 
                    hidden={card.hidden}
                  />
                ))}
              </div>
              <h3 className="text-lg font-semibold mt-4 mb-2">당신의 수식:</h3>
              <div className="flex justify-center">
                {players[0].equation.map((card, index) => (
                  <CardComponent 
                    key={index} 
                    {...card} 
                    onClick={() => handleCardClick(card)} 
                    selected={true} 
                    hidden={false}
                  />
                ))}
              </div>
            </div>
          </>
        );
        case 'chooseBet':
        return (
          <div className="flex flex-col items-center mt-4">
            <div className="text-xl font-bold mb-2">Your Result: {players[0].result !== null ? players[0].result.toFixed(2) : 'N/A'}</div>
            <div className="flex justify-center">
              <Button onClick={() => handleChooseBet('high')} className="mr-2">Bet High</Button>
              <Button onClick={() => handleChooseBet('low')}>Bet Low</Button>
            </div>
          </div>
        );
        case 'result':
          return (
            <div className="text-center mt-4">
              <h2 className="text-2xl font-bold mb-4">{determineWinner()}</h2>
              <div className="grid grid-cols-2 gap-4">
                {players.map((player, index) => (
                  <div key={player.id} className="border p-4 rounded-lg">
                    <h3 className="text-xl font-semibold mb-2">{player.name}'s Equation:</h3>
                    <div className="flex justify-center mb-2">
                      {player.equation.map((card, cardIndex) => (
                        <CardComponent 
                          key={cardIndex} 
                          {...card} 
                          onClick={() => {}} 
                          selected={false} 
                          hidden={false}
                          className="w-12 h-18 m-1" // 결과 화면의 카드 크기 조정
                        />
                      ))}
                    </div>
                    <div>Result: {player.result !== null ? player.result.toFixed(2) : 'N/A'}</div>
                    <div>Bet: {player.betChoice}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <div className="text-xl font-bold">Pot: {pot}</div>
              </div>
              <Button onClick={initializeGame} className="mt-4">Play Again</Button>
            </div>
          );

    }
  };

  const getUniqueCards = (cards: (Card | null)[]): Card[] => {
    const uniqueCards: Card[] = [];
    const seenContents = new Set<string>();

    cards.forEach(card => {
      if (card && !seenContents.has(card.content)) {
        uniqueCards.push(card);
        seenContents.add(card.content);
      }
    });

    return uniqueCards;
  };

  const renderGameBoard = () => {
    if (players.length === 0 || !players[0]) {
      return <div>Loading...</div>;
    }

    return (
      <div className="flex">
        <div className="flex-grow mr-4">
          <div className="mb-8">
            {renderPlayerHand(players[0], 0)}
          </div>
          <div>
            {renderGamePhase()}
          </div>
        </div>
        <div className="w-1/4">
          <h2 className="text-2xl font-semibold mb-2">Players:</h2>
          <div className="space-y-4">
            {players.slice(1).map((player, index) => renderPlayerInfo(player, index + 1))}
          </div>
        </div>
      </div>
    );
  };

  const renderPlayerInfo = (player: Player, index: number) => (
    <div 
      key={player.id} 
      className="mb-4 flex items-center relative"
      onMouseEnter={() => setShowOpponentCards(index)}
      onMouseLeave={() => setShowOpponentCards(-1)}
    >
      <div className="absolute right-full mr-2 flex items-center" style={{ display: showOpponentCards === index ? 'flex' : 'none' }}>
        {player.hand.map((card, cardIndex) => (
          <CardComponent
            key={cardIndex}
            {...card}
            onClick={() => {}}
            selected={false}
            hidden={card.hidden}
            className="w-10 h-15 mr-1 flex-shrink-0"
          />
        ))}
      </div>
      <div className={`p-2 rounded-lg ${index === currentPlayerIndex ? 'bg-blue-200' : 'bg-gray-200'}`}>
        <div className="font-bold">{player.name}</div>
        <div>Chips: {player.chips}</div>
        <div>Bet: {player.bet}</div>
        {player.nft && (
          <img src={player.nft.image} alt={player.name} className="w-16 h-16 object-cover rounded mt-2" />
        )}
      </div>
    </div>
  );
  
  
  // renderPlayerHand 함수 수정 (필요한 경우)
  const renderPlayerHand = (player: Player, index: number) => (
    <div key={player.id} className="mb-4">
      <h2 className="text-2xl font-semibold mb-2">{index === 0 ? 'Your Hand:' : `${player.name}'s Hand:`}</h2>
      <div className="flex flex-wrap justify-center">
        {player.hand.map((card, cardIndex) => (
          <CardComponent
            key={cardIndex}
            {...card}
            onClick={() => index === 0 && gamePhase === 'createEquation' ? handleCardClick(card) : {}}
            selected={index === 0 && players[0].equation.includes(card)}
            hidden={index !== 0 && card.hidden}
            className="w-16 h-24 m-1"
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4 relative">
    <div className="text-center mb-6">
      <h1 className="text-4xl font-bold mb-2">Math High-Low Game</h1>
      <div className="text-xl font-bold">Pot: {pot}</div>
    </div>
  
      {renderGameBoard()}
  
      {showRemoveCardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded">
            <h2 className="text-lg font-bold mb-2">곱하기 카드를 받았습니다. 제거할 카드를 선택하세요:</h2>
            <div className="flex justify-center">
              {cardsToChooseFrom.map((card, index) => (
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
  
      <div className="fixed bottom-4 right-4 flex space-x-2">
        <Button onClick={() => handlePlayerAction('fold')}>Fold</Button>
        <Button onClick={() => handlePlayerAction('call')}>Call</Button>
        <Button onClick={() => handlePlayerAction('raise', 20)}>Raise</Button>
      </div>
    </div>
  );
};

export default MathHighLowGame;
