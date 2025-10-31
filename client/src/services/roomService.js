import api from '../lib/api';

// Get all rooms with pagination
export const getRoomsRequest = (page = 1, size = 10) => {
  return api.get('/rooms', { params: { page, size } });
};

// Get rooms by theater
export const getRoomsByTheaterRequest = (theaterId, page = 1, size = 10) => {
  return api.get(`/rooms/theater/${theaterId}`, { params: { page, size } });
};

// Get room by ID
export const getRoomByIdRequest = (roomId) => {
  return api.get(`/rooms/${roomId}`);
};

// Create room (admin only)
export const createRoomRequest = (roomData) => {
  return api.post('/rooms', roomData);
};

// Update room (admin only)
export const updateRoomRequest = (roomId, roomData) => {
  return api.put(`/rooms/${roomId}`, roomData);
};

// Delete room (admin only)
export const deleteRoomRequest = (roomId) => {
  return api.delete(`/rooms/${roomId}`);
};

// Generate seats for a room (admin only)
export const generateSeatsRequest = (roomId, overwrite = false) => {
  return api.post(`/rooms/${roomId}/generate-seats`, null, { params: { overwrite } });
};

export default {
  getRoomsRequest,
  getRoomsByTheaterRequest,
  getRoomByIdRequest,
  createRoomRequest,
  updateRoomRequest,
  deleteRoomRequest,
  generateSeatsRequest,
};
