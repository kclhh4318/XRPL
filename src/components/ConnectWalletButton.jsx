// src/components/ConnectWalletButton.jsx
import React from 'react';
import { useWallet } from '../contexts/WalletContext';

const ConnectWalletButton = () => {
  const { connectWallet } = useWallet();

  return (
    <button
      onClick={connectWallet}
      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full flex items-center justify-center"
    >
      <svg className="w-5 h-5 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
      </svg>
      Connect Your Wallet
    </button>
  );
};

export default ConnectWalletButton;