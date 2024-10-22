import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, DocumentData } from 'firebase/firestore';
import { db } from '../firebase';
import { ImageOff, Calendar, Users, ArrowRight } from 'lucide-react';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Event, Club } from '../types';

interface SlideData extends DocumentData {
  id: string;
  title?: string;
  name?: string;
  description: string;
  date?: string;
  imagePath?: string;
  imageUrl?: string;
  memberCount?: number;
  category?: string;
}

interface SliderSettings {
  dots: boolean;
  infinite: boolean;
  speed: number;
  slidesToShow: number;
  slidesToScroll: number;
  autoplay: boolean;
  autoplaySpeed: number;
  arrows: boolean;
  className: string;
  dotsClass: string;
}

const HeroSection: React.FC = () => {
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const sliderSettings: SliderSettings = {
    dots: true,
    infinite: slides.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: slides.length > 1,
    autoplaySpeed: 3000,
    arrows: true,
    className: "rounded-xl overflow-hidden",
    dotsClass: "slick-dots custom-dots",
  };

  const formatFirebaseStorageUrl = (path: string): string => {
    if (!path) return '';
    
    // Check if the path is already a complete URL
    if (path.startsWith('https://')) return path;
    
    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    
    // Construct the Firebase Storage URL
    return `https://firebasestorage.googleapis.com/v0/b/clubhouse-685bd.appspot.com/o/${encodeURIComponent(cleanPath)}?alt=media`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return date > now ? 'Tomorrow' : 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ${date > now ? 'from now' : 'ago'}`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ${date > now ? 'from now' : 'ago'}`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''} ${date > now ? 'from now' : 'ago'}`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} year${years > 1 ? 's' : ''} ${date > now ? 'from now' : 'ago'}`;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [eventsSnap, clubsSnap] = await Promise.all([
          getDocs(collection(db, 'events')),
          getDocs(collection(db, 'clubs'))
        ]);

        const eventData = eventsSnap.docs.map(doc => {
          const data = doc.data() as Event;
          return {
            ...data,
            id: doc.id,
            imageUrl: data.imagePath ? formatFirebaseStorageUrl(data.imagePath) : null,
          } as SlideData;
        });

        const clubData = clubsSnap.docs.map(doc => {
          const data = doc.data() as Club;
          return {
            ...data,
            id: doc.id,
            imageUrl: data.imageUrl ? formatFirebaseStorageUrl(data.imageUrl) : null,
          } as SlideData;
        });

        const combinedData = [...eventData, ...clubData]
          .sort(() => Math.random() - 0.5)
          .slice(0, 6);

        setSlides(combinedData);
      } catch (error) {
        console.error('Error loading data:', error);
        setSlides([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSlideClick = (slide: SlideData): void => {
    const path = slide.title ? `/events/${slide.id}` : `/clubs/${slide.id}`;
    navigate(path);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96 bg-gradient-to-r from-purple-900 to-pink-900 rounded-xl">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="flex justify-center items-center h-96 bg-gradient-to-r from-purple-900 to-pink-900 rounded-xl">
        <p className="text-white text-xl">No content available</p>
      </div>
    );
  }

  return (
    <section className="relative py-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-black mb-12 text-center bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          One Platform, Endless Opportunities
        </h2>

        <Slider {...sliderSettings}>
          {slides.map((slide) => (
            <div key={slide.id} className="px-2">
              <div 
                className="relative rounded-xl overflow-hidden cursor-pointer transform transition-transform hover:scale-[1.02]"
                onClick={() => handleSlideClick(slide)}
              >
                <div className="relative w-full h-[32rem] bg-gradient-to-r from-purple-900 to-pink-900">
                  {slide.imageUrl ? (
                    <img
                      src={slide.imageUrl}
                      alt={slide.title || slide.name || ''}
                      className="w-full h-full object-cover"
                      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                        const img = e.currentTarget;
                        img.src = '/api/placeholder/800/600';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageOff className="w-16 h-16 text-white/50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent">
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <div className="max-w-3xl">
                        <h3 className="text-4xl font-bold text-white mb-4">
                          {slide.title || slide.name}
                        </h3>
                        
                        <div className="flex flex-wrap gap-4 mb-4">
                          {slide.date && (
                            <span className="inline-flex items-center bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-white">
                              <Calendar className="w-4 h-4 mr-2" />
                              {formatDate(slide.date)}
                            </span>
                          )}
                          {slide.memberCount && (
                            <span className="inline-flex items-center bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-white">
                              <Users className="w-4 h-4 mr-2" />
                              {slide.memberCount} members
                            </span>
                          )}
                          {slide.category && (
                            <span className="inline-flex items-center bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-white">
                              {slide.category}
                            </span>
                          )}
                        </div>

                        <p className="text-lg text-white/90 mb-6 line-clamp-2">
                          {slide.description}
                        </p>

                        <button className="group inline-flex items-center bg-white text-purple-600 px-6 py-3 rounded-full font-semibold hover:bg-purple-50 transition-colors">
                          Learn More
                          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>

      <style>{`
        .custom-dots {
          bottom: -30px;
        }
        .custom-dots li button:before {
          color: white;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;