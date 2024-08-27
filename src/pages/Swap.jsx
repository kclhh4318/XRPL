import React, { useState } from 'react';
import Button from '../components/ui/Button';

const Swap = () => {
  const [fromToken, setFromToken] = useState('');
  const [toToken, setToToken] = useState('');
  const [amount, setAmount] = useState('');

  const handleSwap = () => {
    // 실제 스왑 로직은 나중에 구현
    alert(`Swap ${amount} ${fromToken} to ${toToken} will be implemented later`);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Swap Tokens</h1>
      <div className="max-w-md mx-auto">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fromToken">
            From
          </label>
          <select
            id="fromToken"
            value={fromToken}
            onChange={(e) => setFromToken(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="">Select token</option>
            <option value="ETH">ETH</option>
            <option value="USDT">USDT</option>
            <option value="DAI">DAI</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="toToken">
            To
          </label>
          <select
            id="toToken"
            value={toToken}
            onChange={(e) => setToToken(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="">Select token</option>
            <option value="ETH">ETH</option>
            <option value="USDT">USDT</option>
            <option value="DAI">DAI</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="amount">
            Amount
          </label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter amount"
          />
        </div>
        <Button onClick={handleSwap} className="w-full">Swap</Button>
      </div>
    </div>
  );
};

export default Swap;