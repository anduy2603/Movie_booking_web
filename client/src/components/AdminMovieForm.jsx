import React, { useState } from 'react';
import { movieService } from '../services';
import { toast } from 'react-hot-toast';

const AdminMovieForm = () => {
  const [movieData, setMovieData] = useState({
    title: '',
    overview: '',
    release_date: '',
    runtime: 0,
    poster_path: '',
    backdrop_path: '',
    genres: [],
    vote_average: 0
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await movieService.createMovieRequest(movieData);
      toast.success('Movie added successfully');
      // Reset form
      setMovieData({
        title: '',
        overview: '',
        release_date: '',
        runtime: 0,
        poster_path: '',
        backdrop_path: '',
        genres: [],
        vote_average: 0
      });
    } catch (error) {
      toast.error('Failed to add movie');
      console.error('Error adding movie:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 space-y-4">
      <h2 className="text-2xl font-bold mb-6">Add New Movie</h2>
      
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
        <label className="block">Overview</label>
        <textarea
          value={movieData.overview}
          onChange={(e) => setMovieData({...movieData, overview: e.target.value})}
          className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700"
          rows="4"
          required
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
          <label className="block">Runtime (minutes)</label>
          <input
            type="number"
            value={movieData.runtime}
            onChange={(e) => setMovieData({...movieData, runtime: parseInt(e.target.value)})}
            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block">Poster URL</label>
        <input
          type="url"
          value={movieData.poster_path}
          onChange={(e) => setMovieData({...movieData, poster_path: e.target.value})}
          className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block">Backdrop URL</label>
        <input
          type="url"
          value={movieData.backdrop_path}
          onChange={(e) => setMovieData({...movieData, backdrop_path: e.target.value})}
          className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block">Genres (comma separated)</label>
        <input
          type="text"
          value={movieData.genres.map(g => g.name).join(',')}
          onChange={(e) => setMovieData({
            ...movieData, 
            genres: e.target.value.split(',').map(name => ({ name: name.trim() })).filter(g => g.name)
          })}
          className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700"
          placeholder="Action, Drama, Comedy"
        />
      </div>

      <div className="space-y-2">
        <label className="block">Rating (0-10)</label>
        <input
          type="number"
          min="0"
          max="10"
          step="0.1"
          value={movieData.vote_average}
          onChange={(e) => setMovieData({...movieData, vote_average: parseFloat(e.target.value)})}
          className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full px-6 py-3 mt-6 rounded-lg bg-primary text-white hover:bg-primary/90"
      >
        Add Movie
      </button>
    </form>
  );
};

export default AdminMovieForm;