import api from '../lib/api';

// Get all showtimes with pagination
export const getShowtimesRequest = (page = 1, size = 10) => {
  return api.get('/showtimes', {
    params: { page, size }
  });
};

// Get showtime by ID
export const getShowtimeByIdRequest = (showtimeId) => {
  return api.get(`/showtimes/${showtimeId}`);
};

// Get showtimes by movie ID with pagination
export const getShowtimesByMovieRequest = (movieId, page = 1, size = 10) => {
  return api.get(`/showtimes/movie/${movieId}`, {
    params: { page, size }
  });
};

// Create showtime (admin only)
export const createShowtimeRequest = (showtimeData) => {
  return api.post('/showtimes', showtimeData);
};

// Update showtime (admin only)
export const updateShowtimeRequest = (showtimeId, showtimeData) => {
  return api.put(`/showtimes/${showtimeId}`, showtimeData);
};

// Delete showtime (admin only)
export const deleteShowtimeRequest = (showtimeId) => {
  return api.delete(`/showtimes/${showtimeId}`);
};

export default {
  getShowtimesRequest,
  getShowtimeByIdRequest,
  getShowtimesByMovieRequest,
  createShowtimeRequest,
  updateShowtimeRequest,
  deleteShowtimeRequest,
};
