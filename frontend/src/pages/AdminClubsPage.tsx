import React, { useState, useEffect } from 'react';
import Spinner from '../components/Spinner'; // Adjust the path as necessary
import { storage, db } from '../firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';

interface Club {
  id?: string;
  name: string;
  description: string;
  category: string;
  leadName: string;
  leadEmail: string;
  leadPhone: string;
  meetingSchedule: string;
  requirements: string;
  socialMedia: {
    instagram?: string;
    linkedin?: string;
    twitter?: string;
  };
  achievements: string;
  memberCount: number;
  establishedDate: string;
  logoPath: string;
  imageUrl?: string;
}

type ClubFormData = Omit<Club, 'id' | 'imageUrl'> & {
  clubLogo?: File | null;
};

const CLUB_CATEGORIES = [
  'Technical',
  'Cultural',
  'Sports',
  'Academic',
  'Social Service',
  'Professional',
  'Innovation',
  'Research',
  'Others'
];

const AdminClubsPage: React.FC = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [editingClubId, setEditingClubId] = useState<string | null>(null);
  
  // Form states
  const [clubName, setClubName] = useState('');
  const [clubDescription, setClubDescription] = useState('');
  const [clubCategory, setClubCategory] = useState('');
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [meetingSchedule, setMeetingSchedule] = useState('');
  const [requirements, setRequirements] = useState('');
  const [instagram, setInstagram] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [twitter, setTwitter] = useState('');
  const [achievements, setAchievements] = useState('');
  const [memberCount, setMemberCount] = useState('');
  const [establishedDate, setEstablishedDate] = useState('');
  const [clubLogo, setClubLogo] = useState<File | null>(null);
  
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const getFullImageUrl = async (path: string): Promise<string> => {
    if (path.startsWith('https://')) {
      return path;
    }
    try {
      const url = await getDownloadURL(ref(storage, path));
      return url;
    } catch (error) {
      console.error('Error getting download URL:', error);
      return '/placeholder-image.png';
    }
  };

  const fetchClubs = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'clubs'));
      const data = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const club = { id: doc.id, ...doc.data() } as Club;
          let imageUrl = '/placeholder-image.png';
          
          if (club.logoPath) {
            imageUrl = await getFullImageUrl(club.logoPath);
          }
          
          return {
            ...club,
            imageUrl
          };
        })
      );
      setClubs(data);
    } catch (error) {
      console.error('Error fetching clubs:', error);
      setFeedback('Error fetching clubs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) {
      setClubLogo(null);
      return;
    }

    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setClubLogo(file);
      setFeedback('');
    } else {
      setClubLogo(null);
      setFeedback('Please select a valid image file.');
    }
  };

  const resetForm = () => {
    setClubName('');
    setClubDescription('');
    setClubCategory('');
    setLeadName('');
    setLeadEmail('');
    setLeadPhone('');
    setMeetingSchedule('');
    setRequirements('');
    setInstagram('');
    setLinkedin('');
    setTwitter('');
    setAchievements('');
    setMemberCount('');
    setEstablishedDate('');
    setClubLogo(null);
    setEditingClubId(null);
    setFeedback('');
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!clubName || !clubDescription || !clubCategory || !leadName || !leadEmail) {
        setFeedback('Please fill in all required fields (Club Name, Description, Category, Lead Name, and Email).');
        return;
    }

    // Validate email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(leadEmail)) {
        setFeedback('Please enter a valid email address.');
        return;
    }

    // Validate member count
    const parsedMemberCount = parseInt(memberCount);
    if (isNaN(parsedMemberCount) || parsedMemberCount < 0) {
        setFeedback('Please enter a valid number for Member Count.');
        return;
    }

    setLoading(true);
    try {
        let logoPath = '';
        let imageUrl = '/placeholder-image.png';

        if (clubLogo) {
            // Upload the logo to Firebase Storage
            logoPath = `club-logos/${Date.now()}-${clubLogo.name}`;
            await uploadBytes(ref(storage, logoPath), clubLogo);
            imageUrl = await getFullImageUrl(logoPath);
        }

        const clubData: ClubFormData = {
            name: clubName,
            description: clubDescription,
            category: clubCategory,
            leadName,
            leadEmail,
            leadPhone,
            meetingSchedule,
            requirements,
            socialMedia: {
                instagram,
                linkedin,
                twitter,
            },
            achievements,
            memberCount: parsedMemberCount,
            establishedDate,
            logoPath,
        };

        if (editingClubId) {
            const clubRef = doc(db, 'clubs', editingClubId);
            const existingClub = await getDoc(clubRef);
            
            if (!existingClub.exists()) {
                setFeedback('Error: Club not found.');
                return;
            }

            // Only delete the old logo if a new logo is being uploaded
            if (clubLogo) {
                const oldLogoPath = existingClub.data().logoPath;
                if (oldLogoPath) {
                    try {
                        await deleteObject(ref(storage, oldLogoPath));
                    } catch (error) {
                        console.error('Error deleting old logo:', error);
                    }
                }
                await updateDoc(clubRef, { ...clubData, imageUrl });
            } else {
                // Update the club data without changing the logo path if no new logo is uploaded
                await updateDoc(clubRef, {
                    ...clubData,
                    logoPath: existingClub.data().logoPath,
                    imageUrl: existingClub.data().imageUrl,
                });
            }
            setFeedback('Club updated successfully!');
        } else {
            // Add new club
            await addDoc(collection(db, 'clubs'), { ...clubData, imageUrl });
            setFeedback('Club added successfully!');
        }

        await fetchClubs();
        resetForm();
    } catch (error) {
        console.error('Error saving club:', error);
        setFeedback(`Error saving club: ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
        setLoading(false);
    }
};

  const handleDeleteClub = async (id: string, logoPath: string) => {
    if (!id || !window.confirm('Are you sure you want to delete this club? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      if (logoPath) {
        try {
          await deleteObject(ref(storage, logoPath));
        } catch (error) {
          console.error('Error deleting logo:', error);
        }
      }
      await deleteDoc(doc(db, 'clubs', id));
      setFeedback('Club deleted successfully!');
      await fetchClubs();
    } catch (error) {
      console.error('Error deleting club:', error);
      setFeedback(`Error deleting club: ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClub = (club: Club) => {
    setEditingClubId(club.id ?? null);
    setClubName(club.name);
    setClubDescription(club.description);
    setClubCategory(club.category);
    setLeadName(club.leadName);
    setLeadEmail(club.leadEmail);
    setLeadPhone(club.leadPhone);
    setMeetingSchedule(club.meetingSchedule);
    setRequirements(club.requirements);
    setInstagram(club.socialMedia.instagram || '');
    setLinkedin(club.socialMedia.linkedin || '');
    setTwitter(club.socialMedia.twitter || '');
    setAchievements(club.achievements);
    setMemberCount(club.memberCount.toString());
    setEstablishedDate(club.establishedDate);
    setFeedback('');
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-purple-600">Manage Clubs</h1>
      {feedback && <p className="text-green-500">{feedback}</p>}
      {loading ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-2 text-pink-600">{editingClubId ? 'Edit Club' : 'Add New Club'}</h2>
            <form>
              <div className="mb-4">
                <label className="block mb-1">Club Name <span className="text-red-500">*</span></label>
                <input type="text" value={clubName} onChange={(e) => setClubName(e.target.value)} className="border rounded w-full p-2" />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Description <span className="text-red-500">*</span></label>
                <textarea value={clubDescription} onChange={(e) => setClubDescription(e.target.value)} className="border rounded w-full p-2" />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Category <span className="text-red-500">*</span></label>
                <select value={clubCategory} onChange={(e) => setClubCategory(e.target.value)} className="border rounded w-full p-2">
                  <option value="">Select a category</option>
                  {CLUB_CATEGORIES.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-1">Lead Name <span className="text-red-500">*</span></label>
                <input type="text" value={leadName} onChange={(e) => setLeadName(e.target.value)} className="border rounded w-full p-2" />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Lead Email <span className="text-red-500">*</span></label>
                <input type="email" value={leadEmail} onChange={(e) => setLeadEmail(e.target.value)} className="border rounded w-full p-2" />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Lead Phone</label>
                <input type="tel" value={leadPhone} onChange={(e) => setLeadPhone(e.target.value)} className="border rounded w-full p-2" />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Meeting Schedule</label>
                <input type="text" value={meetingSchedule} onChange={(e) => setMeetingSchedule(e.target.value)} className="border rounded w-full p-2" />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Requirements</label>
                <textarea value={requirements} onChange={(e) => setRequirements(e.target.value)} className="border rounded w-full p-2" />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Social Media Links</label>
                <input type="text" placeholder="Instagram" value={instagram} onChange={(e) => setInstagram(e.target.value)} className="border rounded w-full p-2 mb-1" />
                <input type="text" placeholder="LinkedIn" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className="border rounded w-full p-2 mb-1" />
                <input type="text" placeholder="Twitter" value={twitter} onChange={(e) => setTwitter(e.target.value)} className="border rounded w-full p-2 mb-1" />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Achievements</label>
                <textarea value={achievements} onChange={(e) => setAchievements(e.target.value)} className="border rounded w-full p-2" />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Member Count <span className="text-red-500">*</span></label>
                <input type="number" value={memberCount} onChange={(e) => setMemberCount(e.target.value)} className="border rounded w-full p-2" />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Established Date</label>
                <input type="date" value={establishedDate} onChange={(e) => setEstablishedDate(e.target.value)} className="border rounded w-full p-2" />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Club Logo</label>
                <input type="file" accept="image/*" onChange={handleFileChange} className="border rounded w-full p-2" />
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700"
              >
                {editingClubId ? 'Update Club' : 'Add Club'}
              </button>
              {editingClubId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 ml-2"
                >
                  Cancel Edit
                </button>
              )}
            </form>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-2 text-pink-600">Existing Clubs</h2>
            {clubs.map((club) => (
              <div key={club.id} className="mb-4 p-2 border rounded">
                <h3 className="font-semibold">{club.name}</h3>
                <p>{club.description}</p>
                <img src={club.imageUrl} alt={club.name} className="w-20 h-20 object-cover mt-2" />
                <div className="mt-2">
                  <button
                    onClick={() => handleEditClub(club)}
                    className="bg-blue-500 text-white px-2 py-1 rounded mr-2 hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClub(club.id!, club.logoPath)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClubsPage;