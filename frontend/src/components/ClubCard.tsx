// src/components/ClubCard.tsx
import React from 'react';

interface ClubCardProps {
  name: string;
  description: string;
  logo: string;
}

const ClubCard: React.FC<ClubCardProps> = ({ name, description, logo }) => {
  console.log('Club logo URL:', logo); // Debugging logo URL

  return (
    <div className="p-6 shadow-lg bg-white rounded-lg hover:shadow-xl transition-shadow duration-300 transform hover:scale-105">
      <img
        src={logo || 'https://example.com/fallback-image.png'} // Provide fallback image
        alt={`${name} Logo`}
        className="h-24 w-24 mx-auto rounded-full border-2 border-indigo-600 mb-4"
      />
      <h3 className="text-2xl font-bold text-center text-gray-800">{name}</h3>
      <p className="text-gray-600 text-center mt-2">{description}</p>
    </div>
  );
};

export default ClubCard;
