import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Film, Calendar, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Outlet } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('movies');

  const menuItems = [
    { id: 'movies', label: 'Movies', icon: <Film />, path: '/admin/movies' },
    { id: 'theaters', label: 'Theaters', icon: <Film />, path: '/admin/theaters' },
    { id: 'rooms', label: 'Rooms', icon: <Calendar />, path: '/admin/rooms' },
    { id: 'showtimes', label: 'Showtimes', icon: <Calendar />, path: '/admin/showtimes' },
    { id: 'users', label: 'Users', icon: <Users />, path: '/admin/users' },
    { id: 'settings', label: 'Settings', icon: <Settings />, path: '/admin/settings' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 p-6">
        <div className="flex items-center mb-8">
          <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                navigate(item.path);
              }}
              className={`flex items-center space-x-2 w-full px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id
                  ? 'bg-primary text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
          
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 w-full px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-lg mt-8"
          >
            <LogOut />
            <span>Logout</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Content will be rendered by nested routes */}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;