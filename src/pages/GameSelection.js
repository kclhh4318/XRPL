import React from 'react';
import { useNavigate } from 'react-router-dom';
import mathHighLowLogo from '../assets/images/mathhighlow.png';
import xrplogo from '../assets/images/xrplogo.png';

const GameSelection = () => {
  const navigate = useNavigate();

  const handleGameSelect = (game) => {
    navigate('/select-nft', { state: { selectedGame: game } });
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-center">Select a Game</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-center">
        <div 
          className="border p-4 rounded-lg cursor-pointer hover:border-blue-500 text-center"
          onClick={() => handleGameSelect('math-high-low')}
        >
          <img src={mathHighLowLogo} alt="Math High Low Game" className="w-full h-40 object-cover mb-2" />
          <h3 className="font-semibold">Math High Low Game</h3>
          <p>Compete to make the largest and smallest numbers with given cards.</p>
        </div>
        <div 
          className="border p-4 rounded-lg cursor-pointer hover:border-blue-500 text-center"
          onClick={() => handleGameSelect('dummy-game-1')}
        >
          <img src={xrplogo} alt="Dummy Game 1" className="w-full h-40 object-cover mb-2" />
          <h3 className="font-semibold">Dummy Game 1</h3>
          <p>Dummy description for the first dummy game.</p>
        </div>
        <div 
          className="border p-4 rounded-lg cursor-pointer hover:border-blue-500 text-center"
          onClick={() => handleGameSelect('dummy-game-2')}
        >
          <img src={xrplogo} alt="Dummy Game 2" className="w-full h-40 object-cover mb-2" />
          <h3 className="font-semibold">Dummy Game 2</h3>
          <p>Dummy description for the second dummy game.</p>
        </div>
      </div>
    </div>
  );
};

export default GameSelection;
