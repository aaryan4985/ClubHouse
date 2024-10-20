// src/pages/HomePage.tsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import EventCard from '../components/EventCard';
import ClubCard from '../components/ClubCard';
import Spinner from '../components/Spinner';
import { Event, Club } from '../types';
import HeroSection from '../components/HeroSection'; // Import HeroSection

const HomePage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [eventsSnapshot, clubsSnapshot] = await Promise.all([
          getDocs(collection(db, 'events')),
          getDocs(collection(db, 'clubs')),
        ]);
        setEvents(eventsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Event)));
        setClubs(clubsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Club)));
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load events and clubs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (error) return <p className="text-red-500 text-center">{error}</p>;
  if (loading) return <Spinner />;

  return (
    <>
      {/* Hero Section */}
      <HeroSection />

      {/* Upcoming Events Section */}
      <section className="my-16">
        <h2 className="text-5xl font-extrabold mb-4 bg-clip-text text-transparent animate-gradient bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-center">Upcoming Events</h2>
        <div className="grid gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {events.length > 0 ? (
            events.map(event => (
              <EventCard
                key={event.id}
                title={event.title}
                date={event.date}
                image={event.image}
                description={event.description}
              />
            ))
          ) : (
            <p className="col-span-full text-center text-xl text-gray-500">No events found</p>
          )}
        </div>
      </section>

      {/* Join a Club Section */}
      <section className="my-20">
        <h2 className="text-5xl font-extrabold mb-4 bg-clip-text text-transparent animate-gradient bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-center">Join a Club</h2>
        <div className="grid gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {clubs.length > 0 ? (
            clubs.map(club => (
              <ClubCard
                key={club.id}
                name={club.name}
                description={club.description}
                logo={club.logo || 'default-logo.png'}
              />
            ))
          ) : (
            <p className="col-span-full text-center text-xl text-gray-500">No clubs found</p>
          )}
        </div>
      </section>
    </>
  );
};

export default HomePage;
