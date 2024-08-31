export interface Card {
    content: string;
    type: 'number' | 'symbol';
    grade: 'gold' | 'silver' | 'bronze' | null;
    hidden?: boolean;
  }
  
  export interface Player {
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

  export type GamePhase = 'init' | 'dealBase' | 'dealHidden' | 'dealOpen1' | 'dealOpen2' | 'firstBet' | 'dealFinal' | 'finalBet' | 'createEquation' | 'chooseBet' | 'result';