// src/pages/ProfilePage.tsx
import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import { app } from '../firebase';
import { useNavigate } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDocRef = doc(firestore, 'users', currentUser.uid);
        const unsubscribeDoc = onSnapshot(userDocRef, (doc) => {
          setUserData(doc.data());
        });
        return unsubscribeDoc;
      }
    });

    return () => unsubscribe();
  }, [auth, firestore]);

  if (!user || !userData) return <div>Loading...</div>;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded shadow-md text-center">
        <img
          src={user.photoURL || 'https://via.placeholder.com/150'}
          alt="Profile"
          className="w-24 h-24 mx-auto rounded-full mb-4"
        />
        <h2 className="text-2xl font-semibold mb-2">{user.displayName}</h2>
        <p className="text-gray-500 mb-4">{user.email}</p>

        <div className="text-left space-y-2">
          <p><strong>Bio:</strong> {userData?.bio || 'No bio provided.'}</p>
          <p><strong>Socials:</strong> {userData?.socials || 'No socials linked.'}</p>
          <p><strong>DOB:</strong> {userData?.dob || 'Not provided.'}</p>
          <p><strong>Phone:</strong> {userData?.phone || 'Not provided.'}</p>
          <p><strong>Address:</strong> {userData?.address || 'Not provided.'}</p>
          <p><strong>Interests:</strong> {userData?.interests || 'No interests listed.'}</p>
        </div>

        <button
          onClick={() => navigate('/userinfo')}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
