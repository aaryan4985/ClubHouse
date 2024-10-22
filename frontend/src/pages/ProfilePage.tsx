import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { FaEdit } from 'react-icons/fa';

// Define proper interfaces
interface Event {
  id: string;
  name: string;
  description: string;
  venue: string;
  timing: string;
  date: string;
  imagePath?: string;
  rules: string;
}

interface UserData {
  bio?: string;
  socials?: string;
  dob?: string;
  phone?: string;
  address?: string;
  interests?: string;
  languages?: string[];
  registeredEvents?: Event[];
}

// Separate EventCard component with proper typing
interface EventCardProps {
  event: Event;
  onClick: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
  >
    <h4 className="text-lg font-semibold text-pink-600">{event.name}</h4>
    <p className="text-gray-600 text-sm mt-1">{event.description}</p>
    <div className="mt-2 text-sm">
      <p><strong>Venue:</strong> {event.venue}</p>
      <p><strong>Date:</strong> {event.date}</p>
      <p><strong>Time:</strong> {event.timing}</p>
    </div>
  </div>
);

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        
        const unsubscribeDoc = onSnapshot(
          userDocRef,
          (doc) => {
            if (doc.exists()) {
              setUserData(doc.data() as UserData);
              setError(null);
            } else {
              setError('User data not found');
            }
            setLoading(false);
          },
          (err) => {
            console.error('Error fetching user data:', err);
            setError('Error loading user data');
            setLoading(false);
          }
        );

        return () => unsubscribeDoc();
      } else {
        setLoading(false);
        navigate('/login');
      }
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-xl">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-xl text-red-600">
        {error}
      </div>
    );
  }

  if (!auth.currentUser) {
    return null;
  }

  const handleEventClick = (eventId: string) => {
    if (eventId) {
      navigate(`/events/${eventId}`);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-pink-200 p-10">
      <div className="w-full max-w-4xl animate-gradient bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg shadow-lg p-8 relative">
        {/* Profile Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center">
            <img
              src={auth.currentUser.photoURL || '/default-avatar.png'}
              alt="Profile"
              className="w-32 h-32 rounded-full border-4 border-white"
            />
            <div className="ml-6">
              <h2 className="text-3xl font-bold text-white">
                {auth.currentUser.displayName || 'User'}
              </h2>
              <p className="text-white">{auth.currentUser.email}</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/userinfo')}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            <FaEdit className="inline mr-1" />
            Edit Profile
          </button>
        </div>

        {/* Profile Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Personal Information */}
          <div className="space-y-4">
            <div className="bg-purple-100 p-4 rounded-md">
              <h3 className="text-xl font-semibold text-pink-600 mb-2">Personal Information</h3>
              <div className="space-y-2">
                <p><strong>Bio:</strong> {userData?.bio || 'No bio provided.'}</p>
                <p><strong>Date of Birth:</strong> {userData?.dob || 'Not provided.'}</p>
                <p><strong>Phone:</strong> {userData?.phone || 'Not provided.'}</p>
                <p><strong>Address:</strong> {userData?.address || 'Not provided.'}</p>
              </div>
            </div>

            <div className="bg-purple-100 p-4 rounded-md">
              <h3 className="text-xl font-semibold text-pink-600 mb-2">Interests & Skills</h3>
              <div className="space-y-2">
                <p><strong>Interests:</strong> {userData?.interests || 'No interests listed.'}</p>
                <p><strong>Languages:</strong> {userData?.languages?.join(', ') || 'No languages listed.'}</p>
                <p><strong>Social Links:</strong> {userData?.socials || 'No social links provided.'}</p>
              </div>
            </div>
          </div>

          {/* Registered Events */}
          <div className="bg-purple-100 p-4 rounded-md">
            <h3 className="text-xl font-semibold text-pink-600 mb-4">Registered Events</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {userData?.registeredEvents && userData.registeredEvents.length > 0 ? (
                userData.registeredEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onClick={() => handleEventClick(event.id)}
                  />
                ))
              ) : (
                <p className="text-center text-gray-600">No registered events yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;