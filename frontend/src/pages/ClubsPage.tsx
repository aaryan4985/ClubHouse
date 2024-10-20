// src/pages/ClubsPage.tsx
import React, { useEffect, useState } from 'react';
import ClubCard from '../components/ClubCard';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; 
import { Club } from '../types'; 
import Spinner from '../components/Spinner'; 
import Chat from '../components/Chat'; 

const ClubsPage: React.FC = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch clubs from Firestore
  const fetchClubs = async () => {
    setLoading(true);
    setError(null);
    try {
      const clubsSnapshot = await getDocs(collection(db, 'clubs'));
      const fetchedClubs: Club[] = clubsSnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Club data:', data); // Log the data for debugging
        return {
          ...data,
          id: doc.id,
        } as Club;
      });
      setClubs(fetchedClubs);
    } catch (error) {
      console.error('Error fetching clubs:', error);
      setError('Failed to load clubs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  if (loading) return <Spinner />;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="p-10">
      <h2 className="text-5xl font-extrabold mb-4 bg-clip-text text-transparent animate-gradient bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-center ">Clubs</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {clubs.length > 0 ? (
          clubs.map(club => (
            <ClubCard
              key={club.id}
              clubId={club.id}
              name={club.name}
              description={club.description}
              logo={club.logo || 'https://via.placeholder.com/150?text=Logo+Not+Found'} // Fallback logo
            />
          ))
        ) : (
          <p>No clubs found.</p>
        )}
      </div>
      <Chat /> {/* Optional Chat Component */}
    </div>
  );
};

export default ClubsPage;
