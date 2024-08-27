import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Collections = () => {
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await axios.get('https://api.reservoir.tools/collections/v5', {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.REACT_APP_RESERVOIR_API_KEY
          }
        });
        console.log(response.data.collections); // 응답 데이터 확인
        setCollections(response.data.collections);
      } catch (error) {
        console.error('Error fetching collection data:', error);
      }
    };
  
    fetchCollections();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">NFT Collections Ranking</h1>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-900 text-white">
          <thead>
            <tr className="bg-gray-800">
              <th className="py-2 px-4 text-left">#</th>
              <th className="py-2 px-4 text-left">Collection</th>
              <th className="py-2 px-4 text-right">Floor</th>
              <th className="py-2 px-4 text-right">24h Volume</th>
              <th className="py-2 px-4 text-right">24h Volume Change</th>
              <th className="py-2 px-4 text-right">On Sale</th>
              <th className="py-2 px-4 text-right">Unique Owners</th>
              <th className="py-2 px-4 text-right">Total Volume</th>
            </tr>
          </thead>
          <tbody>
            {collections.map((collection, index) => (
              <tr key={collection.id} className="border-b border-gray-800">
                <td className="py-2 px-4">{index + 1}</td>
                <td className="py-2 px-4 flex items-center space-x-4">
                  <img src={collection.image} alt={collection.name} className="w-10 h-10 object-cover rounded-md" />
                  <span>{collection.name}</span>
                </td>
                <td className="py-2 px-4 text-right">
                  {collection.floorAsk?.price?.amount?.native || 'N/A'} ETH
                </td>
                <td className="py-2 px-4 text-right">
                  {collection.volume?.['1day'] || 'N/A'} ETH
                </td>
                <td className="py-2 px-4 text-right">
                  {collection.volumeChange?.['1day'] ? `${(collection.volumeChange['1day'] * 100).toFixed(2)}%` : 'N/A'}
                </td>
                <td className="py-2 px-4 text-right">
                  {collection.onSaleCount || 'N/A'}
                </td>
                <td className="py-2 px-4 text-right">
                  {collection.ownerCount || 'N/A'}
                </td>
                <td className="py-2 px-4 text-right">
                  {collection.volume?.allTime || 'N/A'} ETH
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Collections;
