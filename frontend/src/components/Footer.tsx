// src/components/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom'; // Assuming you're using react-router

const Footer = () => {
  return (
    <footer className="footer-gradient">
      <div className="flex flex-col items-center mb-4">
        <div className="space-x-4 mb-2">
          <Link to="/" className="footer-link">Home</Link>
          <Link to="/events" className="footer-link">Events</Link>
          <Link to="/clubs" className="footer-link">Clubs</Link>
        </div>
        <p className="text-sm">&copy; 2024 Clubhouse. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
