// src/components/ClubCard.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface ClubCardProps {
  name: string;
  description: string;
  imageUrl: string; // This should be the full URL to the logo image
  clubId: string;
}

const ClubCard: React.FC<ClubCardProps> = ({
  name,
  description,
  imageUrl,
  clubId,
}) => {
  const [imgError, setImgError] = useState(false); // State to handle image loading error
  const [isLoading, setIsLoading] = useState(true); // State to handle loading status

  return (
    <Link to={`/clubs/${clubId}`} className="no-underline">
      <div className="relative group p-8 shadow-lg bg-white/80 backdrop-blur-md rounded-2xl transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:bg-white/90">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-30 rounded-2xl transition-opacity duration-500"></div>
        
        {/* Image with loading state and error handling */}
        {isLoading && !imgError && (
          <div className="h-32 w-32 mx-auto flex justify-center items-center">
            <span className="loader"></span> {/* Optional loader or spinner */}
          </div>
        )}
        <img
          src={imgError ? 'https://via.placeholder.com/150?text=Logo+Not+Found' : imageUrl}
          alt={`imageUrl of ${name}`} // Improved alt text
          className={`h-32 w-32 mx-auto rounded-full border-4 border-indigo-600 mb-6 ${isLoading ? 'hidden' : 'block'}`} // Hide image during loading
          onLoad={() => setIsLoading(false)} // Update loading state when image loads
          onError={() => setImgError(true)} // Handle image load error
        />
        
        <h3 className="text-3xl font-bold text-center text-gray-900 group-hover:text-indigo-600 transition-colors duration-300">
          {name}
        </h3>
        <p className="text-gray-700 text-center mt-2 group-hover:text-purple-600 transition-colors duration-300">
          {description}
        </p>
      </div>
    </Link>
  );
};

export default ClubCard;
