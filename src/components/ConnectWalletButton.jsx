import { useState } from "react";
import WalletListModal from "./WalletListModal";

function ConnectWalletButton({ onClick, isConnecting }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => {
          setIsOpen(true);
        }}
        className="p-2 bg-gradient-to-r from-[#8EC5FC] to-[#E0C3FC] rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg hover:shadow-xl transition-shadow duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
      >
        <svg
          className="w-6 h-6 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </button>
      <WalletListModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        onConnect={onClick}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}

export default ConnectWalletButton;
