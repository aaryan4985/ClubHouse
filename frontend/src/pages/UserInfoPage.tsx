// src/pages/UserInfoPage.tsx
import React, { useState, useEffect } from 'react';
import { getAuth, updateProfile } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from '../firebase';
import { useNavigate } from 'react-router-dom';

const UserInfoPage: React.FC = () => {
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  const storage = getStorage(app);
  const user = auth.currentUser;
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [socials, setSocials] = useState('');
  const [dob, setDob] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [interests, setInterests] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(firestore, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setDisplayName(data.displayName || '');
            setPhotoURL(data.photoURL || '');
            setBio(data.bio || '');
            setSocials(data.socials || '');
            setDob(data.dob || '');
            setPhone(data.phone || '');
            setAddress(data.address || '');
            setInterests(data.interests || '');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };
    fetchUserData();
  }, [user, firestore]);

  const handleImageUpload = async () => {
    if (profileImage) {
      const imageRef = ref(storage, `profiles/${user!.uid}`);
      await uploadBytes(imageRef, profileImage);
      return await getDownloadURL(imageRef);
    }
    return photoURL;
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newPhotoURL = await handleImageUpload();
      await updateProfile(user!, { displayName, photoURL: newPhotoURL });

      await setDoc(
        doc(firestore, 'users', user!.uid),
        {
          displayName,
          photoURL: newPhotoURL,
          bio,
          socials,
          dob,
          phone,
          address,
          interests,
        },
        { merge: true }
      );

      navigate('/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        className="w-full max-w-md bg-white p-8 rounded shadow-md"
        onSubmit={handleUpdate}
      >
        <h2 className="text-2xl font-semibold mb-6 text-center">Update Profile</h2>

        <input
          type="text"
          placeholder="Full Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />

        <textarea
          placeholder="Bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />

        <input
          type="text"
          placeholder="Social Media Handle"
          value={socials}
          onChange={(e) => setSocials(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />

        <input
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />

        <input
          type="text"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />

        <input
          type="text"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />

        <textarea
          placeholder="Interests"
          value={interests}
          onChange={(e) => setInterests(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
          className="w-full p-2 mb-6"
        />

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          Update
        </button>
      </form>
    </div>
  );
};

export default UserInfoPage;
