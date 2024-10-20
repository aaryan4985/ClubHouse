import React, { useState, useEffect } from 'react';
import { storage, db } from '../firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';

interface Event {
  id: string;
  title: string;
  description: string;
  rules: string;
  venue: string;
  timing: string;
  date: string;
  imagePath: string;
  imageUrl: string; // Added imageUrl property
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

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'events'));
      const data = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const event = doc.data();
          try {
            const imageUrl = event.imagePath ? 
              await getDownloadURL(ref(storage, event.imagePath)) : 
              '/placeholder-image.png';
            
            return {
              id: doc.id,
              title: event.title,
              description: event.description,
              rules: event.rules,
              venue: event.venue,
              timing: event.timing,
              date: event.date,
              imagePath: event.imagePath,
              imageUrl: imageUrl,
            };
          } catch (err) {
            console.error('Error fetching image URL:', err);
            return {
              id: doc.id,
              title: event.title || '',
              description: event.description || '',
              rules: event.rules || '',
              venue: event.venue || '',
              timing: event.timing || '',
              date: event.date || '',
              imagePath: event.imagePath || '',
              imageUrl: '/placeholder-image.png',
            };
          }
        })
      );
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      setFeedback('Error fetching events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) {
      setEventImage(null);
      return;
    }

    const file = e.target.files[0];
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
      setFeedback('Please select an image for the new event.');
      return;
    }

    setLoading(true);
    try {
      let imagePath: string | undefined;

      if (editingEventId) {
        const eventRef = doc(db, 'events', editingEventId);
        const existingEvent = await getDoc(eventRef);
        
        if (!existingEvent.exists()) {
          setFeedback('Error: Event not found.');
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
          // Delete old image if it exists
          const oldImagePath = existingEvent.data().imagePath;
          if (oldImagePath) {
            try {
              await deleteObject(ref(storage, oldImagePath));
            } catch (error) {
              console.error('Error deleting old image:', error);
            }
          }
          
          // Upload new image
          imagePath = await uploadImage(eventImage);
          updates.imagePath = imagePath;
        }

        await updateDoc(eventRef, updates);
        setFeedback('Event updated successfully!');
      } else {
        if (!eventImage) {
          setFeedback('Please select an image for the new event.');
          return;
        }
        
        imagePath = await uploadImage(eventImage);
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

      await fetchEvents();
      resetForm();
    } catch (error) {
      console.error('Error saving event:', error);
      setFeedback(`Error saving event: ${error instanceof Error ? error.message : 'Please try again.'}`);
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
    
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleEditEvent = (event: Event) => {
    setEventTitle(event.title);
    setEventDescription(event.description);
    setEventRules(event.rules);
    setEventVenue(event.venue);
    setEventTiming(event.timing);
    setEventDate(event.date);
    setEditingEventId(event.id);
    setEventImage(null); // Reset the image input
    setFeedback('');
  };

  const handleDeleteEvent = async (id: string, imagePath: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    setLoading(true);
    try {
      if (imagePath) {
        try {
          await deleteObject(ref(storage, imagePath));
        } catch (error) {
          console.error('Error deleting image:', error);
        }
      }
      await deleteDoc(doc(db, 'events', id));
      setFeedback('Event deleted successfully.');
      await fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      setFeedback('Error deleting event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Manage Events</h1>
      {feedback && (
        <div className={`p-4 mb-4 rounded ${feedback.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {feedback}
        </div>
      )}

      <div className="bg-white p-6 rounded shadow mb-4">
        <h2 className="text-xl font-semibold mb-4">{editingEventId ? 'Edit Event' : 'Add New Event'}</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Event Title"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            className="block w-full p-2 border border-gray-300 rounded"
          />
          <textarea
            placeholder="Event Description"
            value={eventDescription}
            onChange={(e) => setEventDescription(e.target.value)}
            className="block w-full p-2 border border-gray-300 rounded"
            rows={3}
          />
          <textarea
            placeholder="Event Rules"
            value={eventRules}
            onChange={(e) => setEventRules(e.target.value)}
            className="block w-full p-2 border border-gray-300 rounded"
            rows={3}
          />
          <input
            type="text"
            placeholder="Event Venue"
            value={eventVenue}
            onChange={(e) => setEventVenue(e.target.value)}
            className="block w-full p-2 border border-gray-300 rounded"
          />
          <input
            type="text"
            placeholder="Event Timing"
            value={eventTiming}
            onChange={(e) => setEventTiming(e.target.value)}
            className="block w-full p-2 border border-gray-300 rounded"
          />
          <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="block w-full p-2 border border-gray-300 rounded"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Image {!editingEventId && <span className="text-red-500">*</span>}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full"
            />
            {editingEventId && !eventImage && (
              <p className="text-sm text-gray-500 mt-1">
                Leave empty to keep the existing image
              </p>
            )}
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              {loading ? 'Saving...' : (editingEventId ? 'Update Event' : 'Add Event')}
            </button>
            {editingEventId && (
              <button
                onClick={resetForm}
                className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Events List</h2>
        {events.map((event) => (
          <div key={event.id} className="bg-white p-4 rounded shadow flex items-center justify-between">
            <div className="flex items-center flex-1">
              <img 
                src={event.imageUrl || '/placeholder-image.png'} 
                alt={event.title} 
                className="w-16 h-16 object-cover rounded mr-4"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{event.title}</h3>
                <p className="text-gray-600">{event.description}</p>
                <div className="text-sm text-gray-500">
                  <span className="mr-4">📍 {event.venue}</span>
                  <span className="mr-4">🕒 {event.timing}</span>
                  <span>📅 {event.date}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleEditEvent(event)}
                className="text-blue-500 hover:underline px-3 py-1"
              >
                Edit
              </button>
              <button 
                onClick={() => handleDeleteEvent(event.id, event.imagePath)}
                className="text-red-500 hover:underline px-3 py-1"
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