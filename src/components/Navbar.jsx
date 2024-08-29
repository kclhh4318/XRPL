// src/components/Navbar.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useWallet } from "../contexts/WalletContext";
import ConnectWalletButton from "./ConnectWalletButton";

const Navbar = () => {
  const { walletAddress } = useWallet();

  return (
    <nav className="bg-gray-900 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-xl font-bold">
          NFT Marketplace
        </Link>
        <div className="flex items-center space-x-6">
          <div className="flex space-x-4">
            <Link to="/collections" className="text-white hover:text-gray-300">
              Collections
            </Link>
            <Link to="/leaderboard" className="text-white hover:text-gray-300">
              Leaderboard
            </Link>
            <Link to="/swap" className="text-white hover:text-gray-300">
              Swap
            </Link>
            <Link to="/select-nft" className="text-white hover:text-gray-300">
              Game
            </Link>
          </div>
          {walletAddress ? (
            <Link to="/profile" className="text-white hover:text-gray-300">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </Link>
          ) : (
            <ConnectWalletButton />
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;