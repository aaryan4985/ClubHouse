// src/pages/EventDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout'; // Ensure Layout is imported
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Import your Firestore config
import { Event } from '../types';
import Spinner from '../components/Spinner';

const EventDetailPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [eventDetails, setEventDetails] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!eventId) {
          setError('Invalid event ID.');
          setLoading(false);
          return;
        }
        const eventDoc = await getDoc(doc(db, 'events', eventId));
        if (eventDoc.exists()) {
          setEventDetails({ ...eventDoc.data(), id: eventDoc.id } as Event);
        } else {
          setError('Event not found.');
        }
      } catch (error) {
        console.error('Error fetching event details:', error);
        setError('Failed to load event details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  if (loading) return <Spinner />;
  if (error) return (
    <Layout>
      <div className="text-center mt-10">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-4xl font-bold text-gradient mb-6">Event Details</h1>
        {eventDetails ? (
          <>
            <h2 className="text-2xl font-semibold">{eventDetails.title}</h2>
            <p className="text-sm text-gray-500">{new Date(eventDetails.date).toLocaleDateString()}</p>
            <img src={eventDetails.image} alt={eventDetails.title} className="mt-4 w-full h-64 object-cover rounded-lg" />
            <p className="mt-4 text-gray-600">{eventDetails.description}</p>
          </>
        ) : (
          <p className="text-center text-gray-500 mt-4">No event details available.</p>
        )}
      </div>
    </Layout>
  );
};

export default EventDetailPage;
