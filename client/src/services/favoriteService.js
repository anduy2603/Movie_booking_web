import api from '../lib/api';

// Get user favorites
export const getUserFavoritesRequest = (userId) => {
  return api.get(`/favorites/user/${userId}`);
};

// Toggle favorite (add or remove)
export const toggleFavoriteRequest = (userId, movieId) => {
  return api.post('/favorites/toggle', {
    user_id: userId,
    movie_id: movieId
  });
};

// Add movie to favorites
export const addToFavoritesRequest = (userId, movieId) => {
  return toggleFavoriteRequest(userId, movieId);
};

// Remove movie from favorites
export const removeFromFavoritesRequest = (userId, movieId) => {
  return toggleFavoriteRequest(userId, movieId);
};

export default {
  getUserFavoritesRequest,
  toggleFavoriteRequest,
  addToFavoritesRequest,
  removeFromFavoritesRequest,
};
