// src/components/UserProfile.tsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

const UserProfile: React.FC = () => {
  const { user, userInfo, logout } = useAuth();

  // If no user is logged in
  if (!user) {
    return <Spinner />; // Show spinner while loading
  }

  // If we're still loading the user info from AuthContext
  if (!userInfo) {
    return <Spinner />; // Show spinner while loading
  }

  return (
    <div className="flex flex-col items-center p-4 bg-gray-100 min-h-screen">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-center mb-4">Welcome, {userInfo.name}!</h1>
        <div className="mb-4 text-center">
          <p className="text-gray-600">Age: {userInfo.age}</p>
        </div>
        <button
          onClick={async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout failed:', error);
            }
          }}
          className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
