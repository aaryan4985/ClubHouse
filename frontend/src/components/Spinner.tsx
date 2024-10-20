// src/components/Spinner.tsx
import React from 'react';

const Spinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
  </div>
);

export default Spinner;
