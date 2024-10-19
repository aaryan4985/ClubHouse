// src/components/TeamBuilder.tsx
import React, { useState } from 'react';

const TeamBuilder: React.FC = () => {
  const [skills, setSkills] = useState('');
  const [interests, setInterests] = useState('');
  const [matches, setMatches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [noMatches, setNoMatches] = useState(false); // State to check if no matches are found

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNoMatches(false);
    
    // Example matching logic (replace this with your actual logic)
    const potentialUsers = ['User1', 'User2', 'User3', 'Alice', 'Bob', 'Charlie']; // Replace with actual data fetching logic

    // Basic filtering logic (you may want to improve this)
    const filteredMatches = potentialUsers.filter(user => 
      user.includes(skills) || user.includes(interests)
    );

    if (filteredMatches.length === 0) {
      setNoMatches(true);
    } else {
      setMatches(filteredMatches);
    }
    
    setLoading(false);
  };

  return (
    <div className="p-4 border border-gray-300 rounded-lg">
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <div>
          <label htmlFor="skills" className="block text-sm font-medium text-gray-700">Skills</label>
          <input
            id="skills"
            type="text"
            placeholder="Enter your skills"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label htmlFor="interests" className="block text-sm font-medium text-gray-700">Interests</label>
          <input
            id="interests"
            type="text"
            placeholder="Enter your interests"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <button 
          type="submit" 
          className="bg-yellow-300 text-gray-800 font-bold py-2 rounded-md hover:bg-yellow-400 transition duration-300"
        >
          {loading ? 'Finding...' : 'Find Team'}
        </button>
      </form>

      {matches.length > 0 && (
        <ul className="mt-4 space-y-2">
          {matches.map((match, index) => (
            <li key={index} className="p-2 border border-gray-300 rounded-md">
              {match}
            </li>
          ))}
        </ul>
      )}
      
      {noMatches && <p className="mt-4 text-red-500">No matches found. Please try different skills or interests.</p>}
    </div>
  );
};

export default TeamBuilder;
