import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Collections from "./pages/Collections";
import NFTDetail from "./pages/NFTDetail";
import Leaderboard from "./pages/Leaderboard";
import Swap from "./pages/Swap";
import Profile from "./pages/Profile";
import MathHighLowGame from "./components/MathHighLowGame/MathHighLowGame";
import NFTSelector from "./components/NFTSelector";
import JoinGame from "./pages/JoinGame";
import { WalletProvider } from "./contexts/WalletContext";
import InteractiveBackground from './components/InteractiveBackground';

function App() {
  const [selectedNFT, setSelectedNFT] = useState(null);

  return (
    <WalletProvider>
      <Router>
        <div className="App">
        <InteractiveBackground />
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/nft/:id" element={<NFTDetail />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/swap" element={<Swap />} />
            <Route path="/profile" element={<Profile />} />
            <Route
              path="/select-nft"
              element={<NFTSelector setSelectedNFT={setSelectedNFT} />}
            />
            <Route path="/join-game" element={<JoinGame />} />
            <Route
              path="/game"
              element={<MathHighLowGame selectedNFT={selectedNFT} />}
            />
          </Routes>
        </div>
      </Router>
    </WalletProvider>
  );
}

export default App;