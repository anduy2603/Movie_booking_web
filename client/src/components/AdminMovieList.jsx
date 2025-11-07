import React, { useState, useEffect } from 'react';
import { movieService } from '../services';
import { Edit, Trash2, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AdminMovieList = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await movieService.getMoviesRequest(page, 10);
      console.log('Movies response:', response);
      if (response?.data?.data) {
        setMovies(response.data.data);
        setTotalPages(response.data.pages || Math.ceil((response.data.total || 0) / 10));
      } else if (response?.data?.items) {
        setMovies(response.data.items);
        setTotalPages(Math.ceil((response.data.total || 0) / 10));
      } else {
        setMovies([]);
        setTotalPages(1);
        console.warn('No movies data in response:', response);
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
      toast.error('Failed to load movies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Component mounted, fetching movies...');
    fetchMovies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleDelete = async (movieId) => {
    if (window.confirm('Are you sure you want to delete this movie?')) {
      try {
        await movieService.deleteMovieRequest(movieId);
        toast.success('Movie deleted successfully');
        fetchMovies();
      } catch (error) {
        console.error('Error deleting movie:', error);
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Favorites</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {Array.isArray(movies) && movies.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-400">
                  No movies found. Click "Add Movie" to create one.
                </td>
              </tr>
            ) : (
              movies.map((movie) => (
                <tr key={movie?.id || Math.random()} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img
                        className="h-12 w-20 object-cover rounded"
                        src={movie?.poster_path || movie?.poster_url || 'https://via.placeholder.com/200x300?text=No+Image'}
                        alt={movie?.title || 'Movie poster'}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/200x300?text=No+Image';
                        }}
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">{movie?.title || 'Untitled'}</div>
                        <div className="text-sm text-gray-400">
                          {movie?.genre || 'No genre'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {movie?.release_date ? new Date(movie.release_date).toLocaleDateString() : 'No date'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {movie?.duration ? `${Math.floor(movie.duration / 60)}h ${movie.duration % 60}m` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {movie?.liked_by_count || 0}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-center">
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
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-300 flex items-center">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminMovieList;