import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface GameRoom {
  id: string;
  nftImage: string;
  status: 'PLAYING' | 'WAITING';
  players: number;
  maxPlayers: number;
}

interface NFT {
  image: string;
  tier: number;
  maxChips: number;
}

const dummyGameRooms: GameRoom[] = [
  { id: '01', nftImage: 'https://via.placeholder.com/50', status: 'PLAYING', players: 5, maxPlayers: 5 },
  { id: '02', nftImage: 'https://via.placeholder.com/50', status: 'WAITING', players: 1, maxPlayers: 5 },
  { id: '03', nftImage: 'https://via.placeholder.com/50', status: 'PLAYING', players: 4, maxPlayers: 5 },
  { id: '04', nftImage: 'https://via.placeholder.com/50', status: 'WAITING', players: 2, maxPlayers: 5 },
  { id: '05', nftImage: 'https://via.placeholder.com/50', status: 'PLAYING', players: 3, maxPlayers: 5 },
  { id: '06', nftImage: 'https://via.placeholder.com/50', status: 'PLAYING', players: 4, maxPlayers: 5 },
];

const JoinGame: React.FC = () => {
  const [gameRooms, setGameRooms] = useState<GameRoom[]>([]);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<GameRoom | null>(null);
  const [userNFT, setUserNFT] = useState<NFT>({ image: 'https://via.placeholder.com/100', tier: 1, maxChips: 80 });
  const [insertAmount, setInsertAmount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    setGameRooms(dummyGameRooms);
  }, []);

  const handleJoinGame = (room: GameRoom) => {
    if (room.status === 'PLAYING') {
      setAlertMessage("Cannot join a game in progress.");
    } else if (room.players >= room.maxPlayers) {
      setAlertMessage("This room is full.");
    } else {
      setSelectedRoom(room);
      setShowModal(true);
    }

    setTimeout(() => setAlertMessage(null), 3000);
  };

  const handleConfirmJoin = () => {
    if (selectedRoom && insertAmount <= userNFT.maxChips) {
      console.log(`Joining game room ${selectedRoom.id} with ${insertAmount} chips`);
      navigate('/game', { state: { roomId: selectedRoom.id, chips: insertAmount } });
    } else {
      setAlertMessage("Invalid chip amount.");
    }
  };

  const handleCreateGame = () => {
    console.log('Creating new game');
    navigate('/game', { state: { newGame: true } });
  };

  return (
    <div className="container mx-auto p-4">
      {alertMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{alertMessage}</span>
        </div>
      )}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Join game</h1>
        <button 
          onClick={handleCreateGame}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create game
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {gameRooms.map((room) => (
          <div key={room.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <img src={room.nftImage} alt="NFT" className="w-12 h-12 rounded" />
              <span className="font-bold">{room.id}</span>
              <button 
                onClick={() => handleJoinGame(room)}
                className={`px-3 py-1 rounded ${
                  room.status === 'PLAYING' || room.players >= room.maxPlayers
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600'
                } text-white`}
                disabled={room.status === 'PLAYING' || room.players >= room.maxPlayers}
              >
                JOIN
              </button>
            </div>
            <div className="flex justify-between items-center">
              <span className={room.status === 'PLAYING' ? 'text-yellow-500' : 'text-green-500'}>
                {room.status}
              </span>
              <span className="text-blue-500">
                {room.players}/{room.maxPlayers}
              </span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Confirm Join Game</h2>
            <div className="flex mb-4">
              <img src={userNFT.image} alt="Your NFT" className="w-24 h-24 mr-4" />
              <div>
                <p>Tier: {userNFT.tier}</p>
                <p>Max Chips: {userNFT.maxChips}</p>
              </div>
            </div>
            <div className="mb-4">
              <p>Balance: {userNFT.maxChips}</p>
              <label className="block mt-2">
                Insert Amount:
                <input
                  type="number"
                  value={insertAmount}
                  onChange={(e) => setInsertAmount(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </label>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleConfirmJoin}
                className="bg-green-500 text-white px-4 py-2 rounded mr-2"
              >
                OK
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 text-black px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JoinGame;