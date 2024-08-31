import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { isInstalled } from "@gemwallet/api";

function WalletListModal({ isOpen, onClose, onConnect }) {
  const modalRef = useRef(null);
  const [isGemWalletInstalled, setIsGemWalletInstalled] = useState(null);

  useEffect(() => {
    isInstalled().then((response) => {
      setIsGemWalletInstalled(response.result.isInstalled);
    });
  }, [isOpen]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg p-6 w-full max-w-[425px] relative"
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
        <p className="text-gray-600 mb-4">
          Choose a wallet to connect to our dApp.
        </p>
        <div className="space-y-4">
          <button
            onClick={() => onConnect()}
            className="w-full flex items-center justify-start space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">💎</span>
                <span className="text-black font-medium">Gem Wallet</span>
              </div>

              {isGemWalletInstalled !== null &&
                (isGemWalletInstalled ? (
                  <span className="text-green-500 text">Installed</span>
                ) : (
                  <span className="text-red-500">Not Installed</span>
                ))}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default WalletListModal;
