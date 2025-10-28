import api from '../lib/api';

// Get all bookings with pagination (admin only)
export const getBookingsRequest = (page = 1, size = 10) => {
  return api.get('/bookings', {
    params: { page, size }
  });
};

// Get booking by ID
export const getBookingByIdRequest = (bookingId) => {
  return api.get(`/bookings/${bookingId}`);
};

// Get user bookings with pagination
export const getUserBookingsRequest = (userId, page = 1, size = 10) => {
  return api.get(`/bookings/user/${userId}`, {
    params: { page, size }
  });
};

// Create booking(s) - accepts array of bookings
export const createBookingRequest = (bookingsData) => {
  return api.post('/bookings', bookingsData);
};

// Cancel booking
export const cancelBookingRequest = (bookingId) => {
  return api.put(`/bookings/${bookingId}/cancel`);
};

// Delete booking
export const deleteBookingRequest = (bookingId) => {
  return api.delete(`/bookings/${bookingId}`);
};

// Helper function to create single booking
export const createSingleBookingRequest = (bookingData) => {
  return createBookingRequest([bookingData]);
};

export default {
  getBookingsRequest,
  getBookingByIdRequest,
  getUserBookingsRequest,
  createBookingRequest,
  createSingleBookingRequest,
  cancelBookingRequest,
  deleteBookingRequest,
};
