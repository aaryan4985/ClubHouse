import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import { Event, Club } from '../types';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { getStorage, ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { ImageOff } from 'lucide-react';
import { updateProfile } from 'firebase/auth';
import { auth } from '../firebase'; // Make sure to import your Firebase Auth instance

// Simplified interfaces
interface SlideData {
  id: string;
  title?: string;
  name?: string;
  description: string;
  date?: string;
  image?: string;
}

const HeroSection: React.FC = () => {
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();

  const sliderSettings = {
    dots: true,
    infinite: slides.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: slides.length > 1,
    autoplaySpeed: 4000,
    arrows: false,
  };

  // Function to upload image and get its download URL
  const uploadImage = async (uri: string) => {
    const blob = await new Promise<Blob>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function () {
        reject(new TypeError('Network request failed'));
      };
      xhr.responseType = 'blob';
      xhr.open('GET', uri, true);
      xhr.send(null);
    });

    const storage = getStorage();
    if (!auth.currentUser) {
      throw new Error('No authenticated user found');
    }
    const fileRef = ref(storage, `images/${auth.currentUser.uid}/image_${Date.now()}.jpg`); // Unique file name
    
    // Create an upload task
    const uploadTask = uploadBytesResumable(fileRef, blob);

    // Wait for the upload to complete
    return new Promise<string>((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // You can monitor the progress here if needed
        },
        (error) => {
          console.error('Upload failed:', error);
          reject(error);
        },
        async () => {
          // Get the download URL after successful upload
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          if (auth.currentUser) {
            await updateProfile(auth.currentUser, { photoURL: downloadURL });
          } else {
            console.error('No authenticated user found');
          }
          resolve(downloadURL);
        }
      );
    });
  };

  // Simplified image loading
  const getImageUrl = async (imagePath: string) => {
    try {
      const storage = getStorage();
      const imageRef = ref(storage, imagePath);
      return await getDownloadURL(imageRef);
    } catch (error) {
      console.error('Error loading image:', error);
      return null;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch data from Firestore
        const [eventsSnap, clubsSnap] = await Promise.all([
          getDocs(collection(db, 'events')),
          getDocs(collection(db, 'clubs'))
        ]);

        // Process events
        const eventData = eventsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          title: doc.data().title,
          description: doc.data().description,
          date: doc.data().date,
          image: doc.data().image,
        }));

        // Process clubs
        const clubData = clubsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          name: doc.data().name,
          description: doc.data().description,
          image: doc.data().image,
        }));

        // Combine and shuffle
        const combinedData = [...eventData, ...clubData]
          .sort(() => Math.random() - 0.5)
          .slice(0, 6);

        // Load images and update state
        const dataWithImages = await Promise.all(
          combinedData.map(async (item) => {
            if (item.image) {
              const imageUrl = await getImageUrl(item.image);
              if (imageUrl) {
                return { ...item, image: imageUrl };
              }
              // If the image URL is invalid, upload the image if possible
              const uploadedImageUrl = await uploadImage(item.image);
              return { ...item, image: uploadedImageUrl || '/fallback.jpg' };
            }
            return { ...item, image: '/fallback.jpg' };
          })
        );

        setSlides(dataWithImages);
      } catch (error) {
        console.error('Error loading data:', error);
        setSlides([]); // Set empty state on error
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleLearnMore = (slide: SlideData) => {
    const path = slide.title ? `/events/${slide.id}` : `/clubs/${slide.id}`;
    navigate(path);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-100 rounded-lg">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-100 rounded-lg">
        <p className="text-gray-600">No content available</p>
      </div>
    );
  }

  return (
    <section className="relative bg-gradient-to-r from-blue-900 via-purple-800 to-indigo-900 py-16 px-8 rounded-lg shadow-lg">
      <h2 className="text-4xl font-bold mb-8 text-center text-white">
        One Platform, Endless Opportunities
      </h2>

      <div className="max-w-4xl mx-auto">
        <Slider {...sliderSettings}>
          {slides.map((slide) => (
            <div key={slide.id} className="px-4">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="relative w-full h-56 mb-4 bg-gray-100 rounded-md overflow-hidden">
                  {slide.image ? (
                    <img
                      src={slide.image}
                      alt={slide.title || slide.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.src = '/fallback.jpg';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageOff className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <h3 className="text-xl font-semibold mb-2">
                  {slide.title || slide.name}
                </h3>
                {slide.date && (
                  <p className="text-sm text-gray-500 mb-2">{slide.date}</p>
                )}
                <p className="text-gray-600 mb-4">{slide.description}</p>
                
                <button
                  onClick={() => handleLearnMore(slide)}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Learn More
                </button>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default HeroSection;
