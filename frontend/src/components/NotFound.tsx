// src/components/NotFound.tsx
import React from 'react';

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-6xl font-bold text-gray-800">404</h1>
      <p className="text-2xl text-gray-600">Page Not Found</p>
      <a href="/" className="mt-4 text-blue-500 hover:underline">
        Go Back Home
      </a>
    </div>
  );
};

export default NotFound;
