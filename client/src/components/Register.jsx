import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import AuthModal from './AuthModal';
import '../styles/auth.css';

const Register = ({ isOpen = false, onClose, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    username: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Safe destructuring with fallback
  const authContext = useAuth();
  const register = authContext?.register || (() => Promise.resolve({ success: false, error: 'Auth context not available' }));

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError('');
    setLoading(true);
    
    try {
      if (!formData.email || !formData.password || !formData.full_name) {
        setError('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Mật khẩu xác nhận không khớp');
        return;
      }

      if (formData.password.length < 8) {
        setError('Mật khẩu phải có ít nhất 8 ký tự');
        return;
      }

      const registerData = {
        email: formData.email,
        username: formData.username || formData.email,
        full_name: formData.full_name,
        password: formData.password,
        confirm_password: formData.confirmPassword
      };
      
      const result = await register(registerData);
      
      if (result.success) {
        onClose && onClose();
      } else {
        let errorMessage = result.error || 'Đăng ký thất bại, vui lòng thử lại';
        if (Array.isArray(result.error)) {
          errorMessage = result.error.map(err => err.msg || err.message || err).join(', ');
        } else if (typeof result.error === 'object') {
          errorMessage = result.error?.message || result.error?.detail || errorMessage;
        }
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Đăng ký thất bại, vui lòng thử lại sau');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthModal isOpen={isOpen}>
      <div className="auth-modal-content" style={{ 
        maxHeight: '90vh', 
        overflowY: 'auto',
        position: 'relative',
        margin: '0 auto',
        transform: 'none',
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '40px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        color: 'black'
      }}>
        <button
          onClick={onClose}
          className="auth-close-button"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            color: '#64748b',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '12px',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 className="auth-title" style={{
          fontSize: '32px',
          fontWeight: '800',
          color: '#1e293b',
          textAlign: 'center',
          marginBottom: '40px'
        }}>Đăng ký</h2>

        <form onSubmit={handleSubmit} className="auth-form" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          {error && (
            <div className="auth-error" style={{
              background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '16px 20px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '20px'
            }}>
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="full_name" className="auth-label" style={{
              display: 'block',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px',
              fontSize: '14px'
            }}>
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
              style={{
                width: '100%',
                padding: '16px 20px',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '500',
                backgroundColor: 'white',
                color: '#1e293b'
              }}
              placeholder="Nhập họ và tên của bạn"
            />
          </div>

          <div>
            <label htmlFor="email" className="auth-label" style={{
              display: 'block',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px',
              fontSize: '14px'
            }}>
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
              style={{
                width: '100%',
                padding: '16px 20px',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '500',
                backgroundColor: 'white',
                color: '#1e293b'
              }}
              placeholder="Nhập email của bạn"
            />
          </div>

          <div>
            <label htmlFor="username" className="auth-label" style={{
              display: 'block',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px',
              fontSize: '14px'
            }}>
              Tên người dùng (tùy chọn)
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="auth-input"
              style={{
                width: '100%',
                padding: '16px 20px',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '500',
                backgroundColor: 'white',
                color: '#1e293b'
              }}
              placeholder="Nhập tên người dùng"
            />
          </div>

          <div>
            <label htmlFor="password" className="auth-label" style={{
              display: 'block',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px',
              fontSize: '14px'
            }}>
              Mật khẩu *
            </label>
            <div className="auth-password-container" style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="auth-input"
                style={{
                  width: '100%',
                  padding: '16px 60px 16px 20px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '500',
                  backgroundColor: 'white',
                  color: '#1e293b'
                }}
                placeholder="Nhập mật khẩu (ít nhất 8 ký tự)"
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255, 255, 255, 0.8)',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '8px',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="auth-label" style={{
              display: 'block',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px',
              fontSize: '14px'
            }}>
              Xác nhận mật khẩu *
            </label>
            <div className="auth-password-container" style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="auth-input"
                style={{
                  width: '100%',
                  padding: '16px 60px 16px 20px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '500',
                  backgroundColor: 'white',
                  color: '#1e293b'
                }}
                placeholder="Nhập lại mật khẩu"
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255, 255, 255, 0.8)',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '8px',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-button"
            style={{
              width: '100%',
              padding: '16px 24px',
              background: loading ? 'linear-gradient(135deg, #94a3b8, #64748b)' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>

        <div className="auth-switch" style={{
          textAlign: 'center',
          marginTop: '32px',
          fontSize: '14px',
          color: '#64748b'
        }}>
          <p>
            Đã có tài khoản?{' '}
            <button onClick={onSwitchToLogin} style={{
              color: '#3b82f6',
              background: 'none',
              border: 'none',
              fontWeight: '600',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}>
              Đăng nhập ngay
            </button>
          </p>
        </div>
      </div>
    </AuthModal>
  );
};

export default Register;