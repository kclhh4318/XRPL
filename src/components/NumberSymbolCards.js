import React from 'react';

const Card = ({ content, color }) => (
  <div className={`w-16 h-24 bg-white rounded-lg shadow-md flex items-center justify-center m-2 ${color}`}>
    <span className="text-4xl font-bold">{content}</span>
  </div>
);

const NumberSymbolCards = () => {
  const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  const symbols = ['-', '+', '×', '÷', '√'];

  return (
    <div className="p-4 bg-gray-200">
      <h1 className="text-2xl font-bold mb-4">Number and Symbol Cards</h1>
      <div className="flex flex-wrap justify-center mb-4">
        {numbers.map((num, index) => (
          <Card key={index} content={num} color="text-yellow-600" />
        ))}
      </div>
      <div className="flex flex-wrap justify-center">
        {symbols.map((symbol, index) => (
          <Card key={index} content={symbol} color="text-red-600" />
        ))}
      </div>
    </div>
  );
};

export default NumberSymbolCards;