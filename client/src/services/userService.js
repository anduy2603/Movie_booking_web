import api from '../lib/api';

const getAllUsersRequest = async (page = 1, size = 10) => {
  return await api.get('/users', { params: { page, size } });
};

const getUserByIdRequest = async (userId) => {
  return await api.get(`/users/${userId}`);
};

const updateUserRequest = async (userId, data) => {
  return await api.put(`/users/${userId}`, data);
};

// Note: Server does not expose PATCH /users/{id}/status; use PUT /users/{id}
const updateUserStatusRequest = async (userId, data) => {
  return await api.put(`/users/${userId}`, data);
};

const deleteUserRequest = async (userId) => {
  return await api.delete(`/users/${userId}`);
};

export const userService = {
  getAllUsersRequest,
  getUserByIdRequest,
  updateUserRequest,
  updateUserStatusRequest,
  deleteUserRequest,
};

export default userService;