import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MenuIcon, SearchIcon, TicketPlus, XIcon, Settings, LogOut, User } from 'lucide-react';
import { assets } from '../assets/assets';
import { useDropdown } from '../hooks/useDropdown';
import { useUser } from '../hooks/useAuth';
import { movieService } from '../services';
import Login from './Login';
import Register from './Register';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef(null);
  const { dropdownRef } = useDropdown();
  const { user, isAuthenticated, logout } = useUser();
  const navigate = useNavigate();

  const handleSwitchToRegister = () => {
    setShowLogin(false);
    setShowRegister(true);
  };

  const handleSwitchToLogin = () => {
    setShowRegister(false);
    setShowLogin(true);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      const response = await movieService.searchMoviesRequest(query, 1, 5);
      setSearchResults(response.data?.data || []);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300); // Debounce 300ms

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    };

    if (showSearch) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSearch]);

  return (
    <div className="fixed top-0 left-0 z-50 w-full flex items-center justify-between px-6 md:px-16 lg:px-36 py-5 backdrop-blur bg-black/70 text-white">
      <Link to="/" className="max-md:flex-1">
        <img src={assets.logo} alt="" className="w-36 h-auto" />
      </Link>

      {/* Mobile Menu */}
      <div className={`max-md:absolute max-md:top-0 max-md:left-0 max-md:font-medium max-md:text-lg z-50 flex flex-col md:flex-row items-center max-md:justify-center
        gap-8 md:px-8 py-3 max-md:h-screen md:rounded-full bg-black/80 md:bg-white/10 md:border border-gray-300/20 overflow-hidden 
        transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-md:w-full' : 'max-md:w-0'}`}>
        <XIcon className="md:hidden absolute top-6 right-6 w-6 h-6 cursor-pointer" onClick={() => setIsMenuOpen(!isMenuOpen)} />
        <Link onClick={() => { scrollTo(0, 0); setIsMenuOpen(false); }} to="/">Home</Link>
        <Link onClick={() => { scrollTo(0, 0); setIsMenuOpen(false); }} to="/movies">Movies</Link>
        <Link onClick={() => { scrollTo(0, 0); setIsMenuOpen(false); }} to="/">Theaters</Link>
        <Link onClick={() => { scrollTo(0, 0); setIsMenuOpen(false); }} to="/">Release</Link>
        <Link onClick={() => { scrollTo(0, 0); setIsMenuOpen(false); }} to="/favorite">Favorites</Link>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative" ref={searchRef}>
          <SearchIcon 
            className="max-md:hidden w-6 h-6 cursor-pointer hover:text-[var(--color-primary)] transition-colors" 
            onClick={() => setShowSearch(!showSearch)}
          />
          
          {showSearch && (
            <div className="absolute right-0 top-full mt-2 w-96 bg-gray-800 rounded-lg shadow-2xl border border-gray-700 z-50 max-h-[80vh] overflow-hidden">
              <div className="p-4 border-b border-gray-700">
                <input
                  type="text"
                  placeholder="Search movies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-[var(--color-primary)]"
                  autoFocus
                />
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {searchLoading ? (
                  <div className="p-8 text-center text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)] mx-auto"></div>
                    <p className="mt-2">Searching...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="p-2">
                    {searchResults.map((movie) => (
                      <Link
                        key={movie.id}
                        to={`/movies/${movie.id}`}
                        onClick={() => {
                          setShowSearch(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                      >
                        <img
                          src={movie.poster_url || movie.poster_path || 'https://via.placeholder.com/60x90?text=No+Image'}
                          alt={movie.title}
                          className="w-12 h-16 object-cover rounded"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/60x90?text=No+Image';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{movie.title}</p>
                          <p className="text-gray-400 text-sm truncate">{movie.genre || 'No genre'}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : searchQuery ? (
                  <div className="p-8 text-center text-gray-400">
                    <p>No movies found</p>
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-400">
                    <p>Start typing to search...</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

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
            
            {/* User Menu Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center"
              >
                <User className="w-6 h-6" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-700">
                    <p className="text-sm text-white font-medium">{user?.full_name}</p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                  </div>

                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    <User size={16} />
                    Profile
                  </Link>

                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      <Settings size={16} />
                      Admin Dashboard
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Auth Modals */}
      <Login 
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSwitchToRegister={handleSwitchToRegister}
      />

      <Register 
        isOpen={showRegister}
        onClose={() => setShowRegister(false)}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </div>
  );
};

export default Navbar;