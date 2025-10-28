import api from '../lib/api';

const getAllUsersRequest = async (page = 1, limit = 10) => {
  return await api.get(`/users?page=${page}&limit=${limit}`);
};

const getUserByIdRequest = async (userId) => {
  return await api.get(`/users/${userId}`);
};

const updateUserRequest = async (userId, data) => {
  return await api.put(`/users/${userId}`, data);
};

const updateUserStatusRequest = async (userId, data) => {
  return await api.patch(`/users/${userId}/status`, data);
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