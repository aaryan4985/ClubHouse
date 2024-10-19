// src/components/Sidebar.tsx
import React from 'react';
import { AiOutlineCalendar, AiOutlineTeam, AiOutlineTrophy } from 'react-icons/ai';
import { MdOutlineLocationOn, MdOutlineAccessTime } from 'react-icons/md';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="fixed top-0 left-0 transform -translate-x-full hover:translate-x-0 transition-transform duration-300 p-4 space-y-4 bg-black text-white h-full">
      <div className="flex flex-col items-start">
        <Link to="/events" className={`flex items-center space-x-2 ${location.pathname === '/events' ? 'text-yellow-300' : ''}`}>
          <AiOutlineCalendar size={24} className="cursor-pointer" />
          <span>Events</span>
        </Link>
        <Link to="/clubs" className={`flex items-center space-x-2 ${location.pathname === '/clubs' ? 'text-yellow-300' : ''}`}>
          <AiOutlineTeam size={24} className="cursor-pointer" />
          <span>Clubs</span>
        </Link>
        <Link to="/awards" className={`flex items-center space-x-2 ${location.pathname === '/awards' ? 'text-yellow-300' : ''}`}>
          <AiOutlineTrophy size={24} className="cursor-pointer" />
          <span>Awards</span>
        </Link>
        <Link to="/locations" className={`flex items-center space-x-2 ${location.pathname === '/locations' ? 'text-yellow-300' : ''}`}>
          <MdOutlineLocationOn size={24} className="cursor-pointer" />
          <span>Locations</span>
        </Link>
        <Link to="/timing" className={`flex items-center space-x-2 ${location.pathname === '/timing' ? 'text-yellow-300' : ''}`}>
          <MdOutlineAccessTime size={24} className="cursor-pointer" />
          <span>Timing</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
