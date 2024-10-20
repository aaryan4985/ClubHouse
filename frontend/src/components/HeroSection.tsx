// src/components/HeroSection.tsx
import React from 'react';
import Slider from 'react-slick'; // Importing the Slider component
import { Event } from '../types'; // Adjust the import according to your project structure

// Sample data for events (replace this with your fetched data)
const events: Event[] = [
  { id: '1', title: 'Tech Hackathon', date: 'October 25, 2024', description: 'Join us for a day of innovation!', image: 'event1.jpg' },
  { id: '2', title: 'Club Fair', date: 'November 2, 2024', description: 'Explore various clubs and activities!', image: 'event2.jpg' },
  { id: '3', title: 'Workshop on AI', date: 'November 10, 2024', description: 'Learn about AI and its applications.', image: 'event3.jpg' },
  // Add more event objects here
];

const HeroSection = () => {
  const settings = {
    dots: true, // Show dots below the slider
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true, // Enable autoplay
    autoplaySpeed: 3000, // Time between slides
  };

  return (
    <section className="relative bg-white text-center py-20 px-8 rounded-lg shadow-lg">
      {/* Heading with gradient text */}
      <h2 className="text-5xl font-extrabold mb-4 bg-clip-text text-transparent  animate-gradient bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
        One Platform, Endless Opportunities.
      </h2>
      <p className="text-lg mb-6 max-w-3xl mx-auto">
        Explore, Collaborate, and Build with the best clubs and events.
      </p>
      
      {/* Carousel for Upcoming Events */}
      <div className="mb-8">
        <Slider {...settings}>
          {events.map(event => (
            <div key={event.id} className="px-4">
              <div className="bg-white text-black rounded-lg shadow-lg p-6">
                <h3 className="text-2xl font-semibold mb-2">{event.title}</h3>
                <p className="text-sm mb-4">{event.date}</p>
                <p className="text-base">{event.description}</p>
              </div>
            </div>
          ))}
        </Slider>
      </div>

      <button className="bg-indigo-600 text-white font-semibold px-8 py-4 rounded-lg shadow-lg hover:bg-indigo-700 transition-transform transform hover:scale-105">
        Get Started
      </button>
    </section>
  );
};

export default HeroSection;
