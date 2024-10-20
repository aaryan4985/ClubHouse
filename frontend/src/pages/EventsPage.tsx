// src/pages/EventsPage.tsx
import React, { useEffect, useState } from 'react';
import EventCard from '../components/EventCard';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Event } from '../types';
import Spinner from '../components/Spinner';

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const eventsSnapshot = await getDocs(collection(db, 'events'));
      const fetchedEvents: Event[] = eventsSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      })) as Event[];
      setEvents(fetchedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to load events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleRetry = () => {
    fetchEvents();
  };

  if (loading) return <Spinner />;

  if (error) return (
    <div className="text-center mt-10">
      <p className="text-red-500 text-lg">{error}</p>
      <button
        onClick={handleRetry}
        className="mt-4 bg-yellow-300 text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-yellow-400 transition duration-300"
      >
        Retry
      </button>
    </div>
  );

  return (
    <div className="p-8">
      <h2 className="text-4xl font-bold text-center text-gradient mb-6">Events</h2>
      {events.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {events.map(event => (
            <EventCard
              key={event.id}
              id={event.id}
              title={event.title}
              date={new Date(event.date).toLocaleDateString()}
              image={event.image || 'https://example.com/default-event-image.jpg'} // Default image URL
              description={event.description}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-4">No events found.</p>
      )}
    </div>
  );
};

export default EventsPage;
