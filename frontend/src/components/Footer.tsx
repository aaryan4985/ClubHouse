// src/components/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom'; // Assuming you're using react-router for navigation

const Footer = () => {
  return (
    <footer className="p-6 bg-gray-800 text-white text-center">
      <div className="mb-4">
        <Link to="/" className="text-white hover:text-gray-400 mx-2">Home</Link>
        <Link to="/events" className="text-white hover:text-gray-400 mx-2">Events</Link>
        <Link to="/clubs" className="text-white hover:text-gray-400 mx-2">Clubs</Link>
        <Link to="/about" className="text-white hover:text-gray-400 mx-2">About Us</Link>
      </div>
      <p className="text-sm">&copy; 2024 Clubhouse. All Rights Reserved.</p>
    </footer>
  );
};

export default Footer;
