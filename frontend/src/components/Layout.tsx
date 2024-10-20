// src/components/Layout.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../firebase'; 
import { signOut, onAuthStateChanged, User } from 'firebase/auth';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation(); // Get current route to apply conditional rendering
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Monitor auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Avoid rendering the Header and Footer on certain pages like login/signup
  const shouldRenderLayout = !['/login', '/signup'].includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Conditionally render Header */}
      {shouldRenderLayout && (
        <Header currentUser={currentUser} handleLogout={handleLogout} />
      )}

      {/* Main content */}
      <main className="flex-grow">{children}</main>

      {/* Conditionally render Footer */}
      {shouldRenderLayout && <Footer />}
    </div>
  );
};

export default Layout;
