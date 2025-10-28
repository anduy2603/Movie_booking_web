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
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await movieService.getMoviesRequest();
      setMovies(response.data.items || []);
    } catch (error) {
      toast.error('Failed to load movies');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (movieId) => {
    if (window.confirm('Are you sure you want to delete this movie?')) {
      try {
        await movieService.deleteMovieRequest(movieId);
        toast.success('Movie deleted successfully');
        fetchMovies();
      } catch (error) {
        toast.error('Failed to delete movie');
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rating</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {movies.map((movie) => (
              <tr key={movie.id} className="hover:bg-gray-700/50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <img
                      className="h-12 w-20 object-cover rounded"
                      src={movie.poster_path || movie.poster_url}
                      alt={movie.title}
                    />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-white">{movie.title}</div>
                      <div className="text-sm text-gray-400">
                        {movie.genres.map(g => g.name).join(', ')}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">
                  {new Date(movie.release_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">
                  {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">
                  {movie.vote_average.toFixed(1)}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-center">
                  <button
                    onClick={() => navigate(`/admin/movies/edit/${movie.id}`)}
                    className="text-blue-400 hover:text-blue-300 mx-2"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(movie.id)}
                    className="text-red-400 hover:text-red-300 mx-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
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