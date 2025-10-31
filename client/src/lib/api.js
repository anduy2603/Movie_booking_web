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
  withCredentials: true, // Enable sending cookies
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
      config.params = {
        ...config.params,
        _t: Date.now(),
      };

      // Add auth token if available
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        // Try to get token from cookie as fallback
        const tokenFromCookie = document.cookie.split('; ').find(row => row.startsWith('token='));
        if (tokenFromCookie) {
          const token = tokenFromCookie.split('=')[1];
          config.headers.Authorization = `Bearer ${token}`;
        }
      }

      // Add language preference if needed
      config.headers['Accept-Language'] = 'vi';

      // Log outgoing request for debugging
      console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`, config);

      return config;
    } catch (error) {
      console.error('[API Request Error]', error);
      throw error;
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
      const errorInfo = {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      };
      console.error('[API Error]:', errorInfo);
    } catch (e) {
      console.error('[API Error Logger Failed]:', e);
    }

    // Skip toast if suppressed
    if (error.config?.suppressToast) {
      return Promise.reject(error);
    }

    // Handle network errors
    if (!error.response) {
      toast.error('Network error. Please check your connection.');
      return Promise.reject(error);
    }

    // Handle common errors
    if (error.response) {
      const { status, data } = error.response;
      const errorMessage = data?.message || data?.detail || 'An error occurred';
      
      switch (status) {
        case 400:
          toast.error(`Invalid request: ${errorMessage}`);
          break;

        case 401:
          // Unauthorized - token expired or invalid
          localStorage.removeItem('token');
          if (window.location.pathname !== '/') {
            toast.error('Session expired. Please login again.');
            window.location.href = '/';
          }
          break;

        case 403:
          toast.error(data?.message || 'Access denied. Insufficient permissions.');
          break;

        case 404:
          toast.error(data?.message || 'Resource not found.');
          break;

        case 409:
          toast.error(data?.message || 'Data conflict or already exists.');
          break;

        case 422:
          // Handle validation errors
          if (data?.detail && Array.isArray(data.detail)) {
            data.detail.forEach(err => {
              const errorMsg = err.msg || err.message;
              if (errorMsg) toast.error(errorMsg);
            });
          } else {
            toast.error(data?.message || data?.detail || 'Invalid data.');
          }
          break;

        case 429:
          toast.error('Too many requests. Please try again later.');
          break;

        case 500:
        case 502:
        case 503:
          toast.error('Server error. Please try again later.');
          break;

        default:
          toast.error(`Error: ${errorMessage}`);
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
