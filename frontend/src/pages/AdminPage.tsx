// src/pages/AdminPage.tsx
import React, { useState, useEffect } from 'react';
import { storage, db } from '../firebase'; // Ensure correct imports
import { ref, uploadBytes, deleteObject, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';


const AdminPage: React.FC = () => {
  // State variables
  const [clubName, setClubName] = useState('');
  const [clubLogo, setClubLogo] = useState<File | null>(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventImage, setEventImage] = useState<File | null>(null);
  const [clubs, setClubs] = useState<{ id: string; name: string; logoPath: string }[]>([]);
  const [events, setEvents] = useState<{ id: string; title: string; imagePath: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [refresh, setRefresh] = useState(false); // <---- Declare the refresh state

  // State for updating
  const [editClubId, setEditClubId] = useState<string | null>(null);
  const [editEventId, setEditEventId] = useState<string | null>(null);

  

  // Fetch clubs and events when refresh state changes
  useEffect(() => {
    fetchClubs();
    fetchEvents();
  }, [refresh]);

  const fetchClubs = async () => {
    try {
      const clubsCollection = collection(db, 'clubs');
      const clubsSnapshot = await getDocs(clubsCollection);
      const clubsData = await Promise.all(
        clubsSnapshot.docs.map(async (doc) => {
          const club = doc.data();
          const logoPath = club.logoPath;

          if (!logoPath) {
            console.error('Logo path is undefined for club:', doc.id);
            return null;
          }

          const logoRef = ref(storage, `club-logos/${logoPath}`);
          try {
            const logoUrl = await getDownloadURL(logoRef);
            return { id: doc.id, name: club.name, logoPath: logoUrl };
          } catch (error) {
            console.error('Error fetching logo URL:', error);
            return null;
          }
        })
      );

      const filteredClubs = clubsData.filter((club) => club !== null);
      setClubs(filteredClubs as { id: string; name: string; logoPath: string }[]);
    } catch (error) {
      console.error('Error fetching clubs:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const eventsCollection = collection(db, 'events');
      const eventsSnapshot = await getDocs(eventsCollection);
      const eventsData = await Promise.all(
        eventsSnapshot.docs.map(async (doc) => {
          const event = doc.data();
          const imagePath = event.imagePath;

          if (!imagePath) {
            console.error('Image path is undefined for event:', doc.id);
            return null;
          }

          const imageRef = ref(storage, `event-images/${imagePath}`);
          try {
            const imageUrl = await getDownloadURL(imageRef);
            return { id: doc.id, title: event.title, imagePath: imageUrl };
          } catch (error) {
            console.error('Error fetching image URL:', error);
            return null;
          }
        })
      );

      const filteredEvents = eventsData.filter((event) => event !== null);
      setEvents(filteredEvents as { id: string; title: string; imagePath: string }[]);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleAddEvent = async () => {
    if (!eventImage || !eventTitle) {
      setFeedback('Please fill in all fields.');
      return;
    }

    const imagePath = `event-images/${eventImage.name}`;
    const imageRef = ref(storage, imagePath);

    try {
      setLoading(true);
      await uploadBytes(imageRef, eventImage);
      await addDoc(collection(db, 'events'), { title: eventTitle, imagePath });
      setFeedback('Event added successfully!');
      setRefresh(!refresh); // Toggle refresh to force re-fetch
      resetEventForm();
    } catch (error) {
      console.error('Error adding event:', error);
      setFeedback('Error adding event.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClub = async () => {
    if (!clubLogo || !clubName) {
      setFeedback('Please fill in all fields.');
      return;
    }

    const logoPath = `club-logos/${clubLogo.name}`;
    const logoRef = ref(storage, logoPath);

    try {
      setLoading(true);
      await uploadBytes(logoRef, clubLogo);
      await addDoc(collection(db, 'clubs'), { name: clubName, logoPath });
      setFeedback('Club added successfully!');
      setRefresh(!refresh); // Toggle refresh to force re-fetch
      resetClubForm();
    } catch (error) {
      console.error('Error adding club:', error);
      setFeedback('Error adding club.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClub = async () => {
    if (!editClubId || !clubName) {
      setFeedback('Please fill in all fields.');
      return;
    }

    const clubDocRef = doc(db, 'clubs', editClubId);
    try {
      setLoading(true);
      await updateDoc(clubDocRef, { name: clubName });
      setFeedback('Club updated successfully!');
      await fetchClubs(); // <-- Force re-fetch to update UI immediately
      resetClubForm();
    } catch (error) {
      console.error('Error updating club:', error);
      setFeedback('Error updating club.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClub = async (id: string, logoPath: string) => {
    const logoRef = ref(storage, logoPath);

    try {
      setLoading(true);
      await deleteObject(logoRef);
      await deleteDoc(doc(db, 'clubs', id));
      setFeedback('Club deleted successfully!');
      setRefresh(!refresh); // Trigger re-fetch
    } catch (error) {
      console.error('Error deleting club:', error);
      setFeedback('Error deleting club.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEvent = async () => {
    if (!editEventId || !eventTitle) {
      setFeedback('Please fill in all fields.');
      return;
    }

    const eventDocRef = doc(db, 'events', editEventId);
    try {
      setLoading(true);
      await updateDoc(eventDocRef, { title: eventTitle });
      setFeedback('Event updated successfully!');
      await fetchEvents(); // <-- Force re-fetch to update UI immediately
      resetEventForm();
    } catch (error) {
      console.error('Error updating event:', error);
      setFeedback('Error updating event.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (id: string, imagePath: string) => {
    const imageRef = ref(storage, imagePath);

    try {
      setLoading(true);
      await deleteObject(imageRef);
      await deleteDoc(doc(db, 'events', id));
      setFeedback('Event deleted successfully!');
      setRefresh(!refresh); // Trigger re-fetch
    } catch (error) {
      console.error('Error deleting event:', error);
      setFeedback('Error deleting event.');
    } finally {
      setLoading(false);
    }
  };

  // Reset forms
  const resetClubForm = () => {
    setClubName('');
    setClubLogo(null);
    setEditClubId(null);
  };

  // Reset event form
  const resetEventForm = () => {
    setEventTitle('');
    setEventImage(null);
    setEditEventId(null);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Panel</h1>
      {feedback && <p className="text-green-600 mb-4">{feedback}</p>} 

      {/* Club Form */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Add Club</h2>
        <input
          type="text"
          className="border p-2 rounded mb-4 w-full"
          placeholder="Club Name"
          value={clubName}
          onChange={(e) => setClubName(e.target.value)}
        />
        <input
          type="file"
          accept="image/*"
          className="border p-2 rounded mb-4 w-full"
          onChange={(e) => setClubLogo(e.target.files ? e.target.files[0] : null)}
        />
        <button
          className={`bg-blue-500 text-white p-2 rounded ${loading ? 'opacity-50' : ''}`}
          onClick={editClubId ? handleUpdateClub : handleAddClub}
          disabled={loading}
        >
          {editClubId ? 'Update Club' : 'Add Club'}
        </button>
      </div>

      {/* Event Form */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Add Event</h2>
        <input
          type="text"
          className="border p-2 rounded mb-4 w-full"
          placeholder="Event Title"
          value={eventTitle}
          onChange={(e) => setEventTitle(e.target.value)}
        />
        <input
          type="file"
          accept="image/*"
          className="border p-2 rounded mb-4 w-full"
          onChange={(e) => setEventImage(e.target.files ? e.target.files[0] : null)}
        />
        <button
          className={`bg-blue-500 text-white p-2 rounded ${loading ? 'opacity-50' : ''}`}
          onClick={editEventId ? handleUpdateEvent : handleAddEvent}
          disabled={loading}
        >
          {editEventId ? 'Update Event' : 'Add Event'}
        </button>
      </div>

      {/* Clubs List */}
      <h2 className="text-xl font-semibold mb-4">Clubs</h2>
      <ul className="list-disc mb-6">
        {clubs.map((club) => (
          <li key={club.id} className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <img src={club.logoPath} alt={club.name} className="h-10 w-10 rounded-full mr-2" />
              <span className="text-gray-700">{club.name}</span>
            </div>
            <button
              className="text-red-500"
              onClick={() => handleDeleteClub(club.id, `club-logos/${club.logoPath}`)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      {/* Events List */}
      <h2 className="text-xl font-semibold mb-4">Events</h2>
      <ul className="list-disc mb-6">
        {events.map((event) => (
          <li key={event.id} className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <img src={event.imagePath} alt={event.title} className="h-10 w-10 rounded-full mr-2" />
              <span className="text-gray-700">{event.title}</span>
            </div>
            <button
              className="text-red-500"
              onClick={() => handleDeleteEvent(event.id, `event-images/${event.imagePath}`)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPage;
