import React, { useState, useEffect } from 'react';
import { storage, db } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc, 
  getDoc 
} from 'firebase/firestore';
import { deleteObject } from 'firebase/storage';
import { uploadBytes, ref, getDownloadURL } from 'firebase/storage';

interface Event {
  id: string;
  title: string;
  description: string;
  rules: string;
  venue: string;
  timing: string;
  date: string;
  imagePath: string;
  imageUrl: string;
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

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'events'));
      const data = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const event = doc.data();
          let imageUrl = '/placeholder-image.png';
          
          if (event.imagePath) {
            imageUrl = await getFullImageUrl(event.imagePath);
          }

          return {
            id: doc.id,
            title: event.title,
            description: event.description,
            rules: event.rules || '',
            venue: event.venue,
            timing: event.timing,
            date: event.date,
            imagePath: imageUrl,
            imageUrl: imageUrl,
          };
        })
      );
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      setFeedback('Failed to load events. Please try again later.');
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
    const imagePath = `event-images/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const storageRef = ref(storage, imagePath);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
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
      let imageUrl: string | undefined;

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
          if (oldImagePath && !oldImagePath.startsWith('https://')) {
            try {
              await deleteObject(ref(storage, oldImagePath));
            } catch (error) {
              console.error('Error deleting old image:', error);
            }
          }

          imageUrl = await uploadImage(eventImage);
          updates.imagePath = imageUrl;
        }

        await updateDoc(eventRef, updates);
        setFeedback('Event updated successfully!');
      } else {
        imageUrl = await uploadImage(eventImage!);
        await addDoc(collection(db, 'events'), {
          title: eventTitle,
          description: eventDescription,
          rules: eventRules,
          venue: eventVenue,
          timing: eventTiming,
          date: eventDate,
          imagePath: imageUrl,
        });
        setFeedback('Event added successfully!');
      }

      resetForm();
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      setFeedback('Error saving event. Please try again.');
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
    setFeedback('');
  };

  const handleDeleteEvent = async (id: string, imagePath: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    setLoading(true);
    try {
      if (imagePath && !imagePath.startsWith('https://')) {
        try {
          await deleteObject(ref(storage, imagePath));
        } catch (error) {
          console.error('Error deleting image:', error);
        }
      }
      await deleteDoc(doc(db, 'events', id));
      setFeedback('Event deleted successfully.');
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      setFeedback('Error deleting event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">Manage Events</h1>
          
          {loading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-4 rounded-lg">
                <p className="text-lg">Loading...</p>
              </div>
            </div>
          )}

          {feedback && (
            <div className={`p-4 rounded-lg mb-4 ${
              feedback.includes('successfully') 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {feedback}
            </div>
          )}

          <div className="space-y-4 mb-8">
            <input 
              type="text" 
              placeholder="Event Title" 
              value={eventTitle} 
              onChange={(e) => setEventTitle(e.target.value)} 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            <textarea 
              placeholder="Event Description" 
              value={eventDescription} 
              onChange={(e) => setEventDescription(e.target.value)} 
              className="w-full p-3 border border-gray-300 rounded-lg h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            <textarea 
              placeholder="Event Rules" 
              value={eventRules} 
              onChange={(e) => setEventRules(e.target.value)} 
              className="w-full p-3 border border-gray-300 rounded-lg h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            <input 
              type="text" 
              placeholder="Event Venue" 
              value={eventVenue} 
              onChange={(e) => setEventVenue(e.target.value)} 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            <input 
              type="time" 
              value={eventTiming} 
              onChange={(e) => setEventTiming(e.target.value)} 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            <input 
              type="date" 
              value={eventDate} 
              onChange={(e) => setEventDate(e.target.value)} 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            <div className="flex flex-col space-y-2">
              <label className="text-sm text-gray-600">Event Image</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-4">
              <button 
                onClick={handleSubmit} 
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                disabled={loading}
              >
                {editingEventId ? 'Update Event' : 'Add Event'}
              </button>
              
              {editingEventId && (
                <button 
                  onClick={resetForm} 
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  disabled={loading}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-4 text-gray-800">Events List</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
                <img 
                  src={event.imageUrl} 
                  alt={event.title} 
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-image.png';
                  }}
                />
                
                <div className="p-4">
                  <h3 className="font-bold text-xl mb-2 text-gray-800">{event.title}</h3>
                  <p className="text-gray-600 mb-2">{event.description}</p>
                  <p className="text-gray-800"><strong>Venue:</strong> {event.venue}</p>
                  <p className="text-gray-800">
                    <strong>Date:</strong> {event.date} <br />
                    <strong>Time:</strong> {event.timing}
                  </p>
                  
                  <div className="mt-4 flex gap-2">
                    <button 
                      onClick={() => handleEditEvent(event)} 
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex-1 transition-colors"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteEvent(event.id, event.imagePath)} 
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex-1 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEventsPage;