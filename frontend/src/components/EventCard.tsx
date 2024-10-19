// src/components/EventCard.tsx
import React from 'react';

interface EventCardProps {
  title: string;
  date: string;
  image: string;
  description: string;
}

const EventCard: React.FC<EventCardProps> = ({ title, date, image, description }) => (
  <div className="p-6 shadow-lg bg-white rounded-lg hover:shadow-xl transition-shadow duration-300 transform hover:scale-105">
    <img src={image} alt={title} className="h-40 w-full object-cover rounded-t-lg mb-4" />
    <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
    <p className="text-sm text-gray-500">{date}</p>
    <p className="mt-2 text-gray-600">{description}</p>
  </div>
);

export default EventCard;
