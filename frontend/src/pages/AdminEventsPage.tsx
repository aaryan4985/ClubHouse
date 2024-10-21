// AdminEventsPage.tsx
import React, { useState, useEffect } from 'react';
import { storage, db } from '../firebase';
import { 
  collection, addDoc, getDocs, deleteDoc, doc, updateDoc, getDoc 
} from 'firebase/firestore';
import { deleteObject } from 'firebase/storage';
import { uploadBytes, ref, getDownloadURL } from 'firebase/storage';

interface Event {
  id: string;
  title: string;
  description: string;
  rules: string;
  venue: string;
  timing: string; // 'HH:mm' format
  date: string; // 'YYYY-MM-DD'
  imagePath: string;
  imageUrl: string; // For rendering images
}

const AdminEventsPage: React.FC = () => {
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventRules, setEventRules] = useState('');
  const [eventVenue, setEventVenue] = useState('');
  const [eventTiming, setEventTiming] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventImage, setEventImage] = useState<File | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  // Fetch events from Firestore
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'events'));
      const data = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const event = doc.data();
          const imageUrl = event.imagePath 
            ? await getDownloadURL(ref(storage, event.imagePath)) 
            : '/placeholder-image.png';

          return {
            id: doc.id,
            title: event.title,
            description: event.description,
            rules: event.rules,
            venue: event.venue,
            timing: event.timing,
            date: event.date,
            imagePath: event.imagePath,
            imageUrl,
          };
        })
      );
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      setFeedback('Failed to load events. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setEventImage(file);
      setFeedback('');
    } else {
      setEventImage(null);
      setFeedback('Please select a valid image file.');
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const imagePath = `event-images/${Date.now()}-${file.name}`;
    await uploadBytes(ref(storage, imagePath), file);
    return imagePath;
  };

  const handleSubmit = async () => {
    if (!eventTitle || !eventDescription || !eventVenue || !eventTiming || !eventDate) {
      setFeedback('All fields are required.');
      return;
    }

    if (!editingEventId && !eventImage) {
      setFeedback('Please select an image.');
      return;
    }

    setLoading(true);
    try {
      let imagePath: string | undefined;

      if (editingEventId) {
        const eventRef = doc(db, 'events', editingEventId);
        const existingEvent = await getDoc(eventRef);

        if (!existingEvent.exists()) {
          setFeedback('Event not found.');
          return;
        }

        const updates: Partial<Event> = {
          title: eventTitle,
          description: eventDescription,
          rules: eventRules,
          venue: eventVenue,
          timing: eventTiming,
          date: eventDate,
        };

        if (eventImage) {
          const oldImagePath = existingEvent.data()?.imagePath;
          if (oldImagePath) await deleteObject(ref(storage, oldImagePath));

          imagePath = await uploadImage(eventImage);
          updates.imagePath = imagePath;
        }

        await updateDoc(eventRef, updates);
        setFeedback('Event updated successfully!');
      } else {
        imagePath = await uploadImage(eventImage!);
        await addDoc(collection(db, 'events'), {
          title: eventTitle,
          description: eventDescription,
          rules: eventRules,
          venue: eventVenue,
          timing: eventTiming,
          date: eventDate,
          imagePath,
        });
        setFeedback('Event added successfully!');
      }

      resetForm();
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      setFeedback('Error saving event. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEventTitle('');
    setEventDescription('');
    setEventRules('');
    setEventVenue('');
    setEventTiming('');
    setEventDate('');
    setEventImage(null);
    setEditingEventId(null);
    setFeedback('');
  };

  const handleEditEvent = (event: Event) => {
    setEventTitle(event.title);
    setEventDescription(event.description);
    setEventRules(event.rules);
    setEventVenue(event.venue);
    setEventTiming(event.timing);
    setEventDate(event.date);
    setEditingEventId(event.id);
  };

  const handleDeleteEvent = async (id: string, imagePath: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    setLoading(true);
    try {
      if (imagePath) await deleteObject(ref(storage, imagePath));
      await deleteDoc(doc(db, 'events', id));
      setFeedback('Event deleted.');
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      setFeedback('Error deleting event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Manage Events</h1>
      {loading && <p>Loading...</p>}
      {feedback && <p className="text-red-500">{feedback}</p>}
      <div className="mb-4">
        <input 
          type="text" 
          placeholder="Event Title" 
          value={eventTitle} 
          onChange={(e) => setEventTitle(e.target.value)} 
          className="p-2 border rounded w-full" 
        />
        <textarea 
          placeholder="Event Description" 
          value={eventDescription} 
          onChange={(e) => setEventDescription(e.target.value)} 
          className="p-2 border rounded w-full mt-2" 
        />
        <textarea 
          placeholder="Event Rules" 
          value={eventRules} 
          onChange={(e) => setEventRules(e.target.value)} 
          className="p-2 border rounded w-full mt-2" 
        />
        <input 
          type="text" 
          placeholder="Event Venue" 
          value={eventVenue} 
          onChange={(e) => setEventVenue(e.target.value)} 
          className="p-2 border rounded w-full mt-2" 
        />
        <input 
          type="text" 
          placeholder="Event Timing (e.g., 10:00 AM)" 
          value={eventTiming} 
          onChange={(e) => setEventTiming(e.target.value)} 
          className="p-2 border rounded w-full mt-2" 
        />
        <input 
          type="date" 
          value={eventDate} 
          onChange={(e) => setEventDate(e.target.value)} 
          className="p-2 border rounded w-full mt-2" 
        />
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange} 
          className="mt-2" 
        />
        <button 
          onClick={handleSubmit} 
          className="bg-blue-500 text-white p-2 rounded mt-2"
        >
          {editingEventId ? 'Update Event' : 'Add Event'}
        </button>
      </div>
      <h2 className="text-xl font-bold mb-2">Events List</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => (
          <div key={event.id} className="border rounded-lg p-4 shadow-md">
            <img src={event.imageUrl} alt={event.title} className="w-full h-48 object-cover mb-2" />
            <h3 className="font-bold text-lg">{event.title}</h3>
            <p>{event.description}</p>
            <p><strong>Venue:</strong> {event.venue}</p>
            <p><strong>Date:</strong> {event.date} <strong>Time:</strong> {event.timing}</p>
            <div className="mt-2 flex gap-2">
              <button 
                onClick={() => handleEditEvent(event)} 
                className="bg-yellow-500 text-white px-4 py-2 rounded"
              >
                Edit
              </button>
              <button 
                onClick={() => handleDeleteEvent(event.id, event.imagePath)} 
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminEventsPage;
