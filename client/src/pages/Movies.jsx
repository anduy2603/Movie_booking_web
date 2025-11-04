import React, { useState, useEffect, useMemo } from 'react';
import { movieService } from '../services';
import MovieCard from '../components/MovieCard';
import BlurCircle from '../components/BlurCircle';
import Loading from '../components/Loading';
import { Search } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [allMovies, setAllMovies] = useState([]); // Store all movies for client-side filtering
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    genre: '',
    sortBy: 'release_date'
  });

  // Get unique genres from movies
  const availableGenres = useMemo(() => {
    const genres = new Set();
    allMovies.forEach(movie => {
      if (movie.genre) {
        genres.add(movie.genre);
      }
    });
    return Array.from(genres).sort();
  }, [allMovies]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      console.log('Fetching movies...');
      const response = searchQuery
        ? await movieService.searchMoviesRequest(searchQuery, page)
        : await movieService.getMoviesRequest(page);

      console.log('API Response:', response);

      if (!response.data) {
        throw new Error('No data received from API');
      }

      const moviesData = response.data?.data || [];
      setAllMovies(moviesData); // Store all movies for filtering
      setMovies(moviesData);
      setTotalPages(response.data?.pages || Math.ceil((response.data?.total || 0) / (response.data?.size || 10)));
      console.log('Movies loaded:', moviesData.length);
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      toast.error(error.response?.data?.detail || 'Failed to load movies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchQuery && !filters.genre) {
      fetchMovies();
    }
  }, [page, searchQuery]);

  // Client-side filtering by genre
  const filteredMovies = useMemo(() => {
    if (!filters.genre) {
      return allMovies;
    }
    
    return allMovies.filter(movie => 
      movie.genre && movie.genre.toLowerCase().includes(filters.genre.toLowerCase())
    );
  }, [allMovies, filters.genre]);

  // Apply genre filter to displayed movies
  useEffect(() => {
    if (filters.genre) {
      setMovies(filteredMovies);
      setPage(1); // Reset page when filtering
    } else if (allMovies.length > 0 && !searchQuery) {
      // Show all movies if no filter and have loaded movies
      setMovies(allMovies);
    }
  }, [filters.genre]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchMovies();
  };

  if (loading) return <Loading />;

  return (
    <div className='relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]'>
      <BlurCircle top='150px' left='0'/>
      <BlurCircle bottom='50px' right='50px'/>

      <div className='flex flex-col md:flex-row justify-between items-center mb-8 gap-4'>
        <h1 className='text-2xl font-medium'>Now Showing</h1>
        
        <form onSubmit={handleSearch} className='flex gap-2'>
          <input
            type='text'
            placeholder='Search movies...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-primary'
          />
          <button type='submit' className='p-2 rounded-lg bg-primary text-white'>
            <Search className='w-5 h-5' />
          </button>
        </form>

        <select
          value={filters.genre}
          onChange={(e) => setFilters({...filters, genre: e.target.value})}
          className='px-4 py-2 rounded-lg bg-gray-800 border border-gray-700'
        >
          <option value=''>All Genres</option>
          {availableGenres.map(genre => (
            <option key={genre} value={genre}>{genre}</option>
          ))}
        </select>
      </div>

      {movies.length > 0 ? (
        <>
          <div className='flex flex-wrap max-sm:justify-center gap-8'>
            {movies.map((movie) => (
              <MovieCard movie={movie} key={movie.id} />
            ))}
          </div>

          <div className='flex justify-center gap-2 mt-8'>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className='px-4 py-2 rounded-lg bg-gray-800 disabled:opacity-50'
            >
              Previous
            </button>
            <span className='px-4 py-2'>Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className='px-4 py-2 rounded-lg bg-gray-800 disabled:opacity-50'
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <div className='flex flex-col items-center justify-center h-[50vh]'>
          <h1 className='text-xl text-gray-400 text-center'>No movies found</h1>
        </div>
      )}
    </div>
  )
}

export default Movies