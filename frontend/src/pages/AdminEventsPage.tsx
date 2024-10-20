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
  timing: string; // Assuming this is a string that includes time info
  date: string; // Use format 'YYYY-MM-DD' for date
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
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

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

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      events.forEach(event => {
        const eventDateTime = new Date(`${event.date}T${event.timing}`);
        const timeDifference = eventDateTime.getTime() - now.getTime();

        if (timeDifference > 0) {
          setTimeLeft({
            days: Math.floor(timeDifference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((timeDifference % (1000 * 60)) / 1000),
          });
        } else {
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [events]);

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
          placeholder="Event Timing (e.g. 10:00 AM)" 
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
        {events.map(event => (
          <div key={event.id} className="border rounded-lg overflow-hidden shadow-md p-4">
            <img src={event.imageUrl} alt={event.title} className="w-full h-48 object-cover mb-2" />
            <h3 className="font-bold text-lg">{event.title}</h3>
            <p>{event.description}</p>
            <p><strong>Venue:</strong> {event.venue}</p>
            <p><strong>Rules:</strong> {event.rules}</p>
            <p><strong>Date:</strong> {event.date} <strong>Time:</strong> {event.timing}</p>
            <div className="text-sm text-gray-500">
              <p>Countdown to event:</p>
              <p>{timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s</p>
            </div>
            <div className="flex justify-between mt-4">
              <button 
                onClick={() => handleEditEvent(event)} 
                className="bg-yellow-500 text-white p-1 rounded"
              >
                Edit
              </button>
              <button 
                onClick={() => handleDeleteEvent(event.id, event.imagePath)} 
                className="bg-red-500 text-white p-1 rounded"
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
