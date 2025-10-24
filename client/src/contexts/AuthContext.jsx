import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Kiểm tra token khi component mount
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            // Token không hợp lệ, xóa khỏi localStorage
            localStorage.removeItem('token');
            setToken(null);
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.access_token);
        setUser(data.user);
        localStorage.setItem('token', data.access_token);
        toast.success('Đăng nhập thành công!');
        return { success: true };
      } else {
        toast.error(data.detail || 'Đăng nhập thất bại');
        return { success: false, error: data.detail };
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Có lỗi xảy ra khi đăng nhập');
      return { success: false, error: 'Network error' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.access_token);
        setUser(data.user);
        localStorage.setItem('token', data.access_token);
        toast.success('Đăng ký thành công!');
        return { success: true };
      } else {
        toast.error(data.detail || 'Đăng ký thất bại');
        return { success: false, error: data.detail };
      }
    } catch (error) {
      console.error('Register error:', error);
      toast.error('Có lỗi xảy ra khi đăng ký');
      return { success: false, error: 'Network error' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    toast.success('Đăng xuất thành công!');
  };

  const updateProfile = async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data);
        toast.success('Cập nhật thông tin thành công!');
        return { success: true };
      } else {
        toast.error(data.detail || 'Cập nhật thất bại');
        return { success: false, error: data.detail };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error('Có lỗi xảy ra khi cập nhật thông tin');
      return { success: false, error: 'Network error' };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Đổi mật khẩu thành công!');
        return { success: true };
      } else {
        toast.error(data.detail || 'Đổi mật khẩu thất bại');
        return { success: false, error: data.detail };
      }
    } catch (error) {
      console.error('Change password error:', error);
      toast.error('Có lỗi xảy ra khi đổi mật khẩu');
      return { success: false, error: 'Network error' };
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
