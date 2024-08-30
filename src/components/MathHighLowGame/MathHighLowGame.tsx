import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import PlayerComponent from './Player'; // 실제 PlayerComponent가 정의된 파일 경로로 수정하세요

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

const MathHighLowGame: React.FC<{ selectedNFT: Player['nft'] }> = ({ selectedNFT }) => {
  const [deck, setDeck] = useState<Card[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [gamePhase, setGamePhase] = useState<'init' | 'dealBase' | 'dealHidden' | 'dealOpen1' | 'dealOpen2' | 'firstBet' | 'finalBet' | 'createEquation' | 'chooseBet' | 'result'>('init');
  const [pot, setPot] = useState(0);
  const [blinds] = useState({ small: 5, big: 10 });
  const [dealerIndex, setDealerIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [showRemoveCardModal, setShowRemoveCardModal] = useState(false);
  const [currentRound, setCurrentRound] = useState<'init' | 'firstBet' | 'finalBet' | 'createEquation' | 'chooseBet' | 'result'>('init');
  const [myBetAmount, setMyBetAmount] = useState<number>(0);
  const [tempCard, setTempCard] = useState<Card | null>(null);

  useEffect(() => {
    if (gamePhase === 'createEquation' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [gamePhase, timeLeft]);

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
    setCurrentPlayerIndex((dealerIndex + 3) % 4);
    setPot(blinds.small + blinds.big);

    const updatedPlayers = [...initialPlayers];
    updatedPlayers[(dealerIndex + 3) % 4].bet = blinds.small;
    updatedPlayers[(dealerIndex + 3) % 4].chips -= blinds.small;
    updatedPlayers[dealerIndex].bet = blinds.big;
    updatedPlayers[dealerIndex].chips -= blinds.big;

    setPlayers(updatedPlayers);
    setGamePhase('dealBase');
    dealInitialCards(updatedPlayers, newDeck);
  };

  const createDeck = (): Card[] => {
    let deck: Card[] = [];
    NUMBERS.forEach(num => {
      ['gold', 'silver', 'bronze'].forEach(grade => {
        deck.push({ content: num, type: 'number', grade: grade as Card['grade'] });
      });
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

  const drawCard = (currentDeck: Card[], type?: 'number' | 'symbol'): [Card | undefined, Card[]] => {
    const availableCards = type ? currentDeck.filter(card => card.type === type) : currentDeck;
    if (availableCards.length === 0) {
      console.error('No cards available to draw');
      return [undefined, currentDeck];
    }
    const index = Math.floor(Math.random() * availableCards.length);
    const card = availableCards[index];
    const updatedDeck = currentDeck.filter((_, i) => i !== currentDeck.indexOf(card));
    return [card, updatedDeck];
  };

  const dealInitialCards = (currentPlayers: Player[], currentDeck: Card[]) => {
    const updatedPlayers = [...currentPlayers];
    let updatedDeck = [...currentDeck];

    // Deal base cards to all players
    updatedPlayers.forEach(player => {
      player.hand = [...BASE_CARDS];
    });

    // Deal hidden card
    for (let i = 0; i < updatedPlayers.length; i++) {
      let [hiddenCard, newDeck] = drawCard(updatedDeck, 'number');
      if (hiddenCard) {
        updatedPlayers[i].hand.push({ ...hiddenCard, hidden: i !== 0 });
        updatedDeck = newDeck;
      }
    }

    // Deal two open cards
    for (let j = 0; j < 2; j++) {
      for (let i = 0; i < updatedPlayers.length; i++) {
        let [openCard, newDeck] = drawCard(updatedDeck);
        if (openCard) {
          updatedPlayers[i].hand.push(openCard);
          updatedDeck = newDeck;
        }
      }
    }

    setPlayers(updatedPlayers);
    setDeck(updatedDeck);
    setGamePhase('firstBet');
    nextTurn();
  };

  const nextTurn = () => {
    setCurrentPlayerIndex((prevIndex) => (prevIndex + 1) % 4);
  };

  const handleBet = (amount: number) => {
    const currentPlayer = players[currentPlayerIndex];
    if (amount <= currentPlayer.chips) {
      // 플레이어 칩에서 베팅 금액 차감
      currentPlayer.chips -= amount;
      currentPlayer.bet += amount;
      setPot(prevPot => prevPot + amount);
  
      // 다음 플레이어로 턴을 넘김
      nextTurn();
    }
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

  const dealFinalCard = () => {
    const updatedPlayers = [...players];
    let updatedDeck = [...deck];

    for (let i = 0; i < updatedPlayers.length; i++) {
      let [finalCard, newDeck] = drawCard(updatedDeck);
      if (finalCard) {
        updatedPlayers[i].hand.push(finalCard);
        updatedDeck = newDeck;
      }
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
        const currentPlayer = updatedPlayers[currentPlayerIndex];
        if (currentPlayer.equation.includes(card)) {
          currentPlayer.equation = currentPlayer.equation.filter(c => c !== card);
        } else {
          currentPlayer.equation.push(card);
        }
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

  const handleRemoveCard = (cardToRemove: Card) => {
    setPlayers(prevPlayers => {
      const updatedPlayers = [...prevPlayers];
      const currentPlayer = updatedPlayers[currentPlayerIndex];
      currentPlayer.hand = currentPlayer.hand.filter(card => card !== cardToRemove);
      return updatedPlayers;
    });
    setShowRemoveCardModal(false);
    setTempCard(null);
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
              <Button onClick={() => setPlayers(prevPlayers => {
                const updatedPlayers = [...prevPlayers];
                updatedPlayers[currentPlayerIndex].equation = [];
                return updatedPlayers;
              })} variant="outline">Clear Equation</Button>
            </div>
            <div className="mt-4 p-4 bg-white rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Your Equation:</h3>
              <div className="flex justify-center">
                {players[currentPlayerIndex].equation.map((card, index) => (
                  <CardComponent key={index} {...card} onClick={() => handleCardClick(card)} selected={true} hidden={false} />
                ))}
              </div>
            </div>
          </>
        );
        case 'chooseBet':
          return (
            <div className="flex flex-col items-center mt-4">
              <div className="text-xl font-bold mb-2">Your Result: {players[currentPlayerIndex].result !== null ? players[currentPlayerIndex].result.toFixed(2) : 'N/A'}</div>
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
              <div className="flex mt-4 justify-between">
                {players.map((player, index) => (
                  <div key={player.id}>
                    <h3 className="text-xl font-semibold">{player.name}'s Equation:</h3>
                    <div className="flex justify-center">
                      {player.equation.map((card, cardIndex) => (
                        <CardComponent key={cardIndex} {...card} onClick={() => {}} selected={false} hidden={false} />
                      ))}
                    </div>
                    <div>Result: {player.result !== null ? player.result.toFixed(2) : 'N/A'}</div>
                    <div>Bet: {player.betChoice}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                {players.map(player => (
                  <div key={player.id}>{player.name}'s chips: {player.chips}</div>
                ))}
                <div>Pot: {pot}</div>
              </div>
              <Button onClick={initializeGame} className="mt-2">Play Again</Button>
            </div>
          );
      }
    };
  
    return (
      <div className="container mx-auto p-4 relative">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-6">Math High-Low Game</h1>
          <div className="text-xl font-bold mb-4">Pot: {pot}</div>
        </div>
  
        {showRemoveCardModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded">
              <h2 className="text-lg font-bold mb-2">곱하기 카드를 받았습니다. 제거할 카드를 선택하세요:</h2>
              <div className="flex justify-center">
                {players[currentPlayerIndex].hand.filter(card => ['×', '+', '-'].includes(card.content)).map((card, index) => (
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
  
        <div className="flex flex-wrap justify-around mb-4">
          {players.map((player, index) => (
            <PlayerComponent
              key={player.id}
              player={player}
              isCurrentPlayer={index === currentPlayerIndex}
              showCards={index === currentPlayerIndex || currentRound === 'result'}
            />
          ))}
        </div>
  
        <div className="flex-grow">
          {currentRound !== 'init' && (
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">Your Hand:</h2>
              <div className="flex flex-wrap justify-center">
                {players[currentPlayerIndex].hand.map((card, index) => (
                  <CardComponent
                    key={index}
                    {...card}
                    onClick={() => handleCardClick(card)}
                    selected={players[currentPlayerIndex].equation.includes(card)}
                    hidden={card.hidden === true}
                  />
                ))}
              </div>
            </div>
          )}
          {renderGamePhase()}
        </div>
      </div>
    );
  };
  
  export default MathHighLowGame;
