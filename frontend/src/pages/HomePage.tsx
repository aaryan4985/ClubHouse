// src/pages/HomePage.tsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import EventCard from '../components/EventCard';
import ClubCard from '../components/ClubCard';
import Layout from '../components/Layout';
import { Event, Club } from '../types';
import Spinner from '../components/Spinner';

const HomePage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // State for error handling

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Start loading
      setError(null); // Reset error state
      try {
        const [eventsSnapshot, clubsSnapshot] = await Promise.all([
          getDocs(collection(db, 'events')),
          getDocs(collection(db, 'clubs')),
        ]);

        setEvents(eventsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Event)));
        setClubs(clubsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Club)));
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load events and clubs. Please try again later.'); // Set error message
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  
  if (error) return <p className="text-red-500 text-center">{error}</p>; // Display error message
  if (loading) {
    return <Spinner />;
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-16 text-white text-center rounded-2xl shadow-2xl mb-12 animate-fadeIn">
        <h1 className="text-5xl font-extrabold tracking-wide mb-5">Welcome to Clubhouse</h1>
        <p className="text-xl font-light leading-relaxed max-w-xl mx-auto mb-8">
          Discover exciting events, connect with like-minded people, and explore the world of clubs!
        </p>
        <button className="bg-white text-purple-600 font-semibold px-8 py-3 rounded-lg shadow-md hover:scale-105 hover:shadow-lg transition-all duration-300">
          Get Started
        </button>
      </section>

      {/* Upcoming Events Section */}
      <section className="my-16">
        <h2 className="text-4xl font-bold text-gray-800 mb-10 text-center animate-fadeInUp">
          Upcoming Events
        </h2>
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

      {/* Clubs Section */}
      <section className="my-20">
        <h2 className="text-4xl font-bold text-gray-800 mb-10 text-center animate-fadeInUp">
          Join a Club
        </h2>
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

      {/* Footer Section */}
      <footer className="mt-20 bg-gray-900 text-white text-center py-8 rounded-t-xl shadow-inner">
        <p className="text-sm">&copy; 2024 Clubhouse. All rights reserved.</p>
      </footer>
    </Layout>
  );
};

export default HomePage;
