// src/pages/ClubDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Club } from '../types'; // Ensure you have a Club type defined

const ClubDetailPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const [clubDetails, setClubDetails] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClubDetails = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const docRef = doc(db, 'clubs', id); // Get the document reference
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as Club; // Fetch club details
        setClubDetails({ ...data, id: docSnap.id }); // Set club details state
      } else {
        setError('Club not found'); // Handle non-existent club
      }
    } catch (error) {
      console.error('Error fetching club details:', error);
      setError('Failed to load club details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clubId) {
      fetchClubDetails(clubId); // Fetch club details when clubId is available
    }
  }, [clubId]);

  const handleRetry = () => {
    if (clubId) {
      fetchClubDetails(clubId); // Retry fetching club details
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg">Loading club details...</p> {/* Replace with your spinner component */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-10">
        <p className="text-red-500 text-lg">{error}</p>
        <button
          onClick={handleRetry}
          className="mt-4 bg-yellow-300 text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-yellow-400 transition duration-300"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">{clubDetails?.name}</h1>
      <p className="text-lg mb-6">{clubDetails?.description}</p>
      <div className="mt-6">
        <h2 className="text-2xl font-semibold">Members</h2>
        <ul className="list-disc ml-5">
          {clubDetails?.members?.length ? (
            clubDetails.members.map(member => (
              <li key={member.id}>{member.name}</li>
            ))
          ) : (
            <li>No members found.</li>
          )}
        </ul>
      </div>
      {/* Additional club details can be rendered here */}
    </div>
  );
};

export default ClubDetailPage;
