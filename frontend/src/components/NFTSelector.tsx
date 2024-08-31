import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import axios from 'axios';  // API 호출을 사용하지 않으므로 주석 처리

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
  // const [walletAddress, setWalletAddress] = useState<string | null>(null);  // 더미 데이터를 사용하므로 주석 처리
  const navigate = useNavigate();

  useEffect(() => {
    // 더미 NFT 데이터
    const dummyNFTs: NFT[] = [
      { id: '1', name: 'Cool Cat #1', image: 'https://placekitten.com/200/200', tier: 1, maxChips: 100 },
      { id: '2', name: 'Bored Ape #42', image: 'https://placekitten.com/201/201', tier: 2, maxChips: 200 },
      { id: '3', name: 'Crypto Punk #007', image: 'https://placekitten.com/202/202', tier: 3, maxChips: 300 },
      { id: '4', name: 'Doodle #123', image: 'https://placekitten.com/203/203', tier: 2, maxChips: 150 },
    ];

    setUserNFTs(dummyNFTs);

    // 실제 API 호출 부분 주석 처리
    /*
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
          console.log('Fetched NFTs:', fetchedNFTs);
          setUserNFTs(fetchedNFTs);
        } catch (error) {
          console.error('Failed to fetch NFTs:', error);
        }
      };

      fetchUserNFTs();
    } else {
      console.error('No wallet address found in local storage.');
    }
    */
  }, []);

  const handleNFTSelect = (nft: NFT) => {
    console.log('Selected NFT:', nft);
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