import React, { useState, useEffect } from 'react';
import { getAuth, updateProfile } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { languages } from '../data/languages'; // Import languages data

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
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [hackathonExperience, setHackathonExperience] = useState(''); // New field for hackathon experience
  const [favoriteTech, setFavoriteTech] = useState(''); // New field for favorite technology

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
            setSelectedLanguages(data.languages || []);
            setHackathonExperience(data.hackathonExperience || ''); // Load hackathon experience
            setFavoriteTech(data.favoriteTech || ''); // Load favorite technology
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

  const handleLanguageToggle = (language: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(language)
        ? prev.filter((lang) => lang !== language) // Remove if already selected
        : [...prev, language] // Add if not selected
    );
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
          languages: selectedLanguages,
          hackathonExperience, // Save hackathon experience
          favoriteTech, // Save favorite technology
        },
        { merge: true }
      );

      navigate('/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-300 to-pink-300 text-white p-10">
      {/* Light gradient background */}
      <h1 className="text-4xl font-extrabold mb-8 text-center text-pink-600">Update Your Profile</h1>
      <form onSubmit={handleUpdate} className="space-y-10">
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Input Fields */}
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-pink-600">Full Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="p-3 rounded-md border border-gray-300 text-purple-600"
              placeholder="Enter your full name"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-pink-600">Profile Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setProfileImage(e.target.files[0]);
                }
              }}
              className="p-3 rounded-md border border-gray-300 text-purple-600"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-pink-600">Date of Birth</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="p-3 rounded-md border border-gray-300 text-purple-600"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-pink-600">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="p-3 rounded-md border border-gray-300 text-purple-600"
              placeholder="Enter your phone number"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-pink-600">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="p-3 rounded-md border border-gray-300 text-purple-600"
              placeholder="Enter your address"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-pink-600">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="p-3 rounded-md border border-gray-300 text-purple-600"
              placeholder="Write a short bio"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-pink-600">Interests</label>
            <input
              type="text"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              className="p-3 rounded-md border border-gray-300 text-purple-600"
              placeholder="Enter your interests (comma separated)"
            />
          </div>

          <div className="flex flex-col sm:col-span-2">
            <label className="mb-2 font-semibold text-pink-600">Social Media Handle</label>
            <input
              type="text"
              value={socials}
              onChange={(e) => setSocials(e.target.value)}
              className="p-3 rounded-md border border-gray-300 text-purple-600"
              placeholder="Enter your social media handle"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-pink-600">Hackathon Experience</label>
            <textarea
              value={hackathonExperience}
              onChange={(e) => setHackathonExperience(e.target.value)}
              className="p-3 rounded-md border border-gray-300 text-purple-600"
              placeholder="Describe your hackathon experience"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-pink-600">Favorite Technology</label>
            <input
              type="text"
              value={favoriteTech}
              onChange={(e) => setFavoriteTech(e.target.value)}
              className="p-3 rounded-md border border-gray-300 text-purple-600"
              placeholder="Enter your favorite technology"
            />
          </div>

          {/* Language Selection Blocks */}
          <div className="flex flex-col sm:col-span-2">
            <label className="mb-2 font-semibold text-pink-600">Coding Languages</label>
            <div className="flex flex-wrap gap-3">
              {languages.map((lang) => (
                <div
                  key={lang.value}
                  onClick={() => handleLanguageToggle(lang.value)}
                  className={`px-4 py-2 rounded-md cursor-pointer transition ${
                    selectedLanguages.includes(lang.value)
                      ? 'bg-pink-600 text-white'
                      : 'bg-gray-200 text-purple-600'
                  }`}
                >
                  {lang.label}
                </div>
              ))}
            </div>
          </div>
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-pink-600 text-white rounded-md font-semibold transition hover:bg-pink-700"
        >
          Update Profile
        </button>
      </form>
    </div>
  );
};

export default UserInfoPage;
