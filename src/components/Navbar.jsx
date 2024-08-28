import React, { useState } from "react";
import { Link } from "react-router-dom";
import Button from "./ui/Button";
import { useWallet } from "../contexts/WalletContext";
import ConnectWalletButton from "./ConnectWalletButton";
import { isInstalled, getNetwork, getAddress } from "@gemwallet/api";

const Navbar = () => {
  const { walletAddress, setWalletAddress } = useWallet();

  const handleConnect = async () => {
    const addressResponse = await getAddress();
    if (addressResponse.type === "response") {
      setWalletAddress(addressResponse.result.address);
    }
  };

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-xl font-bold">
          NFT Marketplace
        </Link>
        <div className="flex items-center space-x-4">
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
          {walletAddress ? (
            <Link to="/profile" className="text-white hover:text-gray-300">
              {walletAddress}
            </Link>
          ) : (
            <ConnectWalletButton onClick={handleConnect} />
            // <Button onClick={handleConnect}>Connect Wallet</Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
