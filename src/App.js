// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import NumberSymbolCards from './components/NumberSymbolCards';
import MathHighLowGame from './components/MathHighLowGame/MathHighLowGame.tsx';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="bg-gray-800 p-4">
          <ul className="flex space-x-4">
            <li>
              <Link to="/" className="text-white hover:text-gray-300">Home</Link>
            </li>
            <li>
              <Link to="/number-symbol-cards" className="text-white hover:text-gray-300">Number Symbol Cards</Link>
            </li>
            <li>
              <Link to="/math-highlow-game" className="text-white hover:text-gray-300">Math High-Low Game</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={
            <div className="p-4">
              <h1 className="text-3xl font-bold mb-4">Welcome to Math Games</h1>
              <p>Choose a game from the navigation menu above.</p>
            </div>
          } />
          <Route path="/number-symbol-cards" element={
            <div className="p-4">
              <h1 className="text-3xl font-bold mb-4">Number and Symbol Cards</h1>
              <NumberSymbolCards />
            </div>
          } />
          <Route path="/math-highlow-game" element={<MathHighLowGame />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;