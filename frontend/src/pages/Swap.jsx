import React, { useState } from "react";
import { isInstalled, getAddress, submitTransaction } from "@gemwallet/api";
import { useWallet } from "../contexts/WalletContext";
import { swapTokens } from "../utils/swap";

const TO_TOKEN = "NBL";

function Swap() {
  const {
    walletAddress,
    // disconnectWallet,
  } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [isXRPtoHYB, setIsXRPtoHYB] = useState(true); // true for XRP to HYB, false for HYB to XRP
  const [amount, setAmount] = useState("0.0");
  const [slippage, setSlippage] = useState("0.5");
  const [error, setError] = useState(null);

  const handleExchange = () => {
    setIsXRPtoHYB(!isXRPtoHYB);
    setAmount(amount);
  };

  const handleSwap = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const fromCurrency = isXRPtoHYB ? "XRP" : TO_TOKEN;
      const toCurrency = isXRPtoHYB ? TO_TOKEN : "XRP";

      await swapTokens(amount, fromCurrency, amount, toCurrency, walletAddress);

      setAmount("0.0");
    } catch (error) {
      setError("Swap failed. Please try again." + error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 mt-6">
      <h1 className="text-2xl font-bold text-purple-800 mb-2">Swap</h1>
      <p className="text-purple-600 mb-4">Trade tokens in an instant</p>

      {/* <div className="flex justify-end space-x-2 mb-4">
        <span className="text-yellow-500">💰</span>
        <span className="text-purple-500">📊</span>
        <span className="text-purple-500">⚙️</span>
        <span className="text-purple-500">🕒</span>
        <span className="text-purple-300">🔄</span>
      </div> */}

      <div className="bg-purple-100 rounded-lg p-4 mb-2">
        <div className="flex items-center mb-2">
          <img
          className="rounded-full mr-1"
            src={isXRPtoHYB ? "xrp.png" : "nbl.png"}
            width={25}
            height={25}
            alt="swap1"
          />

          <span className="text-purple-800 font-bold">
            {isXRPtoHYB ? "XRP" : TO_TOKEN}
          </span>
        </div>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full bg-transparent text-right text-2xl"
          placeholder="0.0"
        />
      </div>

      <div className="flex justify-center mb-2">
        <button
          onClick={handleExchange}
          className="bg-gray-200 hover:bg-gray-300 rounded-full p-2 transition duration-300"
        >
          🔄
        </button>
      </div>

      <div className="bg-purple-100 rounded-lg p-4 mb-4">
        <div className="flex items-center mb-2">
          <img
          className="rounded-full mr-1"
            src={!isXRPtoHYB ? "xrp.png" : "nbl.png"}
            width={25}
            height={25}
            alt="swap2"
          />
          <span className="text-purple-800 font-bold">
            {isXRPtoHYB ? TO_TOKEN : "XRP"}
          </span>
          <span className="ml-auto">📋</span>
        </div>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full bg-transparent text-right text-2xl"
          placeholder="0.0"
        />
      </div>

      {/* {!walletAddress && (
        <button
          onClick={connectWallet}
          disabled={isLoading}
          className="w-full bg-teal-400 text-white py-3 rounded-lg font-bold hover:bg-teal-500 transition duration-300"
        >
          {isLoading ? "Connecting..." : "Connect Wallet"}
        </button>
      )} */}

      {walletAddress && (
        <button
          onClick={handleSwap}
          disabled={isLoading}
          className="w-full bg-teal-400 text-white py-3 rounded-lg font-bold hover:bg-teal-500 transition duration-300"
        >
          {isLoading ? "Swapping..." : "Swap"}
        </button>
      )}

      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
}

export default Swap;
