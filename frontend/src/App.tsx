// src/App.tsx
import React, { useEffect, useState, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase'; // Firebase auth import
import HomePage from './pages/HomePage';
import ClubsPage from './pages/ClubsPage';
import EventsPage from './pages/EventsPage';
import AdminPage from './pages/AdminPage'; 
import AdminClubsPage from './pages/AdminClubsPage';  // New Page for Clubs Admin
import AdminEventsPage from './pages/AdminEventsPage';  // New Page for Events Admin
import ClubDetailPage from './pages/ClubDetailPage';
import EventDetailPage from './pages/EventDetailPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import RegisterPage from './pages/RegistrationPage'; // New Register Page
import ProfilePage from './pages/ProfilePage';
import UserInfoPage from './pages/UserInfoPage'; 
import Layout from './components/Layout';
import NotFound from './components/NotFound';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Spinner from './components/Spinner';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './styles.css';

// PrivateRoute Component to guard protected routes
const PrivateRoute: React.FC<{ element: JSX.Element }> = ({ element }) => {
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
        <ErrorBoundary>
          <Suspense fallback={<Spinner />}>
            <Routes>
              <Route path="/" element={<Layout><HomePage /></Layout>} />
              <Route path="/clubs" element={<Layout><ClubsPage /></Layout>} />
              <Route path="/events" element={<Layout><EventsPage /></Layout>} />
              
              {/* Admin Pages */}
              <Route path="/admin" element={<PrivateRoute element={<Layout><AdminPage /></Layout>} />} />
              <Route path="/admin/clubs" element={<PrivateRoute element={<Layout><AdminClubsPage /></Layout>} />} />
              <Route path="/admin/events" element={<PrivateRoute element={<Layout><AdminEventsPage /></Layout>} />} />

              {/* Club and Event Detail Pages */}
              <Route path="/clubs/:clubId" element={<Layout><ClubDetailPage /></Layout>} />
              <Route path="/events/:eventId" element={<Layout><EventDetailPage /></Layout>} />

              {/* Auth Pages */}
              <Route path="/login" element={<Layout><LoginPage /></Layout>} />
              <Route path="/signup" element={<Layout><SignUpPage /></Layout>} />
              <Route path="/register/:eventId" element={<PrivateRoute element={<Layout><RegisterPage /></Layout>} />} /> {/* New Registration Route */}
              <Route path="/profile" element={<PrivateRoute element={<Layout><ProfilePage /></Layout>} />} />
              <Route path="/userinfo" element={<PrivateRoute element={<Layout><UserInfoPage /></Layout>} />} />

              {/* 404 Not Found */}
              <Route path="*" element={<Layout><NotFound /></Layout>} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </AuthProvider>
    </Router>
  );
};

export default App;
