// src/components/EventCard.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface EventCardProps {
  id: string; // Unique identifier for the event
  title: string;
  date: string;
  image: string;
  description: string;
}

const EventCard: React.FC<EventCardProps> = ({ id, title, date, image, description }) => {
  const [imgError, setImgError] = useState(false); // State to handle image loading error
  const [isLoading, setIsLoading] = useState(true); // State to handle loading status

  return (
    <Link to={`/events/${id}`} className="no-underline">
      <div className="relative group p-6 shadow-lg bg-white/80 backdrop-blur-md rounded-2xl transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:bg-white/90">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-30 rounded-2xl transition-opacity duration-500"></div>
        
        {/* Image with loading state and error handling */}
        {isLoading && !imgError && (
          <div className="h-40 w-full flex justify-center items-center">
            <span className="loader"></span> {/* Optional loader or spinner */}
          </div>
        )}
        <img
          src={imgError ? 'https://via.placeholder.com/150?text=Image+Not+Found' : image}
          alt={`Event: ${title}`} // Improved alt text
          className={`h-40 w-full object-cover rounded-t-lg mb-4 ${isLoading ? 'hidden' : 'block'}`} // Hide image during loading
          onLoad={() => setIsLoading(false)} // Update loading state when image loads
          onError={() => setImgError(true)} // Handle image load error
        />
        
        <h3 className="text-2xl font-bold text-gray-800 group-hover:text-indigo-600 transition-colors duration-300">
          {title}
        </h3>
        <p className="text-sm text-gray-500">{date}</p>
        <p className="mt-2 text-gray-600">{description}</p>
      </div>
    </Link>
  );
};

export default EventCard;
