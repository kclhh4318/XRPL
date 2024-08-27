import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from './ui/Button';

const Navbar = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  const handleConnect = () => {
    // 실제 지갑 연결 로직은 나중에 구현
    setIsConnected(true);
    setWalletAddress('0x1234...5678');
  };

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-xl font-bold">NFT Marketplace</Link>
        <div className="flex items-center space-x-4">
          <Link to="/collections" className="text-white hover:text-gray-300">Collections</Link>
          <Link to="/leaderboard" className="text-white hover:text-gray-300">Leaderboard</Link>
          <Link to="/swap" className="text-white hover:text-gray-300">Swap</Link>
          <Link to="/game" className="text-white hover:text-gray-300">Game</Link>
          {isConnected ? (
            <Link to="/profile" className="text-white hover:text-gray-300">{walletAddress}</Link>
          ) : (
            <Button onClick={handleConnect}>Connect Wallet</Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;