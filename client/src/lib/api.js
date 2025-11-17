import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

console.log('API Base URL:', API_BASE_URL);

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
  async (config) => {
    try {
      // Add timestamp to prevent caching
      if (config.method?.toUpperCase() === 'GET') {
        config.params = {
          ...config.params,
          _t: Date.now(),
        };
      }

      // Add auth token if available
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add language preference if needed
      config.headers['Accept-Language'] = 'vi';

      return config;
    } catch (error) {
      console.error('Server connection error:', error);
      toast.error('Không thể kết nối đến server. Vui lòng thử lại sau.');
      return Promise.reject(error);
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Handle success messages if provided by the server
    if (response?.data?.message && !response.config?.suppressToast) {
      toast.success(response.data.message);
    }
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

    // Skip toast if suppressed
    if (error.config?.suppressToast) {
      return Promise.reject(error);
    }

    // Handle common errors
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          // Bad Request
          toast.error(data?.message || data?.detail || 'Yêu cầu không hợp lệ.');
          break;

        case 401:
          // Unauthorized - token expired or invalid
          localStorage.removeItem('token');
          if (window.location.pathname !== '/') {
            toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            window.location.href = '/';
          }
          break;

        case 403:
          // Forbidden - user doesn't have required permissions
          toast.error(data?.message || 'Bạn không có quyền thực hiện hành động này.');
          break;

        case 404:
          // Not Found
          toast.error(data?.message || 'Không tìm thấy dữ liệu yêu cầu.');
          break;

        case 409:
          // Conflict
          toast.error(data?.message || 'Dữ liệu đã tồn tại hoặc có xung đột.');
          break;

        case 422:
          // Validation errors
          if (data?.detail && Array.isArray(data.detail)) {
            // Handle multiple validation errors
            data.detail.forEach(err => {
              const errorMsg = err.msg || err.message;
              if (errorMsg) toast.error(errorMsg);
            });
          } else {
            toast.error(data?.message || data?.detail || 'Dữ liệu không hợp lệ.');
          }
          break;

        case 429:
          // Too Many Requests
          toast.error('Quá nhiều yêu cầu. Vui lòng thử lại sau.');
          break;

        case 500:
        case 502:
        case 503:
          // Server Errors
          toast.error('Lỗi máy chủ. Vui lòng thử lại sau.');
          break;

        default:
          // Unknown error status
          toast.error(data?.message || data?.detail || 'Đã xảy ra lỗi. Vui lòng thử lại.');
      }
    } else if (error.request) {
      // Network error - request made but no response received
      toast.error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
    } else {
      // Error in setting up the request
      toast.error('Đã xảy ra lỗi trong quá trình xử lý yêu cầu.');
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
