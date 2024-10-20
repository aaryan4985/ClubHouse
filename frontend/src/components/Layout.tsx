// src/components/Layout.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase'; // Import Firebase auth
import { signOut, onAuthStateChanged, User } from 'firebase/auth';
import Header from './Header'; // Import Header
import Footer from './Footer'; // Import Footer

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null); // State to hold current user

  useEffect(() => {
    // Subscribe to authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user); // Update user state
    });
    return () => unsubscribe(); // Cleanup subscription on component unmount
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out the user
      navigate('/login'); // Redirect to login page
    } catch (error) {
      console.error('Error signing out:', error); // Handle sign-out errors
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with user info and logout handler */}
      <Header currentUser={currentUser} handleLogout={handleLogout} />

      {/* Main Content */}
      <main className="flex-grow">{children}</main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout;
