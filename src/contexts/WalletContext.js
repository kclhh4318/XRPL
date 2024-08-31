import React, { createContext, useContext, useState, useEffect } from "react";
import { isInstalled, getAddress } from "@gemwallet/api";

// WalletContext의 기본 값 설정 (null 대신 빈 객체로)
const WalletContext = createContext({
  walletAddress: "",
  setWalletAddress: () => {},
  connectWallet: () => Promise.resolve(),
});

export const WalletProvider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState(() => {
    return localStorage.getItem("walletAddress") || "";
  });

  useEffect(() => {
    if (walletAddress) {
      localStorage.setItem("walletAddress", walletAddress);
    } else {
      localStorage.removeItem("walletAddress");
    }
  }, [walletAddress]);

  const connectWallet = async () => {
    try {
      const isInstalledResponse = await isInstalled();
      if (isInstalledResponse.result.isInstalled) {
        const addressResponse = await getAddress();
        if (addressResponse.type === "response") {
          setWalletAddress(addressResponse.result.address);
        }
      } else {
        alert("GemWallet is not installed. Please install it to connect.");
      }
    } catch (error) {
      console.error("Error connecting to GemWallet:", error);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        setWalletAddress,
        connectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
