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
  const [showOpponentCards, setShowOpponentCards] = useState<boolean>(false);
  const [isChoosingMultiplyCard, setIsChoosingMultiplyCard] = useState(false);

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

  const drawCard = (currentDeck: Card[], type?: 'number' | 'symbol'): [Card, Card[]] => {
    const availableCards = type ? currentDeck.filter(card => card.type === type) : currentDeck;
    const index = Math.floor(Math.random() * availableCards.length);
    const card = availableCards[index];
    const updatedDeck = currentDeck.filter((_, i) => i !== currentDeck.indexOf(card));
    return [card, updatedDeck];
  };

  const dealCards = async (currentPlayers: Player[], currentDeck: Card[]) => {
    const updatedPlayers = [...currentPlayers];
    let updatedDeck = [...currentDeck];
  
    // Deal base cards to all players
    updatedPlayers.forEach(player => {
      player.hand = [...BASE_CARDS];
    });
  
    // Function to check if a card is already in player's hand
    const isCardInHand = (player: Player, card: Card) => {
      return player.hand.some(c => c.content === card.content && c.type === card.type);
    };
  
    // Deal hidden card
    for (let i = 0; i < updatedPlayers.length; i++) {
      let [hiddenCard, newDeck] = drawCard(updatedDeck, 'number');
      while (isCardInHand(updatedPlayers[i], hiddenCard)) {
        [hiddenCard, newDeck] = drawCard(newDeck, 'number');
      }
      updatedPlayers[i].hand.push({ ...hiddenCard, hidden: i !== 0 });
      updatedDeck = newDeck;
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  
    // Deal two open cards
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

  const handleNewCard = async (card: Card, playerIndex: number, currentPlayers: Player[], currentDeck: Card[]): Promise<Card[]> => {
    const updatedPlayers = [...currentPlayers];
    let updatedDeck = [...currentDeck];
  
    if (card.type === 'symbol' && card.content === '×') {
      if (playerIndex === 0) {
        // 플레이어가 곱하기 카드를 받았을 때
        setPendingMultiplyCard(card);
        setShowRemoveCardModal(true); // 모달을 열어 더하기, 빼기, 곱하기 중 선택하도록 함
        await new Promise<void>(resolve => {
          const checkInterval = setInterval(() => {
            if (!showRemoveCardModal) {
              clearInterval(checkInterval);
              resolve();
            }
          }, 100);
        });
      } else {
        // AI 로직
        const removableCards = updatedPlayers[playerIndex].hand.filter(c => ['+', '-', '×'].includes(c.content));
        if (removableCards.length > 0) {
          const randomIndex = Math.floor(Math.random() * removableCards.length);
          const removedCard = removableCards[randomIndex];
          updatedPlayers[playerIndex].hand = updatedPlayers[playerIndex].hand.filter(c => c !== removedCard);
          updatedPlayers[playerIndex].hand.push(card);
          let [numberCard, newDeck] = drawCard(updatedDeck, 'number');
          updatedPlayers[playerIndex].hand.push(numberCard);
          updatedDeck = newDeck;
        }
      }
    } else if (card.type === 'symbol' && card.content === '√') {
      updatedPlayers[playerIndex].hand.push(card);
      let [numberCard, newDeck] = drawCard(updatedDeck, 'number');
      updatedPlayers[playerIndex].hand.push(numberCard);
      updatedDeck = newDeck;
    } else {
      updatedPlayers[playerIndex].hand.push(card);
    }
  
    setPlayers(updatedPlayers);
    return updatedDeck;
  };

  const handleRemoveCard = (cardToRemove: Card) => {
    setPlayers(prevPlayers => {
      const updatedPlayers = [...prevPlayers];
      updatedPlayers[0].hand = updatedPlayers[0].hand.filter(card => card !== cardToRemove);
  
      if (pendingMultiplyCard) {
        updatedPlayers[0].hand.push(pendingMultiplyCard);
      }
  
      return updatedPlayers;
    });
    setShowRemoveCardModal(false);
  
    // 새로운 숫자 카드를 뽑아 추가합니다.
    let [newCard, newDeck] = drawCard(deck, 'number');
    setPlayers(prevPlayers => {
      const updatedPlayers = [...prevPlayers];
      updatedPlayers[0].hand.push(newCard);
      return updatedPlayers;
    });
    setDeck(newDeck);
    setPendingMultiplyCard(null);
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
      <div className="text-xl font-bold mb-2">Time left: {timeLeft} seconds</div>
      {currentPlayerIndex === 0 && (
        <div className="text-green-500 text-xl font-bold">Your Turn</div>
      )}
      <div className="flex justify-center mt-4">
        <Button onClick={handleCreateEquation} className="mr-2">Submit Equation</Button>
        <Button onClick={() => setPlayers(prevPlayers => {
          const updatedPlayers = [...prevPlayers];
          updatedPlayers[0].equation = []; // 사용자 수식 초기화
          return updatedPlayers;
        })} variant="outline">Clear Equation</Button>
      </div>
            <div className="mt-4 p-4 bg-white rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Your Hand:</h3>
              <div className="flex justify-center">
                {players[0].hand.map((card, index) => (
                  <CardComponent 
                    key={index} 
                    {...card} 
                    onClick={() => handleCardClick(card)} 
                    selected={players[0].equation.includes(card)} 
                    hidden={card.hidden}
                  />
                ))}
              </div>
              <h3 className="text-lg font-semibold mt-4 mb-2">Your Equation:</h3>
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
      // 다른 게임 페이즈에 대한 로직도 이곳에 추가 가능
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
      <div className="flex-grow">
        {renderGamePhase()}
      </div>
    );
  };

  const renderPlayerInfo = (player: Player, index: number) => (
    <div 
      key={player.id} 
      className={`p-2 rounded-lg ${index === currentPlayerIndex ? 'bg-blue-200' : 'bg-gray-200'}`}
      onMouseEnter={() => setShowOpponentCards(true)}
      onMouseLeave={() => setShowOpponentCards(false)}
    >
      <div className="font-bold">{player.name}</div>
      <div>Chips: {player.chips}</div>
      <div>Bet: {player.bet}</div>
      {player.nft && (
        <img src={player.nft.image} alt={player.name} className="w-16 h-16 object-cover rounded mt-2" />
      )}
      {showOpponentCards && index !== 0 && renderPlayerHand(player, index)}
    </div>
  );

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
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4 relative">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-6">Math High-Low Game</h1>
        <div className="text-xl font-bold mb-4">Pot: {pot}</div>
      </div>

      {players.length > 0 ? (
        <div className="flex">
          <div className="flex-grow">
            {renderPlayerHand(players[0], 0)}
            {renderGamePhase()}
          </div>
          <div className="w-1/4 ml-4">
            <h2 className="text-2xl font-semibold mb-2">Players:</h2>
            <div className="space-y-2">
              {players.slice(1).map((player, index) => renderPlayerInfo(player, index + 1))}
            </div>
          </div>
        </div>
      ) : (
        <div>Loading game...</div>
      )}

      {showRemoveCardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded">
            <h2 className="text-lg font-bold mb-2">곱하기 카드를 받았습니다. 제거할 카드를 선택하세요:</h2>
            <div className="flex justify-center">
              {players[0].hand.filter(card => ['+', '-', '×'].includes(card.content)).map((card, index) => (
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