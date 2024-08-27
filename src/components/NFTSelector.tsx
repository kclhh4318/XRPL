import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAndWeightUserNFTs } from './nftWeightingLogic';

interface NFT {
  id: string;
  name: string;
  image: string;
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
    fetchUserNFTs();
  }, []);

  const fetchUserNFTs = async () => {
    try {
      const weightedNFTs = await fetchAndWeightUserNFTs();
      setUserNFTs(weightedNFTs);
    } catch (error) {
      console.error('Error fetching user NFTs:', error);
      // Handle error (e.g., show error message to user)
    }
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
            <p>Tier: {nft.tier}</p>
            <p>Chips: {nft.chips}</p>
          </div>
        ))}
      </div>
      {userNFTs.length === 0 && (
        <div className="text-center mt-8">
          <p>You don't have any NFTs. You'll start with 10 chips.</p>
          <button 
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => handleNFTSelect({ id: '0', name: 'No NFT', image: '', tier: 5, chips: 10 })}
          >
            Start Game with 10 Chips
          </button>
        </div>
      )}
    </div>
  );
};

export default NFTSelector;