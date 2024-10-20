// src/components/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom'; // Assuming you're using react-router for navigation

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-center py-6">
      <div className="flex flex-col items-center mb-4">
        <div className="space-x-4 mb-2">
          <Link to="/" className="text-white hover:text-gray-400">Home</Link>
          <Link to="/events" className="text-white hover:text-gray-400">Events</Link>
          <Link to="/clubs" className="text-white hover:text-gray-400">Clubs</Link>
          <Link to="/about" className="text-white hover:text-gray-400">About Us</Link>
        </div>
        <p className="text-sm">&copy; 2024 Clubhouse. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
