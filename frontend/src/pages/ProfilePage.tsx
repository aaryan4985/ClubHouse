// src/pages/ProfilePage.tsx
import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { app } from '../firebase'; // Adjust path as needed

const ProfilePage: React.FC = () => {
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  const [user, setUser] = useState<User | null>(null);
  const [bio, setBio] = useState('');
  const [socials, setSocials] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDoc = await getDoc(doc(firestore, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setBio(data.bio || '');
          setSocials(data.socials || '');
        }
      }
    });
    return () => unsubscribe();
  }, [auth, firestore]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded shadow-md text-center">
        <div className="relative">
          <img
            src={user?.photoURL || 'https://via.placeholder.com/150'}
            alt="Profile"
            className="w-24 h-24 mx-auto rounded-full mb-4"
          />
          <button
            onClick={() => navigate('/userinfo')}
            className="absolute top-0 right-0 bg-blue-500 text-white rounded-full p-1"
          >
            ✏️
          </button>
        </div>

        <h2 className="text-2xl font-semibold mb-2">{user?.displayName || 'No Name'}</h2>
        <p className="text-gray-500 mb-4">{user?.email}</p>

        <div className="text-left space-y-2">
          <p><strong>Bio:</strong> {bio || 'No bio provided.'}</p>
          <p><strong>Socials:</strong> {socials || 'No socials linked.'}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
