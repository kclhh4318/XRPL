import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface NFT {
  id: string;
  name: string;
  image: string;
  tier: number;
  maxChips: number;
}

interface NFTSelectorProps {
  setSelectedNFT: (nft: NFT) => void;
}

const dummyNFTs: NFT[] = [
  { id: '1', name: 'Cool Cat #1', image: 'https://via.placeholder.com/150', tier: 1, maxChips: 100 },
  { id: '2', name: 'Bored Ape #42', image: 'https://via.placeholder.com/150', tier: 2, maxChips: 80 },
  { id: '3', name: 'Crypto Punk #007', image: 'https://via.placeholder.com/150', tier: 3, maxChips: 60 },
];

const NFTSelector: React.FC<NFTSelectorProps> = ({ setSelectedNFT }) => {
  const [userNFTs, setUserNFTs] = useState<NFT[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // 더미 데이터 사용
    setUserNFTs(dummyNFTs);
  }, []);

  const handleNFTSelect = (nft: NFT) => {
    setSelectedNFT(nft);
    navigate('/join-game');
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Select Your NFT for the Game</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {userNFTs.map((nft) => (
          <div 
            key={nft.id} 
            className="border p-4 rounded-lg cursor-pointer hover:border-blue-500"
            onClick={() => handleNFTSelect(nft)}
          >
            <img src={nft.image} alt={nft.name} className="w-full h-40 object-cover mb-2" />
            <h3 className="font-semibold">{nft.name}</h3>
            <p>24H Tier: {nft.tier}</p>
            <p>Max Chips: {nft.maxChips}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NFTSelector;