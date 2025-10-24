import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import AuthModal from './AuthModal';
import '../styles/auth.css';

const Login = ({ onClose, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Vui lòng điền đầy đủ thông tin');
      setLoading(false);
      return;
    }

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      onClose();
    } else {
      setError(result.error || 'Đăng nhập thất bại');
    }
    
    setLoading(false);
  };

  return (
    <AuthModal isOpen={true}>
      <div className="auth-modal-content" style={{
        position: 'relative',
        margin: '0 auto',
        transform: 'none'
      }}>
        <button
          onClick={onClose}
          className="auth-close-button"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 className="auth-title">Đăng nhập</h2>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="auth-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="auth-input"
              placeholder="Nhập email của bạn"
            />
          </div>

          <div>
            <label htmlFor="password" className="auth-label">
              Mật khẩu
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="auth-input"
              placeholder="Nhập mật khẩu của bạn"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-button"
          >
            {loading ? (
              <span className="auth-loading">Đang đăng nhập...</span>
            ) : (
              'Đăng nhập'
            )}
          </button>
        </form>

        <div className="auth-switch">
          <p>
            Chưa có tài khoản?{' '}
            <button onClick={onSwitchToRegister}>
              Đăng ký ngay
            </button>
          </p>
        </div>
      </div>
    </AuthModal>
  );
};

export default Login;
