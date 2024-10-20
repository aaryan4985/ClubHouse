import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust the import as necessary

interface Event {
  id: string;
  title: string;
  description: string;
  rules: string;
  venue: string;
  timing: string;
  date: string;
  imagePath?: string;
  socialMediaLinks?: {
    instagram?: string;
    linkedin?: string;
    twitter?: string;
  };
}

const EventDetailPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  const fetchEventDetails = async (id: string) => {
    try {
      const eventDocRef = doc(db, 'events', id);
      const eventDoc = await getDoc(eventDocRef);
      if (eventDoc.exists()) {
        const fetchedEvent = { id: eventDoc.id, ...eventDoc.data() } as Event;
        setEvent(fetchedEvent);
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

  useEffect(() => {
    if (eventId) {
      fetchEventDetails(eventId);
    }
  }, [eventId]);

  useEffect(() => {
    const calculateTimeLeft = () => {
      if (event) {
        const eventDateTime = new Date(`${event.date}T${event.timing}`);
        const now = new Date();
        const difference = eventDateTime.getTime() - now.getTime();

        if (difference > 0) {
          const seconds = Math.floor((difference / 1000) % 60);
          const minutes = Math.floor((difference / 1000 / 60) % 60);
          const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
          const days = Math.floor(difference / (1000 * 60 * 60 * 24));

          setTimeLeft({ days, hours, minutes, seconds });
        } else {
          setTimeLeft(null); // Event has started or has passed
        }
      }
    };

    calculateTimeLeft(); // Initial calculation
    const timer = setInterval(calculateTimeLeft, 1000); // Update every second

    return () => clearInterval(timer); // Cleanup interval on unmount
  }, [event]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-10">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  const imageUrl = event?.imagePath
    ? `https://firebasestorage.googleapis.com/v0/b/YOUR_PROJECT_ID.appspot.com/o/${encodeURIComponent(
        event.imagePath
      )}?alt=media`
    : ''; // Placeholder URL if imagePath is not defined

  return (
    <div className="container mx-auto p-8 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-md">
      <h1 className="text-6xl font-extrabold text-center mb-4 text-white">
        {event?.title}
      </h1>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={event?.title}
          className="w-full h-64 object-cover rounded-lg mb-4"
        />
      ) : (
        <div className="w-full h-64 rounded-lg bg-gray-300 flex items-center justify-center mb-4">
          <span className="text-gray-500">No Image Available</span>
        </div>
      )}
      <div className="p-6 rounded-lg shadow-lg mb-4 bg-indigo-100">
        <p className="text-lg text-indigo-800">
          <strong>Description:</strong> {event?.description}
        </p>
        <p className="text-lg text-indigo-800">
          <strong>Rules:</strong> {event?.rules}
        </p>
        <p className="text-lg text-indigo-800">
          <strong>Venue:</strong> {event?.venue}
        </p>
        <p className="text-lg text-indigo-800">
          <strong>Timing:</strong> {event?.timing}
        </p>
        <p className="text-lg text-indigo-800">
          <strong>Date:</strong> {event ? new Date(event.date).toLocaleDateString() : ''}
        </p>

        {/* Countdown Timer */}
        <h2 className="text-2xl font-bold text-indigo-800 mt-4">Countdown to Event:</h2>
        {timeLeft ? (
          <p className="text-lg text-indigo-800">
            {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
          </p>
        ) : (
          <p className="text-lg text-red-500">Event has started!</p>
        )}
      </div>

      <h3 className="text-2xl font-semibold mb-2 text-white">
        Social Media Links:
      </h3>
      <ul className="space-y-2">
        {event?.socialMediaLinks ? (
          <>
            {event.socialMediaLinks.instagram && (
              <li>
                <a
                  href={event.socialMediaLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  Instagram
                </a>
              </li>
            )}
            {event.socialMediaLinks.linkedin && (
              <li>
                <a
                  href={event.socialMediaLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  LinkedIn
                </a>
              </li>
            )}
            {event.socialMediaLinks.twitter && (
              <li>
                <a
                  href={event.socialMediaLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  Twitter
                </a>
              </li>
            )}
          </>
        ) : (
          <li className="text-gray-300">No Social Media Links Available</li>
        )}
      </ul>
    </div>
  );
};

export default EventDetailPage;
