import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Button from '../components/ui/Button';

const NFTDetail = () => {
  const { id } = useParams();
  const [nft, setNFT] = useState(null);

  useEffect(() => {
    // 실제 데이터 fetching 로직은 나중에 구현
    setNFT({
      id,
      name: `NFT #${id}`,
      image: 'https://via.placeholder.com/400',
      description: 'This is a sample NFT description.',
      price: '0.1 ETH',
      owner: '0x1234...5678',
    });
  }, [id]);

  const handleBuy = () => {
    // 실제 구매 로직은 나중에 구현
    alert('Buy functionality will be implemented later');
  };

  if (!nft) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/2">
          <img src={nft.image} alt={nft.name} className="w-full rounded-lg shadow-lg" />
        </div>
        <div className="md:w-1/2 md:pl-8 mt-4 md:mt-0">
          <h1 className="text-3xl font-bold mb-4">{nft.name}</h1>
          <p className="text-gray-600 mb-4">{nft.description}</p>
          <p className="text-xl font-semibold mb-2">Price: {nft.price}</p>
          <p className="text-gray-600 mb-4">Owner: {nft.owner}</p>
          <Button onClick={handleBuy}>Buy Now</Button>
        </div>
      </div>
    </div>
  );
};

export default NFTDetail;