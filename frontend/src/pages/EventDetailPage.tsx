import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Instagram, Linkedin, Twitter, Clock, MapPin, Calendar, Share2, ArrowLeft, Users } from 'lucide-react';
import { Alert, AlertDescription } from "../components/ui/alert";

interface Event {
  id: string;
  title: string;
  description: string;
  rules: string;
  venue: string;
  timing: string;
  date: string;
  imagePath?: string; // Updated from imagepath to imagePath
  registeredUsers?: string[];
  socialMediaLinks?: {
    instagram?: string;
    linkedin?: string;
    twitter?: string;
  };
}

const EventDetailPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!eventId) {
        setError('Event ID is missing');
        setLoading(false);
        return;
      }

      try {
        const eventDocRef = doc(db, 'events', eventId);
        const eventDoc = await getDoc(eventDocRef);
        
        if (eventDoc.exists()) {
          const eventData = eventDoc.data() as Event;
          const { id, ...restEventData } = eventData;
          setEvent({ id: eventDoc.id, ...restEventData });

          if (auth.currentUser && eventData.registeredUsers?.includes(auth.currentUser.uid)) {
            setIsRegistered(true);
          }
        } else {
          setError('Event not found');
        }
      } catch (fetchError) {
        console.error('Error fetching event details:', fetchError);
        setError('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  useEffect(() => {
    const calculateTimeLeft = () => {
      if (event) {
        const eventDateTime = new Date(`${event.date}T${event.timing}`);
        const now = new Date();
        const difference = eventDateTime.getTime() - now.getTime();

        if (difference > 0) {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24));
          const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((difference / 1000 / 60) % 60);
          const seconds = Math.floor((difference / 1000) % 60);

          setTimeLeft({ days, hours, minutes, seconds });
        } else {
          setTimeLeft(null);
        }
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [event]);

  const handleRegisterClick = async () => {
    if (!auth.currentUser) {
      navigate('/login', { state: { from: `/events/${eventId}` } });
      return;
    }

    try {
      if (!event) throw new Error('Event data not found');

      const userId = auth.currentUser.uid;
      const userDocRef = doc(db, 'users', userId);
      const eventDocRef = doc(db, 'events', eventId!);

      // Update user document
      await updateDoc(userDocRef, {
        registeredEvents: arrayUnion({
          id: eventId,
          title: event.title,
          date: event.date,
          timing: event.timing,
          venue: event.venue
        }),
        lookingForTeam: true, // Set this for team finding feature
        hasTeam: false // Initialize team status
      });

      // Update event document
      await updateDoc(eventDocRef, {
        registeredUsers: arrayUnion(userId)
      });

      setIsRegistered(true);
      Alert({
        title: "Registration Successful",
        children: <AlertDescription>You have successfully registered for this event!</AlertDescription>,
      });
      
      navigate('/profile');
      
    } catch (error) {
      console.error('Error registering for event:', error);
      Alert({
        title: "Registration Failed",
        children: <AlertDescription>Failed to register for the event. Please try again.</AlertDescription>,
        variant: "destructive"
      });
    }
  };

  const handleFindTeam = () => {
    navigate(`/events/${eventId}/team-finder`);
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: event?.title,
        text: event?.description,
        url: window.location.href
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 flex justify-center items-center">
        <Alert variant="destructive">
          <AlertDescription>{error || 'An unexpected error occurred'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900">
      <div className="container mx-auto px-4 py-8">
        <button 
          onClick={() => navigate(-1)}
          className="mb-8 inline-flex items-center text-white hover:text-purple-300 transition-colors"
        >
          <ArrowLeft className="mr-2" />
          Back to Events
        </button>

        <div className="bg-white/10 backdrop-filter backdrop-blur-lg rounded-3xl overflow-hidden shadow-2xl">
          {/* Hero Section */}
          <div className="relative h-96">
            <img
              src={event.imagePath || '/api/placeholder/800/400'}
              alt={event.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/api/placeholder/800/400';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent">
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {event.title}
                </h1>
                <div className="flex flex-wrap gap-4">
                  <span className="inline-flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white">
                    <Calendar className="w-5 h-5 mr-2" />
                    {new Date(event.date).toLocaleDateString()}
                  </span>
                  <span className="inline-flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white">
                    <Clock className="w-5 h-5 mr-2" />
                    {event.timing}
                  </span>
                  <span className="inline-flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white">
                    <MapPin className="w-5 h-5 mr-2" />
                    {event.venue}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8">
            {/* Countdown Timer */}
            {timeLeft && (
              <div className="bg-white/5 rounded-2xl p-6 mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">Event Starts In</h2>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-white/10 p-4 rounded-xl text-center">
                    <span className="text-3xl font-bold text-white block">{timeLeft.days}</span>
                    <span className="text-sm text-white/80">Days</span>
                  </div>
                  <div className="bg-white/10 p-4 rounded-xl text-center">
                    <span className="text-3xl font-bold text-white block">{timeLeft.hours}</span>
                    <span className="text-sm text-white/80">Hours</span>
                  </div>
                  <div className="bg-white/10 p-4 rounded-xl text-center">
                    <span className="text-3xl font-bold text-white block">{timeLeft.minutes}</span>
                    <span className="text-sm text-white/80">Minutes</span>
                  </div>
                  <div className="bg-white/10 p-4 rounded-xl text-center">
                    <span className="text-3xl font-bold text-white block">{timeLeft.seconds}</span>
                    <span className="text-sm text-white/80">Seconds</span>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">About the Event</h2>
              <p className="text-white/90 leading-relaxed">{event.description}</p>
            </div>

            {/* Rules */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Event Rules</h2>
              <div className="bg-white/5 rounded-xl p-6">
                <p className="text-white/90 whitespace-pre-line">{event.rules}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleRegisterClick}
                disabled={isRegistered}
                className={`${
                  isRegistered
                    ? 'bg-green-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                } text-white px-8 py-3 rounded-full font-semibold transition-all transform hover:scale-105 flex items-center`}
              >
                {isRegistered ? 'Already Registered' : 'Register Now'}
              </button>
              
              {/* Team Finder Button - Only show if registered */}
              {isRegistered && (
                <button
                  onClick={handleFindTeam}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 
                           text-white px-8 py-3 rounded-full font-semibold transition-all transform hover:scale-105 
                           flex items-center"
                >
                  <Users className="mr-2" />
                  Find Team
                </button>
              )}
              
              <button
                onClick={handleShare}
                className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-full font-semibold transition-all flex items-center"
              >
                <Share2 className="mr-2" />
                Share Event
              </button>
            </div>

            {/* Social Media Links */}
            {event.socialMediaLinks && (
              <div className="mt-8 pt-8 border-t border-white/10">
                <h2 className="text-xl font-bold text-white mb-4">Follow Us</h2>
                <div className="flex gap-4">
                  {event.socialMediaLinks.instagram && (
                    <a
                      href={event.socialMediaLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-pink-400 transition-colors"
                    >
                      <Instagram size={24} />
                    </a>
                  )}
                  {event.socialMediaLinks.linkedin && (
                    <a
                      href={event.socialMediaLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-blue-400 transition-colors"
                    >
                      <Linkedin size={24} />
                    </a>
                  )}
                  {event.socialMediaLinks.twitter && (
                    <a
                      href={event.socialMediaLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-sky-400 transition-colors"
                    >
                      <Twitter size={24} />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;