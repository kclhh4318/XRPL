import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface NFT {
  id: string;
  name: string;
  image: string;
  floorPrice: number;
  tier: number;
  chips: number;
}

interface NFTSelectorProps {
  setSelectedNFT: (nft: NFT) => void;
}

const NFTSelector: React.FC<NFTSelectorProps> = ({ setSelectedNFT }) => {
  const [userNFTs, setUserNFTs] = useState<NFT[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user's NFTs
    fetchUserNFTs();
  }, []);

  const fetchUserNFTs = () => {
    // Mock data for demonstration
    const mockNFTs: NFT[] = [
      { id: '1', name: 'NFT #1', image: 'https://via.placeholder.com/150', floorPrice: 1000000, tier: 1, chips: 80 },
      { id: '2', name: 'NFT #2', image: 'https://via.placeholder.com/150', floorPrice: 2000, tier: 2, chips: 50 },
      { id: '3', name: 'NFT #3', image: 'https://via.placeholder.com/150', floorPrice: 300, tier: 3, chips: 30 },
    ];
    setUserNFTs(mockNFTs);
  };

  const handleNFTSelect = (nft: NFT) => {
    setSelectedNFT(nft);
    navigate('/game');
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
            <p>Floor Price: {nft.floorPrice} XRP</p>
            <p>Tier: {nft.tier}</p>
            <p>Chips: {nft.chips}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NFTSelector;