import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import AuthModal from './AuthModal';
import '../styles/auth.css';

const Register = ({ onClose, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    username: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!formData.email || !formData.password || !formData.full_name) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);

    const { confirmPassword, ...registerData } = formData;
    const result = await register(registerData);
    
    if (result.success) {
      onClose();
    } else {
      setError(result.error || 'Đăng ký thất bại');
    }
    
    setLoading(false);
  };

  return (
    <AuthModal isOpen={true}>
      <div className="auth-modal-content" style={{ 
        maxHeight: '90vh', 
        overflowY: 'auto',
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
        
        <h2 className="auth-title">Đăng ký</h2>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="full_name" className="auth-label">
              Họ và tên *
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              className="auth-input"
              placeholder="Nhập họ và tên của bạn"
            />
          </div>

          <div>
            <label htmlFor="email" className="auth-label">
              Email *
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
            <label htmlFor="username" className="auth-label">
              Tên người dùng (tùy chọn)
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="auth-input"
              placeholder="Nhập tên người dùng"
            />
          </div>

          <div>
            <label htmlFor="password" className="auth-label">
              Mật khẩu *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="auth-input"
              placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="auth-label">
              Xác nhận mật khẩu *
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="auth-input"
              placeholder="Nhập lại mật khẩu"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-button"
          >
            {loading ? (
              <span className="auth-loading">Đang đăng ký...</span>
            ) : (
              'Đăng ký'
            )}
          </button>
        </form>

        <div className="auth-switch">
          <p>
            Đã có tài khoản?{' '}
            <button onClick={onSwitchToLogin}>
              Đăng nhập ngay
            </button>
          </p>
        </div>
      </div>
    </AuthModal>
  );
};

export default Register;
