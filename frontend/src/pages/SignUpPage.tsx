import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';

const SignUpPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate('/'); // Redirect to home page
    } catch (err) {
      setError('Sign-up failed. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen animate-gradient bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
      <div className="w-full max-w-md bg-white p-10 rounded-lg shadow-2xl">
        <h2 className="text-3xl font-extrabold text-center mb-6 text-gray-700">Sign Up</h2>
        <form onSubmit={handleSignUp} className="space-y-6">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 text-pink-600"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 text-pink-600"
          />
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-pink-600 transition-all transform hover:scale-105 shadow-lg"
          >
            Sign Up
          </button>
          {error && <p className="text-red-500 text-center">{error}</p>}
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-600 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
