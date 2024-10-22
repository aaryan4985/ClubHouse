// src/components/Header.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, getAuth, User } from 'firebase/auth';
import Sidebar from './Sidebar';
import { app } from '../firebase';

interface HeaderProps {
  currentUser: User | null;
  handleLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, handleLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const auth = getAuth(app);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // This effect can be removed if you receive currentUser as a prop from Layout
    });
    return () => unsubscribe();
  }, [auth]);

  return (
    <header className="relative p-6 flex justify-between items-center shadow-lg animate-gradient bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      {/* Logo */}
      <h1 className="text-4xl font-extrabold text-white tracking-wider hover:scale-105 transition-transform duration-300">
        <Link to="/">ClubHouse</Link>
      </h1>

      {/* Navigation Links */}
      <nav className="hidden md:flex space-x-8 items-center">
        <Link to="/events" className="text-lg font-semibold text-white hover:scale-110 hover:text-gray-200 transition-transform duration-300">
          Events
        </Link>
        <Link to="/clubs" className="text-lg font-semibold text-white hover:scale-110 hover:text-gray-200 transition-transform duration-300">
          Clubs
        </Link>
        
        {/* New Leaderboard Link */}
        <Link to="/leaderboard" className="text-lg font-semibold text-white hover:scale-110 hover:text-gray-200 transition-transform duration-300">
          Leaderboard
        </Link>
        
        {/* Resume Builder Link - Only shown when user is logged in */}
        {currentUser && (
          <Link to="/resume-builder" className="text-lg font-semibold text-white hover:scale-110 hover:text-gray-200 transition-transform duration-300">
            Resume Builder
          </Link>
        )}

        {!currentUser ? (
          <>
            <Link to="/login" className="text-lg font-semibold text-white hover:scale-110 hover:text-gray-200 transition-transform duration-300">
              Login
            </Link>
            <Link to="/signup" className="text-lg font-semibold text-white hover:scale-110 hover:text-gray-200 transition-transform duration-300">
              Sign Up
            </Link>
          </>
        ) : (
          <>
            <button
              onClick={handleLogout}
              className="text-lg font-semibold text-white hover:scale-110 hover:text-gray-200 transition-transform duration-300"
            >
              Logout
            </button>

            <button
              className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-lg hover:scale-110 transition-transform duration-300 ml-4"
              onClick={() => navigate('/profile')}
            >
              <img
                src={currentUser?.photoURL || 'https://via.placeholder.com/40'}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </button>
          </>
        )}
      </nav>

      {/* Sidebar Toggle for Mobile */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden text-white text-2xl hover:scale-125 transition-transform duration-300"
      >
        ☰
      </button>

      {/* Sidebar */}
      {isSidebarOpen && (
        <div className="absolute top-full left-0 w-full bg-purple-600 shadow-lg transition-transform duration-500 ease-in-out">
          <Sidebar />
        </div>
      )}
    </header>
  );
};

export default Header;
