import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Collections = () => {
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    // 실제 데이터 fetching 로직은 나중에 구현
    setCollections([
      { id: 1, name: 'Collection 1', image: 'https://via.placeholder.com/150' },
      { id: 2, name: 'Collection 2', image: 'https://via.placeholder.com/150' },
      { id: 3, name: 'Collection 3', image: 'https://via.placeholder.com/150' },
    ]);
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">NFT Collections</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {collections.map((collection) => (
          <Link key={collection.id} to={`/nft/${collection.id}`} className="block">
            <div className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <img src={collection.image} alt={collection.name} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h2 className="text-xl font-semibold">{collection.name}</h2>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Collections;