import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import ConnectWalletButton from './ConnectWalletButton';

const Navbar = () => {
  const location = useLocation();
  const { walletAddress } = useWallet();

  const isActive = (path) => {
    return location.pathname === path ? 'bg-gray-200' : '';
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        <Link to="/" className="text-xl font-bold">
          <span className="text-gray-800">&#9635;</span>NFT
        </Link>
        <div className="flex items-center justify-center">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <Link to="/collections" className={`px-4 py-2 rounded-md ${isActive('/collections')}`}>
              Collection
            </Link>
            <Link to="/leaderboard" className={`px-4 py-2 rounded-md ${isActive('/leaderboard')}`}>
              Leaderboard
            </Link>
            <Link to="/swap" className={`px-4 py-2 rounded-md ${isActive('/swap')}`}>
              Swap
            </Link>
            <Link to="/select-nft" className={`px-4 py-2 rounded-md ${isActive('/select-nft')}`}>
              Game
            </Link>
          </div>
        </div>
        <div>
          {walletAddress ? (
            <div className="bg-gray-100 px-4 py-2 rounded-md">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </div>
          ) : (
            <ConnectWalletButton />
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;