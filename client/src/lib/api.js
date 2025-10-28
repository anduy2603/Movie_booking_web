import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Helper function to suppress toast for specific requests
export const suppressToastForRequest = (config) => {
  config.suppressToast = true;
  return config;
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add timestamp to prevent caching
    config.params = {
      ...config.params,
      _t: Date.now(),
    };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Log error payload for easier debugging
    try {
      console.error('API error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
      });
    } catch (e) {
      console.error('Failed to log API error', e);
    }

    // Handle common errors
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - token expired or invalid
          localStorage.removeItem('token');
          if (!error.config?.suppressToast && window.location.pathname !== '/') {
            toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            window.location.href = '/';
          }
          break;
        case 403:
          // Only show permission error if not suppressed
          if (!error.config?.suppressToast) {
            toast.error('Bạn không có quyền thực hiện hành động này.');
          }
          break;
        case 404:
          toast.error('Không tìm thấy dữ liệu.');
          break;
        case 422:
          // Validation errors
          if (data && data.detail && Array.isArray(data.detail)) {
            data.detail.forEach(err => {
              toast.error(err.msg || err.message || 'Dữ liệu không hợp lệ.');
            });
          } else {
            toast.error((data && data.detail) || 'Dữ liệu không hợp lệ.');
          }
          break;
        case 500:
          toast.error('Lỗi máy chủ. Vui lòng thử lại sau.');
          break;
        default:
          toast.error((data && data.detail) || 'Đã xảy ra lỗi. Vui lòng thử lại.');
      }
    } else if (error.request) {
      // Network error
      toast.error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
    } else {
      // Other errors
      toast.error('Đã xảy ra lỗi không xác định.');
    }

    return Promise.reject(error);
  }
);

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Helper function to check if API is reachable
export const checkApiConnection = async () => {
  try {
    const response = await api.get('/');
    return response.status === 200;
  } catch (error) {
    console.error('API connection failed:', error);
    return false;
  }
};

export default api;
