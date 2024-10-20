import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import { app } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { FaEdit } from 'react-icons/fa'; // Import pencil icon

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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-400 to-purple-600 text-white p-10">
      <div className="w-full max-w-lg animate-gradient bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg shadow-lg p-8 relative">
        <img
          src={user.photoURL || 'https://via.placeholder.com/150'}
          alt="Profile"
          className="w-32 h-32 mx-auto rounded-full border-4 border-white mb-6"
        />
        <h2 className="text-3xl font-bold text-center mb-2 text-white">{user.displayName}</h2>
        <p className="text-center text-white mb-4">{user.email}</p>

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

        {/* Pencil icon for editing profile */}
        <div
          onClick={() => navigate('/userinfo')}
          className="absolute top-4 right-4 cursor-pointer text-white hover:text-gray-300"
          title="Edit Profile"
        >
          <FaEdit size={24} />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
