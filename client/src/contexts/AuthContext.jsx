import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { setAuthToken } from '../lib/api';
import * as authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // cập nhật header Authorization cho axios
  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  // Kiểm tra token khi component mount
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const resp = await authService.getMeRequest();
          setUser(resp.data);
        } catch (error) {
          console.error('Auth check failed:', error);
          // Clear invalid token silently - don't show error toast for auth check
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email, password) => {
    try {
      const resp = await authService.loginRequest(email, password);
      const data = resp.data;
      setToken(data.access_token);
      setAuthToken(data.access_token);
      setUser(data.user);
      localStorage.setItem('token', data.access_token);
      toast.success('Đăng nhập thành công!');
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const message = error?.response?.data?.detail || 'Đăng nhập thất bại';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const resp = await authService.registerRequest(userData);
      const data = resp.data;
      setToken(data.access_token);
      setAuthToken(data.access_token);
      setUser(data.user);
      localStorage.setItem('token', data.access_token);
      toast.success('Đăng ký thành công!');
      return { success: true };
    } catch (error) {
      console.error('Register error:', error);
      const message = error?.response?.data?.detail || 'Đăng ký thất bại';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      // Server has a logout endpoint but it only returns message; call it optionally
      try { await authService.logoutRequest(); } catch (e) { /* ignore */ }
    } finally {
      setUser(null);
      setToken(null);
      setAuthToken(null);
      localStorage.removeItem('token');
      toast.success('Đăng xuất thành công!');
    }
  };

  const updateProfile = async (userData) => {
    try {
      const resp = await authService.updateProfileRequest(userData);
      setUser(resp.data);
      toast.success('Cập nhật thông tin thành công!');
      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      const message = error?.response?.data?.detail || 'Cập nhật thất bại';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await authService.changePasswordRequest(currentPassword, newPassword);
      toast.success('Đổi mật khẩu thành công!');
      return { success: true };
    } catch (error) {
      console.error('Change password error:', error);
      const message = error?.response?.data?.detail || 'Đổi mật khẩu thất bại';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
