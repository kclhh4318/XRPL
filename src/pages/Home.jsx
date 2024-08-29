import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import ConnectWalletButton from '../components/ConnectWalletButton';

const Home = () => {
  const { walletAddress } = useWallet();
  const navigate = useNavigate();

  if (walletAddress) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen pt-24 bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 text-center font-raleway">
      <p className="text-lg md:text-xl mb-2">Discover, collect and trade</p>
      <p className="text-lg md:text-xl mb-12">Unique Digital Assets</p>
      <h2 className="text-5xl md:text-7xl font-bold mb-12">Trade Your NFT</h2>
      <ConnectWalletButton />
    </div>
  );
};

export default Home;
