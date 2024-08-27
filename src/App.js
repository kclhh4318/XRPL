import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Collections from './pages/Collections';
import NFTDetail from './pages/NFTDetail';
import Leaderboard from './pages/Leaderboard';
import Swap from './pages/Swap';
import Profile from './pages/Profile';
import MathHighLowGame from './components/MathHighLowGame/MathHighLowGame';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/nft/:id" element={<NFTDetail />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/swap" element={<Swap />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/game" element={<MathHighLowGame />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;