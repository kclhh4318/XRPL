

import React, { useState, useEffect } from 'react';

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    // 실제 데이터 fetching 로직은 나중에 구현
    setLeaders([
      { rank: 1, address: '0x1234...5678', score: 1000, nftWeight: 5 },
      { rank: 2, address: '0x5678...9012', score: 900, nftWeight: 4 },
      { rank: 3, address: '0x9012...3456', score: 800, nftWeight: 3 },
    ]);
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 text-left">Rank</th>
            <th className="p-2 text-left">Address</th>
            <th className="p-2 text-left">Score</th>
            <th className="p-2 text-left">NFT Weight</th>
          </tr>
        </thead>
        <tbody>
          {leaders.map((leader) => (
            <tr key={leader.rank} className="border-b">
              <td className="p-2">{leader.rank}</td>
              <td className="p-2">{leader.address}</td>
              <td className="p-2">{leader.score}</td>
              <td className="p-2">{leader.nftWeight}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;