import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Profile = () => {
  const [userNFTs, setUserNFTs] = useState([]);
  const [userAddress, setUserAddress] = useState('');

  useEffect(() => {
    // 실제 데이터 fetching 로직은 나중에 구현
    setUserAddress('0x1234...5678');
    setUserNFTs([
      { id: 1, name: 'NFT #1', image: 'https://via.placeholder.com/150' },
      { id: 2, name: 'NFT #2', image: 'https://via.placeholder.com/150' },
      { id: 3, name: 'NFT #3', image: 'https://via.placeholder.com/150' },
    ]);
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">User Profile</h1>
      <p className="text-xl mb-4">Address: {userAddress}</p>
      <h2 className="text-2xl font-semibold mb-4">Your NFTs</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {userNFTs.map((nft) => (
          <Link key={nft.id} to={`/nft/${nft.id}`} className="block">
            <div className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <img src={nft.image} alt={nft.name} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="text-lg font-semibold">{nft.name}</h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Profile;