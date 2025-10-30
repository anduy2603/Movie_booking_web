import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation, Outlet } from 'react-router-dom';
import { Users, Film, Calendar, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
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

  // Handle logout
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
      <aside className="w-64 bg-gray-800 p-6 flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-bold text-white">Admin Panel</h1>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors ${
                    activeTab === item.id ? 'bg-gray-700 text-white' : ''
                  }`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <span className="w-5 h-5">{item.icon}</span>
                  <span className="ml-3">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center px-4 py-3 mt-4 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          <span className="ml-3">Logout</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminDashboard;