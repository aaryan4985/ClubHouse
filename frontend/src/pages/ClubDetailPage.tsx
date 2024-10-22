import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { db } from '../firebase';
import { Instagram, Linkedin, Twitter, Users, Calendar, Clock } from 'lucide-react';

interface Club {
  id: string;
  name: string;
  description: string;
  category: string;
  leadName: string;
  leadEmail: string;
  leadPhone: string;
  meetingSchedule: string;
  requirements: string;
  achievements: string;
  memberCount: number;
  establishedDate: string;
  imageUrl: string;
  socialMediaLinks?: {
    instagram?: string;
    linkedin?: string;
    twitter?: string;
  };
}

const ClubDetailPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClubDetails = async () => {
      if (!clubId) {
        setError('Club ID is missing');
        setLoading(false);
        return;
      }

      try {
        const clubDocRef = doc(db, 'clubs', clubId);
        const clubDoc = await getDoc(clubDocRef);
        
        if (clubDoc.exists()) {
          const clubData = clubDoc.data() as Omit<Club, 'id'>;
          const storage = getStorage();
          let imageUrl = '/placeholder-image.jpg';

          if (clubData.imageUrl) {
            try {
              imageUrl = await getDownloadURL(ref(storage, clubData.imageUrl));
            } catch (imgError) {
              console.error('Error loading image:', imgError);
            }
          }

          setClub({ id: clubDoc.id, ...clubData, imageUrl });
        } else {
          setError('Club not found');
        }
      } catch (fetchError) {
        console.error('Error fetching club details:', fetchError);
        setError('Failed to load club details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchClubDetails();
  }, [clubId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="flex justify-center items-center h-screen text-xl text-red-500">
        {error || 'An unexpected error occurred'}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white">
      <div className="container mx-auto p-8">
        <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center mb-8">
            <img
              src={club.imageUrl}
              alt={`${club.name} logo`}
              className="w-48 h-48 rounded-full border-4 border-white shadow-lg mb-4 md:mb-0 md:mr-8"
            />
            <div>
              <h1 className="text-5xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-500">
                {club.name}
              </h1>
              <p className="text-xl text-pink-300 mb-4">{club.category}</p>
              <div className="flex space-x-4">
                {club.socialMediaLinks?.instagram && (
                  <a href={club.socialMediaLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-white hover:text-pink-300 transition-colors">
                    <Instagram size={24} />
                  </a>
                )}
                {club.socialMediaLinks?.linkedin && (
                  <a href={club.socialMediaLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-300 transition-colors">
                    <Linkedin size={24} />
                  </a>
                )}
                {club.socialMediaLinks?.twitter && (
                  <a href={club.socialMediaLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-400 transition-colors">
                    <Twitter size={24} />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white bg-opacity-20 p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform">
              <h2 className="text-2xl font-bold mb-4 text-pink-300">About Us</h2>
              <p className="text-lg mb-4">{club.description}</p>
            </div>

            <div className="bg-white bg-opacity-20 p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform">
              <h2 className="text-2xl font-bold mb-4 text-pink-300">Club Details</h2>
              <p className="mb-2 flex items-center"><Users className="mr-2" /> <strong>Lead:</strong> {club.leadName}</p>
              <p className="mb-2"><strong>Email:</strong> {club.leadEmail}</p>
              <p className="mb-2"><strong>Phone:</strong> {club.leadPhone}</p>
              <p className="mb-2 flex items-center"><Clock className="mr-2" /> <strong>Meeting Schedule:</strong> {club.meetingSchedule}</p>
              <p className="mb-2 flex items-center"><Users className="mr-2" /> <strong>Members:</strong> {club.memberCount}</p>
              <p className="flex items-center"><Calendar className="mr-2" /> <strong>Established:</strong> {club.establishedDate}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white bg-opacity-20 p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform">
              <h2 className="text-2xl font-bold mb-4 text-pink-300">Requirements</h2>
              <p className="text-lg">{club.requirements}</p>
            </div>

            <div className="bg-white bg-opacity-20 p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform">
              <h2 className="text-2xl font-bold mb-4 text-pink-300">Achievements</h2>
              <p className="text-lg">{club.achievements}</p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transform hover:scale-105 transition-transform">
              Join {club.name}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubDetailPage;