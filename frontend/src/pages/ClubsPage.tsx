// src/pages/ClubsPage.tsx
import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout'; 
import ClubCard from '../components/ClubCard';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig'; 
import { Club } from '../types'; 
import Chat from '../components/Chat'; // Import Chat component
import Spinner from '../components/Spinner';

const ClubsPage: React.FC = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Error state

  // Fetch clubs from Firestore
  const fetchClubs = async () => {
    try {
      const clubsSnapshot = await getDocs(collection(db, 'clubs'));
      const fetchedClubs: Club[] = clubsSnapshot.docs.map(doc => {
        const data = doc.data() as Club;
        return { ...data, id: doc.id };
      });

      setClubs(fetchedClubs);
    } catch (error) {
      console.error('Error fetching clubs:', error);
      setError('Failed to load clubs. Please try again later.'); // Set error message
    } finally {
      setLoading(false);
    }
  };

  // useEffect to fetch clubs on component mount
  useEffect(() => {
    fetchClubs();
  }, []);

  // Retry fetching clubs
  const handleRetry = () => {
    setLoading(true);
    setError(null);
    fetchClubs();
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loader"></div> {/* Include your CSS loader here */}
        <p className="text-center text-lg font-semibold text-gray-600 mt-4">
          Loading clubs...
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center mt-10">
        <p className="text-red-500 text-xl">{error}</p>
        <button 
          onClick={handleRetry} 
          className="mt-4 bg-yellow-300 text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-yellow-400 transition duration-300"
        >
          Retry
        </button>
      </div>
    );
  }

  if (loading) {
    return <Spinner />;
  }

  return (
    <Layout>
      <div className="p-10">
        <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-10 animate-fadeIn">
          Join a Club
        </h2>

        {clubs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {clubs.map(club => (
              <ClubCard 
                key={club.id}
                name={club.name}
                description={club.description}
                logo={club.logo || 'default-logo-url'} // Provide a default logo URL
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-xl text-gray-500 mt-20">
            <p>No clubs found.</p>
            <button 
              className="mt-4 bg-yellow-300 text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-yellow-400 transition duration-300"
              onClick={() => {/* Redirect or show a modal to create a club */}}
            >
              Create a Club
            </button>
          </div>
        )}

        {/* Chat component for real-time communication */}
        <div className="mt-12">
          <h3 className="text-3xl font-bold text-center text-gray-700 mb-4">
            Join the Conversation
          </h3>
          <Chat />
        </div>
      </div>
    </Layout>
  );
};

export default ClubsPage;
