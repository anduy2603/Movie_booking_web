import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, Film, Calendar, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Outlet } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState(
    location.pathname.split('/')[2] || 'movies'
  );

  const menuItems = [
    { id: 'movies', label: 'Movies', icon: <Film />, path: '/admin/movies' },
    { id: 'theaters', label: 'Theaters', icon: <Film />, path: '/admin/theaters' },
    { id: 'rooms', label: 'Rooms', icon: <Calendar />, path: '/admin/rooms' },
    { id: 'showtimes', label: 'Showtimes', icon: <Calendar />, path: '/admin/showtimes' },
    { id: 'users', label: 'Users', icon: <Users />, path: '/admin/users' },
    { id: 'settings', label: 'Settings', icon: <Settings />, path: '/admin/settings' },
  ];

  // Update active tab when location changes
  useEffect(() => {
    const path = location.pathname.split('/')[2] || 'movies';
    setActiveTab(path);
  }, [location]);

  // Check admin access
  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Failed to logout');
    }
  };

  // Only render if user is admin
  if (!user || user.role !== 'admin') {
    return null;
  }

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