// src/App.tsx
import React, { useEffect, useState, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase'; // Firebase auth import
import HomePage from './pages/HomePage';
import ClubsPage from './pages/ClubsPage';
import EventsPage from './pages/EventsPage';
import AdminPage from './pages/AdminPage';
import ClubDetailPage from './pages/ClubDetailPage';
import EventDetailPage from './pages/EventDetailPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ProfilePage from './pages/ProfilePage';
import UserInfoPage from './pages/UserInfoPage'; // New UserInfoPage
import Layout from './components/Layout';
import NotFound from './components/NotFound';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Spinner from './components/Spinner'; // Optional custom loading spinner
import './styles.css';

// PrivateRoute Component to guard protected routes
const PrivateRoute = ({ element }: { element: JSX.Element }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

  if (isAuthenticated === null) return <Spinner />; // Custom loading spinner or fallback

  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

// Main App Component
const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, () => setIsLoading(false));
    return () => unsubscribe();
  }, []);

  if (isLoading) return <Spinner />; // Use your loading spinner or animation

  return (
    <Router>
      <AuthProvider>
        <Layout>
          <ErrorBoundary>
            <Suspense fallback={<Spinner />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/clubs" element={<ClubsPage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/admin" element={<PrivateRoute element={<AdminPage />} />} />
                <Route path="/clubs/:clubId" element={<ClubDetailPage />} />
                <Route path="/events/:eventId" element={<EventDetailPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/profile" element={<PrivateRoute element={<ProfilePage />} />} />
                <Route path="/userinfo" element={<PrivateRoute element={<UserInfoPage />} />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </Layout>
      </AuthProvider>
    </Router>
  );
};

export default App;
