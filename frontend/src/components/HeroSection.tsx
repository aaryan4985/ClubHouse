// src/components/HeroSection.tsx
import React from 'react';

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16 px-10 text-center rounded-lg shadow-lg">
      <h2 className="text-4xl font-extrabold mb-4">One Platform, Endless Opportunities.</h2>
      <p className="text-lg mb-6">
        Explore, Collaborate, and Build with the best clubs and events.
      </p>
      <button className="bg-white text-indigo-600 font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-gray-100 transition-transform transform hover:scale-105">
        Get Started
      </button>
    </section>
  );
};

export default HeroSection;
