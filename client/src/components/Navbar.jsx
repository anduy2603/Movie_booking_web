import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MenuIcon, SearchIcon, TicketPlus, XIcon, Settings, LogOut, User } from 'lucide-react';
import { assets } from '../assets/assets';
import { useDropdown } from '../hooks/useDropdown';
import { useUser } from '../hooks/useAuth';
import Login from './Login';
import Register from './Register';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const { isMenuOpen, toggleMenu, dropdownRef } = useDropdown();
  const { user, isAuthenticated, logout } = useUser();
  const navigate = useNavigate();

  return (
    <div className="fixed top-0 left-0 z-50 w-full flex items-center justify-between px-6 md:px-16 lg:px-36 py-5 backdrop-blur bg-black/70 text-white">
      <Link to="/" className="max-md:flex-1">
        <img src={assets.logo} alt="" className="w-36 h-auto" />
      </Link>

      <div className={`max-md:absolute max-md:top-0 max-md:left-0 max-md:font-medium max-md:text-lg z-50 flex flex-col md:flex-row items-center max-md:justify-center
        gap-8 md:px-8 py-3 max-md:h-screen md:rounded-full bg-black/80 md:bg-white/10 md:border border-gray-300/20 overflow-hidden 
        transition-all duration-300 ease-in-out ${isOpen ? 'max-md:w-full' : 'max-md:w-0'}`}>
        <XIcon className="md:hidden absolute top-6 right-6 w-6 h-6 cursor-pointer" onClick={() => setIsOpen(!isOpen)} />
        <Link onClick={() => { scrollTo(0, 0); setIsOpen(false); }} to="/">Home</Link>
        <Link onClick={() => { scrollTo(0, 0); setIsOpen(false); }} to="/movies">Movies</Link>
        <Link onClick={() => { scrollTo(0, 0); setIsOpen(false); }} to="/">Theaters</Link>
        <Link onClick={() => { scrollTo(0, 0); setIsOpen(false); }} to="/">Release</Link>
        <Link onClick={() => { scrollTo(0, 0); setIsOpen(false); }} to="/favorite">Favorites</Link>
      </div>

      <div className="flex items-center gap-4 relative">
        <SearchIcon className="max-md:hidden w-6 h-6 cursor-pointer" />
        {!isAuthenticated ? (
          <button
            onClick={() => setShowLogin(true)}
            className="px-4 py-1 sm:px-7 sm:py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dull)] transition rounded-full font-medium cursor-pointer"
          >
            Login
          </button>
        ) : (
          <>
            <button
              onClick={() => navigate('/my-bookings')}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-gray-300/30 text-white text-sm font-medium transition cursor-pointer"
            >
              <TicketPlus size={16} /> My Bookings
            </button>

            <div className="relative" ref={dropdownRef}>
              <div onClick={toggleMenu} className="cursor-pointer flex items-center">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-gray-300/30 hover:scale-105 transition-all duration-200">
                  {user?.avatar_url ? (
                    <img 
                      src={user.avatar_url} 
                      alt="Avatar" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User size={20} className="text-white" />
                  )}
                </div>
              </div>
              <div className={`absolute right-0 mt-2 w-64 bg-white text-black rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden transform transition-all duration-300
                ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
                <div className="px-4 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <p className="text-sm font-semibold text-gray-900">{user?.full_name || 'User'}</p>
                  <p className="text-xs text-gray-600">{user?.email}</p>
                </div>
                <div className="py-2">
                  <button
                    onClick={() => { navigate('/my-bookings'); toggleMenu(); }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-gray-50 transition-colors duration-200"
                  >
                    <TicketPlus size={18} className="text-blue-600" /> 
                    <span className="text-gray-700">My Bookings</span>
                  </button>
                  <button
                    onClick={() => { toggleMenu(); }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-gray-50 transition-colors duration-200"
                  >
                    <Settings size={18} className="text-gray-600" /> 
                    <span className="text-gray-700">Manage Account</span>
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={() => { logout(); toggleMenu(); }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                  >
                    <LogOut size={18} /> 
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <MenuIcon className="max-md:ml-4 md:hidden w-8 h-8 cursor-pointer" onClick={() => setIsOpen(!isOpen)} />
      
      {/* Auth Modals */}
      {showLogin && (
        <Login 
          onClose={() => setShowLogin(false)} 
          onSwitchToRegister={() => {
            setShowLogin(false);
            setShowRegister(true);
          }}
        />
      )}
      
      {showRegister && (
        <Register 
          onClose={() => setShowRegister(false)} 
          onSwitchToLogin={() => {
            setShowRegister(false);
            setShowLogin(true);
          }}
        />
      )}
    </div>
  );
};

export default Navbar;
