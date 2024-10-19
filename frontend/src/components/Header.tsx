// src/components/Header.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut, getAuth, User } from 'firebase/auth';
import Sidebar from './Sidebar';
import { app } from '../firebase';

const Header: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const auth = getAuth(app);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, [auth]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <header className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 p-6 shadow-lg flex justify-between items-center">
      <h1 className="text-3xl font-extrabold text-white">Clubhouse</h1>

      <nav className="hidden md:flex space-x-8 items-center">
        <Link to="/events" className="text-white hover:text-gray-200">Events</Link>
        <Link to="/clubs" className="text-white hover:text-gray-200">Clubs</Link>

        {!currentUser ? (
          <>
            <Link to="/login" className="text-white hover:text-gray-200">Login</Link>
            <Link to="/signup" className="text-white hover:text-gray-200">Sign Up</Link>
          </>
        ) : (
          <>
            <button onClick={handleLogout} className="text-white hover:text-gray-200">
              Logout
            </button>

            <button
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-white ml-4"
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

      <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden text-white">
        ☰
      </button>

      {isSidebarOpen && <Sidebar />}
    </header>
  );
};

export default Header;
