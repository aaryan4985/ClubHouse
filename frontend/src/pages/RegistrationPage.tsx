import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Change useHistory to useNavigate
import { db } from '../firebase'; // Adjust the import as necessary
import { collection, addDoc } from 'firebase/firestore';

const RegistrationPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate(); // Replace useHistory with useNavigate
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const registrationData = {
        name,
        email,
        contact,
        eventId,
        timestamp: new Date(),
      };

      // Save registration data to Firestore
      await addDoc(collection(db, 'registrations'), registrationData);
      setSuccess('Registration successful! Thank you for registering.');
      setName('');
      setEmail('');
      setContact('');
    } catch (error) {
      console.error('Error registering:', error);
      setError('Registration failed. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-md">
      <h1 className="text-4xl font-extrabold text-center mb-6 text-white">
        Register for Event
      </h1>

      {error && <p className="text-red-500 text-center">{error}</p>}
      {success && <p className="text-green-500 text-center">{success}</p>}

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-lg text-white mb-1" htmlFor="name">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full p-2 rounded border border-gray-300"
          />
        </div>
        
        <div>
          <label className="block text-lg text-white mb-1" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2 rounded border border-gray-300"
          />
        </div>

        <div>
          <label className="block text-lg text-white mb-1" htmlFor="contact">
            Contact Number
          </label>
          <input
            type="text"
            id="contact"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
            className="w-full p-2 rounded border border-gray-300"
          />
        </div>

        <div className="flex justify-center mt-6">
          <button
            type="submit"
            className="px-6 py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </div>
      </form>

      <div className="flex justify-center mt-6">
        <button
          onClick={() => navigate('/')} // Update to use navigate instead of history.push
          className="px-4 py-2 bg-gray-300 text-black font-semibold rounded hover:bg-gray-400"
        >
          Back to Events
        </button>
      </div>
    </div>
  );
};

export default RegistrationPage;
