import React from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../contexts/WalletContext";
import { ArrowRight, Gamepad2, Coins, Globe } from "lucide-react";

const ConnectWalletButton = () => {
  const { connectWallet } = useWallet();
  return (
    <button
      onClick={connectWallet}
      className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
    >
      Connect Wallet
    </button>
  );
};

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <Icon className="w-12 h-12 text-purple-600 mb-4" />
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const Home = () => {
  const { walletAddress } = useWallet();
  const navigate = useNavigate();

  if (walletAddress) {
    navigate("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 text-gray-800 font-sans">
      <header className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold">NFT Gaming Hub</h1>
      </header>

      <main className="container mx-auto px-4">
        <section className="text-center py-16">
          <h2 className="text-5xl md:text-7xl font-bold mb-6">
            Revolutionizing NFT value
          </h2>
          <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto">
            Use your NFTs across multiple gaming platforms and earn incentives
            based on their value.
          </p>
          <ConnectWalletButton />
        </section>

        <section className="py-16">
          <h2 className="text-3xl font-bold mb-8 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Globe}
              title="Cross-Platform Compatibility"
              description="Use your NFTs on multiple gaming platforms, expanding their utility and value."
            />
            <FeatureCard
              icon={Gamepad2}
              title="Gaming Integration"
              description="Seamlessly integrate your NFTs into various games for enhanced gameplay experiences."
            />
            <FeatureCard
              icon={Coins}
              title="Value-Based Incentives"
              description="Earn rewards based on your NFT's value as you play games on our platform."
            />
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-md p-8 my-16">
          <h2 className="text-3xl font-bold mb-4">Join the Revolution</h2>
          <p className="text-xl mb-6">
            Be part of the future of gaming where your digital assets have real
            value across multiple platforms.
          </p>
          <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105 flex items-center">
            Learn More <ArrowRight className="ml-2" />
          </button>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 NFT Gaming Hub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
