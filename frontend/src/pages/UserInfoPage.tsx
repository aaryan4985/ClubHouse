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

  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [socials, setSocials] = useState('');
  const [dob, setDob] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [interests, setInterests] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null); // For preview

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(firestore, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setDisplayName(user.displayName || '');
            setPhotoURL(user.photoURL || '');
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
      setLoading(false);
    };
    fetchUserData();
  }, [user, firestore]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setProfileImage(file);

    // Generate preview URL for the selected image
    if (file) {
      const previewURL = URL.createObjectURL(file);
      setImagePreview(previewURL);
    }
  };

  const handleImageUpload = async () => {
    if (profileImage) {
      const imageRef = ref(storage, `profiles/${user!.uid}`);
      await uploadBytes(imageRef, profileImage);
      return await getDownloadURL(imageRef);
    }
    return user?.photoURL || '';
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newPhotoURL = await handleImageUpload();

      // Update Firebase Auth profile
      await updateProfile(user!, { displayName, photoURL: newPhotoURL });

      // Save additional data in Firestore
      await setDoc(doc(firestore, 'users', user!.uid), {
        bio,
        socials,
        dob,
        phone,
        address,
        interests,
      });

      
      navigate('/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

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
          onChange={handleImageChange}
          className="w-full p-2 mb-6"
        />

        {imagePreview ? (
          <img
            src={imagePreview}
            alt="Profile preview"
            className="w-32 h-32 object-cover rounded-full mx-auto mb-4"
          />
        ) : photoURL ? (
          <img
            src={photoURL}
            alt="Profile"
            className="w-32 h-32 object-cover rounded-full mx-auto mb-4"
          />
        ) : null}

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
