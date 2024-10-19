// src/components/Layout.tsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { onAuthStateChanged, User } from 'firebase/auth';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login'); // Redirect to login page after logout
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Section */}
      <header className="bg-gray-800 p-4 text-white">
        <nav className="flex justify-between items-center">
          <div className="space-x-4">
            <Link to="/" className="hover:underline">Home</Link>
            <Link to="/clubs" className="hover:underline">Clubs</Link>
            <Link to="/events" className="hover:underline">Events</Link>
          </div>
          <div className="space-x-4">
            {user ? (
              <>
                <Link to="/profile" className="hover:underline">Profile</Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 px-3 py-1 rounded hover:bg-red-500"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="hover:underline">Login</Link>
            )}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow">{children}</main>

      {/* Footer Section */}
      <footer className="bg-gray-900 text-white text-center py-4">
        &copy; 2024 Clubhouse. All rights reserved.
      </footer>
    </div>
  );
};

export default Layout;
