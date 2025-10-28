import api, { suppressToastForRequest } from '../lib/api';

export const loginRequest = (email, password) => {
  return api.post('/auth/login', { email, password });
};

export const registerRequest = (userData) => {
  console.log('authService.registerRequest called with:', userData);
  return api.post('/auth/register', userData);
};

export const getMeRequest = () => {
  return api.get('/auth/me', suppressToastForRequest({}));
};

export const updateProfileRequest = (userData) => {
  return api.put('/auth/me', userData);
};

export const changePasswordRequest = (currentPassword, newPassword) => {
  return api.post('/auth/change-password', {
    current_password: currentPassword,
    new_password: newPassword,
  });
};

export const logoutRequest = () => {
  return api.post('/auth/logout');
};

export default {
  loginRequest,
  registerRequest,
  getMeRequest,
  updateProfileRequest,
  changePasswordRequest,
  logoutRequest,
};
