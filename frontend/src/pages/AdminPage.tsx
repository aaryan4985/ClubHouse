// src/pages/AdminPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
      <div className="grid grid-cols-2 gap-6">
        <div
          className="p-6 bg-blue-500 text-white rounded shadow cursor-pointer hover:bg-blue-600"
          onClick={() => navigate('/admin/clubs')}
        >
          <h2 className="text-xl font-semibold">Manage Clubs</h2>
        </div>

        <div
          className="p-6 bg-green-500 text-white rounded shadow cursor-pointer hover:bg-green-600"
          onClick={() => navigate('/admin/events')}
        >
          <h2 className="text-xl font-semibold">Manage Events</h2>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
