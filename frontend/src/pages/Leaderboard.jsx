import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '../components/ui/Card'; // 기존의 Card 컴포넌트 재사용

const Leaderboard = () => {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    // 가정된 API 요청으로 리더보드 데이터 가져오기
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get('/api/leaderboard'); // 실제 API 엔드포인트 필요
        setPlayers(response.data.players);
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">High-Low Game Leaderboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {players.map((player, index) => (
          <Card 
            key={index} 
            title={`Rank ${index + 1}: ${player.username}`} 
            description={`Score: ${player.score}`} 
            content={`Games Played: ${player.gamesPlayed}`} 
          />
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
