// src/pages/HomePage.tsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import EventCard from '../components/EventCard';
import ClubCard from '../components/ClubCard';
import Spinner from '../components/Spinner';
import { Event, Club } from '../types';
import HeroSection from '../components/HeroSection';

const HomePage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

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

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (error) return <p className="text-red-500 text-center">{error}</p>;
  if (loading) return <Spinner />;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 text-white">
      {/* Hero Section */}
      <HeroSection />

      <main className="flex-grow">
        {/* Upcoming Events Section */}
        <section className="my-16 mx-4 md:mx-16">
          <h2 className="text-5xl font-extrabold mb-10 text-center bg-clip-text text-transparent animate-gradient bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            🚀 Upcoming Events
          </h2>
          <div className="grid gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {events.length > 0 ? (
              events.map(event => (
                <EventCard
                  key={event.id}
                  id={event.id}
                  title={event.title}
                  date={event.date}
                  imagePath={event.imagePath || 'default-image.png'}
                  description={event.description}
                />
              ))
            ) : (
              <p className="col-span-full text-center text-xl text-gray-300">No events found</p>
            )}
          </div>
        </section>

        {/* Join a Club Section */}
        <section className="my-20 mx-4 md:mx-16">
          <h2 className="text-5xl font-extrabold mb-10 text-center bg-clip-text text-transparent animate-gradient bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            ✨ Clubs
          </h2>
          <div className="grid gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {clubs.length > 0 ? (
              clubs.map(club => (
                <ClubCard
                  key={club.id}
                  name={club.name}
                  description={club.description}
                  imageUrl={club.imageUrl || 'default-logo.png'}
                  clubId={club.id}
                />
              ))
            ) : (
              <p className="col-span-full text-center text-xl text-gray-300">No clubs found</p>
            )}
          </div>
        </section>
      </main>

      <footer className="py-6 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 shadow-lg shadow-purple-500/50 ">
        
      </footer>

      {/* Scroll to Top Button */}
      {showScrollButton && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-5 right-5 p-4 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 shadow-lg shadow-purple-500/50 hover:scale-110 transform transition duration-300"
          title="Scroll to Top"
        >
          ^
        </button>
      )}
    </div>
  );
};

export default HomePage;
