import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  userInfo: { name: string; age: string } | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userInfo, setUserInfo] = useState<{ name: string; age: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (!isMounted) return;

        setUser(currentUser);

        if (currentUser) {
          const userDoc = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userDoc);
          
          if (isMounted && userSnap.exists()) {
            setUserInfo(userSnap.data() as { name: string; age: string });
          }
        } else {
          if (isMounted) {
            setUserInfo(null);
          }
        }
      } catch (error) {
        console.error('Auth state change error:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoading) {
    return null; // or return a loading spinner
  }

  return (
    <AuthContext.Provider value={{ user, userInfo, logout }}>
      {children}
    </AuthContext.Provider>
  );
};