import React from 'react';

const Card = ({ title, description, content }) => {
  return (
    <div className="bg-gray-800 text-white rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-lg font-bold mb-2">{description}</p>
      <p className="text-sm">{content}</p>
    </div>
  );
};

export default Card;
