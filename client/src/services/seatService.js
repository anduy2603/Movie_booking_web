import api from '../lib/api';

// Get all seats
export const getAllSeatsRequest = () => {
  return api.get('/seats');
};

// Get seat by ID
export const getSeatByIdRequest = (seatId) => {
  return api.get(`/seats/${seatId}`);
};

// Get seats by room ID
export const getSeatsByRoomRequest = (roomId) => {
  return api.get(`/seats/room/${roomId}`);
};

// Create seat (admin only)
export const createSeatRequest = (seatData) => {
  return api.post('/seats', seatData);
};

// Update seat (admin only)
export const updateSeatRequest = (seatId, seatData) => {
  return api.put(`/seats/${seatId}`, seatData);
};

// Delete seat (admin only)
export const deleteSeatRequest = (seatId) => {
  return api.delete(`/seats/${seatId}`);
};

export default {
  getAllSeatsRequest,
  getSeatByIdRequest,
  getSeatsByRoomRequest,
  createSeatRequest,
  updateSeatRequest,
  deleteSeatRequest,
};
