import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { db } from '../firebase';
import { 
  Instagram, 
  Linkedin, 
  Twitter, 
  Users, 
  Calendar, 
  Clock, 
  ArrowLeft,
  MessageCircle
} from 'lucide-react';

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
  const navigate = useNavigate();
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

  const handleJoinChat = () => {
    navigate(`/clubs/${clubId}/chat`);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-xl text-red-500">
        <p>{error || 'An unexpected error occurred'}</p>
        <button
          onClick={handleGoBack}
          className="mt-4 flex items-center text-white bg-pink-500 px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
        >
          <ArrowLeft className="mr-2" size={20} />
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white">
      <div className="container mx-auto p-8">
        {/* Back Button */}
        <button
          onClick={handleGoBack}
          className="mb-6 flex items-center text-white hover:text-pink-300 transition-colors"
        >
          <ArrowLeft className="mr-2" size={20} />
          Back to Clubs
        </button>

        <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
          {/* Club Header */}
          <div className="flex flex-col md:flex-row items-center mb-8">
            <img
              src={club.imageUrl}
              alt={`${club.name} logo`}
              className="w-48 h-48 rounded-full border-4 border-white shadow-lg mb-4 md:mb-0 md:mr-8 object-cover"
            />
            <div>
              <h1 className="text-5xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-500">
                {club.name}
              </h1>
              <p className="text-xl text-pink-300 mb-4">{club.category}</p>
              <div className="flex space-x-4">
                {club.socialMediaLinks?.instagram && (
                  <a 
                    href={club.socialMediaLinks.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-white hover:text-pink-300 transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram size={24} />
                  </a>
                )}
                {club.socialMediaLinks?.linkedin && (
                  <a 
                    href={club.socialMediaLinks.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-white hover:text-blue-300 transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin size={24} />
                  </a>
                )}
                {club.socialMediaLinks?.twitter && (
                  <a 
                    href={club.socialMediaLinks.twitter} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-white hover:text-blue-400 transition-colors"
                    aria-label="Twitter"
                  >
                    <Twitter size={24} />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Club Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white bg-opacity-20 p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform">
              <h2 className="text-2xl font-bold mb-4 text-pink-300">About Us</h2>
              <p className="text-lg mb-4">{club.description}</p>
            </div>

            <div className="bg-white bg-opacity-20 p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform">
              <h2 className="text-2xl font-bold mb-4 text-pink-300">Club Details</h2>
              <div className="space-y-3">
                <p className="flex items-center">
                  <Users className="mr-2 text-pink-300" /> 
                  <strong>Lead:</strong> 
                  <span className="ml-2">{club.leadName}</span>
                </p>
                <p className="flex items-center">
                  <strong>Email:</strong> 
                  <a 
                    href={`mailto:${club.leadEmail}`} 
                    className="ml-2 hover:text-pink-300 transition-colors"
                  >
                    {club.leadEmail}
                  </a>
                </p>
                <p className="flex items-center">
                  <strong>Phone:</strong> 
                  <a 
                    href={`tel:${club.leadPhone}`} 
                    className="ml-2 hover:text-pink-300 transition-colors"
                  >
                    {club.leadPhone}
                  </a>
                </p>
                <p className="flex items-center">
                  <Clock className="mr-2 text-pink-300" /> 
                  <strong>Meeting Schedule:</strong> 
                  <span className="ml-2">{club.meetingSchedule}</span>
                </p>
                <p className="flex items-center">
                  <Users className="mr-2 text-pink-300" /> 
                  <strong>Members:</strong> 
                  <span className="ml-2">{club.memberCount}</span>
                </p>
                <p className="flex items-center">
                  <Calendar className="mr-2 text-pink-300" /> 
                  <strong>Established:</strong> 
                  <span className="ml-2">{club.establishedDate}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Requirements and Achievements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white bg-opacity-20 p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform">
              <h2 className="text-2xl font-bold mb-4 text-pink-300">Requirements</h2>
              <p className="text-lg whitespace-pre-line">{club.requirements}</p>
            </div>

            <div className="bg-white bg-opacity-20 p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform">
              <h2 className="text-2xl font-bold mb-4 text-pink-300">Achievements</h2>
              <p className="text-lg whitespace-pre-line">{club.achievements}</p>
            </div>
          </div>

          {/* Join Chat Button */}
          <div className="mt-8 text-center">
            <button 
              onClick={handleJoinChat}
              className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all flex items-center justify-center mx-auto"
            >
              <MessageCircle className="mr-2" size={20} />
              Join {club.name} Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubDetailPage;