'use client';
import { useState } from 'react';
import { getDatabase, ref, push } from 'firebase/database';
import { app } from '@/firebase/firebase'; // Adjust the import to match your Firebase setup

const Resume = () => {
  const [link, setLink] = useState('');
  const db = getDatabase(app);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!link) return;
    
    try {
      await push(ref(db, 'resume'), { url: link });
      setLink('');
      alert('Resume link submitted successfully!');
    } catch (error) {
      console.error('Error submitting link:', error);
      alert('Failed to submit link.');
    }
  };

  return (
   
      <form onSubmit={handleSubmit} className=" p-6 rounded-lg shadow-lg w-96">
        <label className="block text-gray-700 text-sm font-bold mb-2">Resume Link:</label>
        <input
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter resume URL"
          required
        />
        <button
          type="submit"
          className="mt-4 w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
        >
          Submit
        </button>
      </form>
    
  );
};

export default Resume;
