import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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

const NFTSelector: React.FC<NFTSelectorProps> = ({ setSelectedNFT }) => {
  const [userNFTs, setUserNFTs] = useState<NFT[]>([]);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedWalletAddress = localStorage.getItem('walletAddress');
    setWalletAddress(storedWalletAddress);

    if (storedWalletAddress) {
      const fetchUserNFTs = async () => {
        try {
          console.log(`Using wallet address: ${storedWalletAddress}`);
          const response = await axios.get(`http://34.64.116.169:8000/api/get_nfts/${storedWalletAddress}`);
          console.log('API response:', response.data);

          const fetchedNFTs: NFT[] = response.data.map((nft: any) => ({
            id: nft.id,
            name: nft.name,
            image: nft.image,
            tier: nft.tier,
            maxChips: nft.max_chips,
          }));
          setUserNFTs(fetchedNFTs);
        } catch (error) {
          console.error('Failed to fetch NFTs:', error);
        }
      };

      fetchUserNFTs();
    } else {
      console.error('No wallet address found in local storage.');
    }
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
