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

// Get bookings for a showtime (to mark occupied seats)
export const getBookingsByShowtimeRequest = (showtimeId) => {
  return api.get(`/bookings/showtime/${showtimeId}`);
};

// Pay for a booking
export const payBookingRequest = (bookingId, paymentMethod = 'bank_transfer') => {
  return api.post(`/bookings/${bookingId}/pay`, null, {
    params: { payment_method: paymentMethod }
  });
};

export default {
  getBookingsRequest,
  getBookingByIdRequest,
  getUserBookingsRequest,
  createBookingRequest,
  createSingleBookingRequest,
  cancelBookingRequest,
  deleteBookingRequest,
  getBookingsByShowtimeRequest,
  payBookingRequest,
};
