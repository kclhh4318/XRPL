import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-6">Welcome to Our NFT Marketplace</h1>
      <p className="text-xl mb-8">Discover, collect, and trade unique digital assets.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/collections" className="bg-blue-500 text-white p-6 rounded-lg shadow-md hover:bg-blue-600 transition-colors">
          <h2 className="text-2xl font-semibold mb-2">Browse Collections</h2>
          <p>Explore our curated NFT collections</p>
        </Link>
        
        <Link to="/game" className="bg-green-500 text-white p-6 rounded-lg shadow-md hover:bg-green-600 transition-colors">
          <h2 className="text-2xl font-semibold mb-2">Play Math High-Low</h2>
          <p>Test your math skills and earn rewards</p>
        </Link>
        
        <Link to="/swap" className="bg-purple-500 text-white p-6 rounded-lg shadow-md hover:bg-purple-600 transition-colors">
          <h2 className="text-2xl font-semibold mb-2">Token Swap</h2>
          <p>Easily swap between different tokens</p>
        </Link>
        
        <Link to="/leaderboard" className="bg-yellow-500 text-white p-6 rounded-lg shadow-md hover:bg-yellow-600 transition-colors">
          <h2 className="text-2xl font-semibold mb-2">Leaderboard</h2>
          <p>See top performers and their NFT weights</p>
        </Link>
      </div>
    </div>
  );
};

export default Home;