import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Collections = () => {
  const [collections, setCollections] = useState([]);
  const [activeTab, setActiveTab] = useState('trending');

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await axios.get('https://marketplace-api.onxrp.com/api/collections?page=1&per_page=20&sort=total_volume&order=desc&filters[status]=active&filters[listed_nfts]=true', {
          headers: {
            'Content-Type': 'application/json',
          }
        });
        setCollections(response.data.data);
      } catch (error) {
        console.error('Error fetching collection data:', error);
      }
    };

    fetchCollections();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">NFT Collections Ranking</h1>
      
      <div className="mb-4">
        <button
          className={`mr-4 px-4 py-2 rounded ${activeTab === 'trending' ? 'bg-gray-200' : ''}`}
          onClick={() => setActiveTab('trending')}
        >
          Trending
        </button>
        <button
          className={`px-4 py-2 rounded ${activeTab === 'favorite' ? 'bg-gray-200' : ''}`}
          onClick={() => setActiveTab('favorite')}
        >
          Favorite
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-4 text-left">#</th>
              <th className="py-2 px-4 text-left">Collection</th>
              <th className="py-2 px-4 text-right">Floor Price</th>
              <th className="py-2 px-4 text-right">24h Volume</th>
              <th className="py-2 px-4 text-right">7 Days Volume</th>
              <th className="py-2 px-4 text-right">Monthly Volume</th>
              <th className="py-2 px-4 text-right">Total Volume</th>
              <th className="py-2 px-4 text-right">Listed NFTs</th>
            </tr>
          </thead>
          <tbody>
            {collections.map((collection, index) => (
              <tr key={collection.id} className="border-b">
                <td className="py-2 px-4">{index + 1}</td>
                <td className="py-2 px-4 flex items-center space-x-4">
                  <img src={collection.picture_url} alt={collection.name} className="w-10 h-10 object-cover rounded-md" />
                  <span>{collection.name}</span>
                </td>
                <td className="py-2 px-4 text-right">
                  {collection.floor_price} {collection.floor_price_type?.toUpperCase() || 'N/A'}
                </td>
                <td className="py-2 px-4 text-right">
                  {collection.daily_volume || 'N/A'} XRP
                </td>
                <td className="py-2 px-4 text-right">
                  {collection.weekly_volume || 'N/A'} XRP
                </td>
                <td className="py-2 px-4 text-right">
                  {collection.monthly_volume || 'N/A'} XRP
                </td>
                <td className="py-2 px-4 text-right">
                  {collection.total_volume || 'N/A'} XRP
                </td>
                <td className="py-2 px-4 text-right">
                  {collection.nfts_listed_count || 'N/A'}
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
