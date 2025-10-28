import api from '../lib/api';

// Get all movies with pagination
export const getMoviesRequest = (page = 1, size = 10) => {
  return api.get('/movies', {
    params: { page, size }
  });
};

// Get movie by ID
export const getMovieByIdRequest = (movieId) => {
  return api.get(`/movies/${movieId}`);
};

// Create movie (admin only)
export const createMovieRequest = (movieData) => {
  return api.post('/movies', movieData);
};

// Update movie (admin only)
export const updateMovieRequest = (movieId, movieData) => {
  return api.put(`/movies/${movieId}`, movieData);
};

// Delete movie (admin only)
export const deleteMovieRequest = (movieId) => {
  return api.delete(`/movies/${movieId}`);
};

// Search movies (if server supports search)
export const searchMoviesRequest = (query, page = 1, size = 10) => {
  return api.get('/movies', {
    params: { 
      search: query,
      page, 
      size 
    }
  });
};

export default {
  getMoviesRequest,
  getMovieByIdRequest,
  createMovieRequest,
  updateMovieRequest,
  deleteMovieRequest,
  searchMoviesRequest,
};
