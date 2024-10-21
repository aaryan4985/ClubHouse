import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { app } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { FaEdit } from 'react-icons/fa'; // Import pencil icon

interface UserData {
  bio?: string;
  socials?: string;
  dob?: string;
  phone?: string;
  address?: string;
  interests?: string;
  languages?: string[];
}

interface EventData {
  id: string;
  name: string; // Assuming each event has a name
  date: string; // Assuming each event has a date
}

const ProfilePage: React.FC = () => {
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [registeredEvents, setRegisteredEvents] = useState<EventData[]>([]); // State for registered events
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDocRef = doc(firestore, 'users', currentUser.uid);
        
        // Fetch user data
        const unsubscribeDoc = onSnapshot(userDocRef, (doc) => {
          setUserData(doc.data() as UserData);
        });
        
        // Fetch registered events
        const eventsQuery = query(collection(firestore, 'events'), where('registeredUsers', 'array-contains', currentUser.uid));
        const unsubscribeEvents = onSnapshot(eventsQuery, (querySnapshot) => {
          const events: EventData[] = [];
          querySnapshot.forEach((doc) => {
            events.push({ id: doc.id, ...doc.data() } as EventData);
          });
          setRegisteredEvents(events);
          setLoading(false); // Set loading to false after fetching data
        });

        return () => {
          unsubscribeDoc();
          unsubscribeEvents();
        };
      } else {
        setLoading(false); // Set loading to false if no user is found
      }
    });

    return () => unsubscribeAuth();
  }, [auth, firestore]);

  // Show loading state while fetching user data
  if (loading) return <div className="flex items-center justify-center min-h-screen text-xl">Loading...</div>;

  // Show profile content after loading
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-400 to-purple-600 text-white p-10">
      <div className="w-full max-w-lg animate-gradient bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg shadow-lg p-8 relative">
        <img
          src={user?.photoURL || 'https://via.placeholder.com/150'}
          alt="Profile"
          className="w-32 h-32 mx-auto rounded-full border-4 border-white mb-6"
        />
        <h2 className="text-3xl font-bold text-center mb-2 text-white">{user?.displayName || 'User'}</h2>
        <p className="text-center text-white mb-4">{user?.email}</p>

        <div className="text-left space-y-4">
          <p className="bg-purple-100 p-4 rounded-md text-pink-600">
            <strong>Bio:</strong> {userData?.bio || 'No bio provided.'}
          </p>
          <p className="bg-purple-100 p-4 rounded-md text-pink-600">
            <strong>Socials:</strong> {userData?.socials || 'No socials linked.'}
          </p>
          <p className="bg-purple-100 p-4 rounded-md text-pink-600">
            <strong>Date of Birth:</strong> {userData?.dob || 'Not provided.'}
          </p>
          <p className="bg-purple-100 p-4 rounded-md text-pink-600">
            <strong>Phone:</strong> {userData?.phone || 'Not provided.'}
          </p>
          <p className="bg-purple-100 p-4 rounded-md text-pink-600">
            <strong>Address:</strong> {userData?.address || 'Not provided.'}
          </p>
          <p className="bg-purple-100 p-4 rounded-md text-pink-600">
            <strong>Interests:</strong> {userData?.interests || 'No interests listed.'}
          </p>
          <p className="bg-purple-100 p-4 rounded-md text-pink-600">
            <strong>Languages:</strong> {userData?.languages?.join(', ') || 'No languages selected.'}
          </p>
        </div>

        {/* Registered Events Section */}
        <div className="mt-6">
          <h3 className="text-2xl font-bold text-center mb-4">Registered Events</h3>
          <ul className="space-y-2">
            {registeredEvents.length > 0 ? (
              registeredEvents.map((event) => (
                <li key={event.id} className="bg-purple-100 p-4 rounded-md text-pink-600">
                  <h4 className="font-semibold">{event.name}</h4>
                  <p>{event.date}</p>
                </li>
              ))
            ) : (
              <p className="text-center text-white">No registered events.</p>
            )}
          </ul>
        </div>

        {/* Edit Profile Button */}
        <div className="absolute top-4 right-4">
          <button
            onClick={() => navigate('/userinfo')}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          >
            <FaEdit className="inline mr-1" />
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
