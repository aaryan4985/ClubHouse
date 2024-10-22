// LeaderboardPage.tsx
import React, { useEffect, useState } from 'react';
import { onSnapshot, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { FaCrown, FaMedal } from 'react-icons/fa';
import Header from '../components/Header'; // Import your Header component
import Footer from '../components/Footer'; // Import your Footer component

// User Data Interface
interface UserData {
  id: string;
  displayName: string;
  photoURL?: string;
  registeredEvents?: Event[];
  languages?: string[];
}

// Event Interface
interface Event {
  id: string;
  name: string;
}

// Leaderboard Card Component
interface LeaderboardCardProps {
  user: UserData;
  rank: number;
}

const LeaderboardCard: React.FC<LeaderboardCardProps> = ({ user, rank }) => {
  const rankColors = ['text-yellow-400', 'text-gray-400', 'text-amber-600'];

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 flex items-center space-x-4 mb-4 hover:shadow-2xl transition-transform transform hover:scale-105">
      {/* Rank Display */}
      <div className={`text-3xl ${rank < 3 ? rankColors[rank] : 'text-gray-600'} font-bold`}>
        {rank + 1}
      </div>

      {/* User Profile Picture */}
      <img
        src={user.photoURL || '/default-avatar.png'}
        alt={user.displayName}
        className="w-16 h-16 rounded-full border-4 border-pink-500"
      />

      <div className="flex-1">
        {/* User Name and Stats */}
        <h3 className="text-xl font-bold text-gray-800">{user.displayName}</h3>
        <p className="text-xs text-gray-500">
          <strong>Events Registered:</strong> {user.registeredEvents?.length || 0}
        </p>
        <p className="text-xs text-gray-500">
          <strong>Languages Known:</strong> {user.languages?.join(', ') || 'None'}
        </p>
      </div>

      {/* Rank Indicator */}
      <div className={`text-3xl ${rank < 3 ? rankColors[rank] : 'text-gray-600'}`}>
        {rank === 0 ? <FaCrown /> : <FaMedal />}
      </div>
    </div>
  );
};

const LeaderboardPage: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user data from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const userList: UserData[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as UserData[];

      // Sort users by their events and languages count
      const sortedUsers = userList.sort(
        (a, b) =>
          (b.registeredEvents?.length || 0) + (b.languages?.length || 0) -
          ((a.registeredEvents?.length || 0) + (a.languages?.length || 0))
      );

      setUsers(sortedUsers);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-xl">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header currentUser={null} handleLogout={() => {}} /> {/* Add Header here */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-10">
        <h1 className="text-5xl font-extrabold text-white text-center mb-10">
          Leaderboard
        </h1>

        <div className="flex flex-col space-y-4">
          {users.map((user, index) => (
            <LeaderboardCard key={user.id} user={user} rank={index} />
          ))}
        </div>
      </div>
      <Footer /> {/* Add Footer here */}
    </div>
  );
};

export default LeaderboardPage;
