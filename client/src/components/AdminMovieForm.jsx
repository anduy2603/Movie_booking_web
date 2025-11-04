import React, { useState, useEffect } from 'react';
import { movieService } from '../services';
import { toast } from 'react-hot-toast';

import { useNavigate, useParams } from 'react-router-dom';

const AdminMovieForm = () => {
  const [movieData, setMovieData] = useState({
    title: '',
    description: '',
    release_date: '',
    duration: '',
    poster_url: '',
    trailer_url: '',
    genre: '',
    language: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { movieId } = useParams();

  useEffect(() => {
    if (movieId) {
      setLoading(true);
      movieService.getMovieByIdRequest(movieId)
        .then(res => {
          const movie = res.data;
          // Map backend fields to frontend state
          setMovieData({
            title: movie.title || '',
            description: movie.description || '',
            release_date: movie.release_date || '',
            duration: movie.duration?.toString() || '',
            poster_url: movie.poster_url || '',
            trailer_url: movie.trailer_url || '',
            genre: movie.genre || '',
            language: movie.language || ''
          });
        })
        .catch(() => {
          toast.error('Failed to load movie');
        })
        .finally(() => setLoading(false));
    }
  }, [movieId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Format data before sending - map frontend fields to backend schema
      const durationValue = movieData.duration && movieData.duration !== '' 
        ? parseInt(movieData.duration) 
        : null;
      
      const formattedData = {
        title: movieData.title,
        description: movieData.description?.trim() || null,
        release_date: movieData.release_date || null,
        duration: durationValue && durationValue > 0 ? durationValue : null,
        poster_url: movieData.poster_url?.trim() || null,
        trailer_url: movieData.trailer_url?.trim() || null,
        genre: movieData.genre?.trim() || null,
        language: movieData.language?.trim() || null,
      };

      console.log('Submitting movie data:', formattedData);

      if (movieId) {
        const response = await movieService.updateMovieRequest(movieId, formattedData);
        console.log('Update response:', response);
        toast.success('Movie updated successfully');
      } else {
        const response = await movieService.createMovieRequest(formattedData);
        console.log('Create response:', response);
        toast.success('Movie added successfully');
        setMovieData({
          title: '',
          description: '',
          release_date: '',
          duration: '',
          poster_url: '',
          trailer_url: '',
          genre: '',
          language: ''
        });
      }
      navigate('/admin/movies');
    } catch (error) {
      console.error('Error saving movie:', error);
      const errorMsg = error.response?.data?.detail || (movieId ? 'Failed to update movie' : 'Failed to add movie');
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 space-y-4">
      <h2 className="text-2xl font-bold mb-6">{movieId ? 'Edit Movie' : 'Add New Movie'}</h2>
      {loading && <div className="text-center text-gray-400">Loading...</div>}
      
      <div className="space-y-2">
        <label className="block">Title</label>
        <input
          type="text"
          value={movieData.title}
          onChange={(e) => setMovieData({...movieData, title: e.target.value})}
          className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block">Description</label>
        <textarea
          value={movieData.description}
          onChange={(e) => setMovieData({...movieData, description: e.target.value})}
          className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700"
          rows="4"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block">Release Date</label>
          <input
            type="date"
            value={movieData.release_date}
            onChange={(e) => setMovieData({...movieData, release_date: e.target.value})}
            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block">Duration (minutes)</label>
          <input
            type="number"
            value={movieData.duration}
            onChange={(e) => setMovieData({...movieData, duration: e.target.value})}
            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700"
            min="0"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block">Poster URL</label>
        <input
          type="url"
          value={movieData.poster_url}
          onChange={(e) => setMovieData({...movieData, poster_url: e.target.value})}
          className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700"
        />
      </div>

      <div className="space-y-2">
        <label className="block">Trailer URL</label>
        <input
          type="url"
          value={movieData.trailer_url}
          onChange={(e) => setMovieData({...movieData, trailer_url: e.target.value})}
          className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700"
        />
      </div>

      <div className="space-y-2">
        <label className="block">Genre</label>
        <input
          type="text"
          value={movieData.genre}
          onChange={(e) => setMovieData({...movieData, genre: e.target.value})}
          className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700"
          placeholder="Action, Drama, Comedy"
        />
      </div>

      <div className="space-y-2">
        <label className="block">Language</label>
        <input
          type="text"
          value={movieData.language}
          onChange={(e) => setMovieData({...movieData, language: e.target.value})}
          className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700"
          placeholder="English, Vietnamese, etc."
        />
      </div>

      <button
        type="submit"
        className="w-full px-6 py-3 mt-6 rounded-lg bg-primary text-white hover:bg-primary/90"
        disabled={loading}
      >
        {loading ? 'Saving...' : (movieId ? 'Update Movie' : 'Add Movie')}
      </button>
    </form>
  );
};

export default AdminMovieForm;