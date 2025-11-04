import React, { useState, useEffect } from 'react';
import { movieService } from '../services';
import { Edit, Trash2, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AdminMovieList = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Component mounted, fetching movies...');
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await movieService.getMoviesRequest();
      console.log('Movies response:', response);
      
      if (!response || !response.data) {
        throw new Error('Invalid response format from server');
      }

      const movieData = response.data.data || response.data.items || [];
      if (!Array.isArray(movieData)) {
        throw new Error('Movies data is not in the expected format');
      }

      setMovies(movieData);
      
      if (movieData.length === 0) {
        toast.info('No movies found');
      }
    } catch (err) {
      console.error('Error fetching movies:', err);
      toast.error(err.message || 'Failed to load movies');
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (movieId) => {
    if (!movieId) {
      toast.error('Invalid movie ID');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this movie?')) {
      try {
        await movieService.deleteMovieRequest(movieId);
        toast.success('Movie deleted successfully');
        await fetchMovies(); // Refresh the list
      } catch (error) {
        console.error('Error deleting movie:', error);
        toast.error(error.response?.data?.message || 'Failed to delete movie');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Movies Management</h1>
        <button
          onClick={() => navigate('/admin/movies/add')}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Movie
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg shadow overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Movie</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Release Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Runtime</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Poster</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {Array.isArray(movies) && movies.map((movie) => (
              <tr key={movie?.id || Math.random()} className="hover:bg-gray-700/50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <img
                      className="h-12 w-20 object-cover rounded"
                      src={movie?.poster_url || movie?.poster_path || 'https://via.placeholder.com/200x300?text=No+Image'}
                      alt={movie?.title || 'Movie poster'}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/200x300?text=No+Image';
                      }}
                    />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-white">{movie?.title || 'Untitled'}</div>
                      <div className="text-sm text-gray-400">
                        {movie?.genre ? movie.genre : 'No genre'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">
                  {movie?.release_date ? new Date(movie.release_date).toLocaleDateString() : 'No date'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">
                  {movie?.duration && movie.duration > 0 
                    ? `${Math.floor(movie.duration / 60)}h ${movie.duration % 60}m` 
                    : 'N/A'}
                </td>
                <td className="px-6 py-4">
                  <img
                    className="h-16 w-12 object-cover rounded"
                    src={movie?.poster_url || movie?.poster_path || 'https://via.placeholder.com/120x180?text=No+Image'}
                    alt={movie?.title || 'Movie poster'}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/120x180?text=No+Image';
                    }}
                  />
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => navigate(`/admin/movies/edit/${movie.id}`)}
                      className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(movie.id)}
                      className="p-2 bg-red-600 text-white rounded hover:bg-red-700"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminMovieList;