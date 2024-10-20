import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { collection, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust the import as necessary

const firestore = db;

const ClubDetailPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const [club, setClub] = useState<any>(null);

  const fetchClubDetails = async (id: string) => {
    const clubDocRef = doc(collection(firestore, 'clubs'), id);
    const clubDoc = await getDoc(clubDocRef);
    if (clubDoc.exists()) {
      const fetchedClub = { id: clubDoc.id, ...clubDoc.data() };
      console.log(fetchedClub); // Log to verify the fetched data
      setClub(fetchedClub);
    } else {
      console.error("Club not found");
    }
  };

  useEffect(() => {
    if (clubId) {
      fetchClubDetails(clubId);
    }
  }, [clubId]);

  if (!club) {
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        Loading...
      </div>
    );
  }

  const imageUrl = club.logoPath
    ? `https://firebasestorage.googleapis.com/v0/b/YOUR_PROJECT_ID.appspot.com/o/${encodeURIComponent(
        club.logoPath
      )}?alt=media`
    : ''; // Placeholder URL if logoPath is not defined

  return (
    <div className="container mx-auto p-8 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-md">
      <h1 className="text-6xl font-extrabold text-center mb-4 text-white">
        {club.name}
      </h1>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={`${club.name} logo`}
          className="w-32 h-32 mx-auto rounded-full border-4 border-white mb-4 mt-3"
        />
      ) : (
        <div className="w-32 h-32 mx-auto rounded-full border-4 border-white mb-4 mt-3 bg-gray-300 flex items-center justify-center">
          <span className="text-gray-500">No Image Available</span>
        </div>
      )}
      <div className="p-6 rounded-lg shadow-lg mb-4 bg-indigo-100">
        <p className="text-lg text-indigo-800">
          <strong>Description:</strong> {club.description}
        </p>
        <p className="text-lg text-indigo-800">
          <strong>Category:</strong> {club.category}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        <div className="bg-purple-100 p-4 rounded-lg shadow-lg">
          <p className="font-semibold text-pink-600">Lead Name:</p>
          <p className="text-indigo-600">{club.leadName}</p>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg shadow-lg">
          <p className="font-semibold text-pink-600">Lead Email:</p>
          <p className="text-indigo-600">{club.leadEmail}</p>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg shadow-lg">
          <p className="font-semibold text-pink-600">Lead Phone:</p>
          <p className="text-indigo-600">{club.leadPhone}</p>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg shadow-lg">
          <p className="font-semibold text-pink-600">Meeting Schedule:</p>
          <p className="text-indigo-600">{club.meetingSchedule}</p>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg shadow-lg">
          <p className="font-semibold text-pink-600">Requirements:</p>
          <p className="text-indigo-600">{club.requirements}</p>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg shadow-lg">
          <p className="font-semibold text-pink-600">Achievements:</p>
          <p className="text-indigo-600">{club.achievements}</p>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg shadow-lg">
          <p className="font-semibold text-pink-600">Member Count:</p>
          <p className="text-indigo-600">{club.memberCount}</p>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg shadow-lg">
          <p className="font-semibold text-pink-600">Established Date:</p>
          <p className="text-indigo-600">{club.establishedDate}</p>
        </div>
      </div>

      <h3 className="text-2xl font-semibold mb-2 text-white">
        Social Media Links:
      </h3>
      <ul className="space-y-2">
        {club.socialMediaLinks ? (
          <>
            {club.socialMediaLinks.instagram && (
              <li>
                <a
                  href={club.socialMediaLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  Instagram
                </a>
              </li>
            )}
            {club.socialMediaLinks.linkedin && (
              <li>
                <a
                  href={club.socialMediaLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  LinkedIn
                </a>
              </li>
            )}
            {club.socialMediaLinks.twitter && (
              <li>
                <a
                  href={club.socialMediaLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  Twitter
                </a>
              </li>
            )}
          </>
        ) : (
          <li className="text-gray-300">No Social Media Links Available</li>
        )}
      </ul>
    </div>
  );
};

export default ClubDetailPage;
