import api from '../lib/api';

// Get all theaters with pagination
export const getTheatersRequest = (page = 1, size = 10) => {
  return api.get('/theaters', {
    params: { page, size }
  });
};

// Get theater by ID
export const getTheaterByIdRequest = (theaterId) => {
  return api.get(`/theaters/${theaterId}`);
};

// Create theater (admin only)
export const createTheaterRequest = (theaterData) => {
  return api.post('/theaters', theaterData);
};

// Update theater (admin only)
export const updateTheaterRequest = (theaterId, theaterData) => {
  return api.put(`/theaters/${theaterId}`, theaterData);
};

// Delete theater (admin only)
export const deleteTheaterRequest = (theaterId) => {
  return api.delete(`/theaters/${theaterId}`);
};

export default {
  getTheatersRequest,
  getTheaterByIdRequest,
  createTheaterRequest,
  updateTheaterRequest,
  deleteTheaterRequest,
};
