// src/components/AddEvent.tsx
import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Adjust path if necessary

const AddEvent = () => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'events'), {
        title,
        date,
        image,
        description,
      });
      alert('Event added successfully!');
      setTitle('');
      setDate('');
      setImage('');
      setDescription('');
    } catch (error) {
      console.error('Error adding event:', error);
      alert('Failed to add event. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <h2 className="text-2xl font-bold">Add Event</h2>
      <input 
        type="text" 
        placeholder="Title" 
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 rounded mb-4 w-full"
        required
      />
      <input 
        type="date" 
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="border p-2 rounded mb-4 w-full"
        required
      />
      <input 
        type="text" 
        placeholder="Image URL" 
        value={image}
        onChange={(e) => setImage(e.target.value)}
        className="border p-2 rounded mb-4 w-full"
        required
      />
      <textarea 
        placeholder="Description" 
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border p-2 rounded mb-4 w-full"
        required
      />
      <button type="submit" className="bg-blue-500 text-white p-2 rounded">
        Add Event
      </button>
    </form>
  );
};

export default AddEvent;
