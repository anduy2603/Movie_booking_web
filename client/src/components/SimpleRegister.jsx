import React, { useState } from 'react';
import AuthModal from './AuthModal';
import { useAuth } from '../hooks/useAuth';

const SimpleRegister = ({ onClose, onSwitchToLogin }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    username: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    console.log('SimpleRegister form submitted:', formData);
    
    // Validation
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

    setLoading(true);
    console.log('Starting registration...');

    // Include confirm_password as required by server
    const registerData = {
      email: formData.email,
      username: formData.username,
      full_name: formData.full_name,
      password: formData.password,
      confirm_password: formData.confirmPassword
    };
    console.log('Register data:', registerData);
    
    try {
      const result = await register(registerData);
      console.log('Register result:', result);
      
      if (result.success) {
        console.log('Registration successful');
        onClose();
      } else {
        console.log('Registration failed:', result.error);
        // Handle array of errors from server
        let errorMessage = 'Đăng ký thất bại';
        if (Array.isArray(result.error)) {
          errorMessage = result.error.map(err => err.msg || err.message || err).join(', ');
        } else if (typeof result.error === 'string') {
          errorMessage = result.error;
        } else if (result.error && typeof result.error === 'object') {
          errorMessage = result.error.message || result.error.detail || 'Đăng ký thất bại';
        }
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error?.response?.data?.detail || 'Đã xảy ra lỗi không xác định');
    }
    
    setLoading(false);
  };

  return (
    <AuthModal isOpen={true}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '40px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        color: 'black',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
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
          ✕
        </button>
        
        <h2 style={{
          fontSize: '32px',
          fontWeight: '800',
          color: '#1e293b',
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          Đăng ký (Test)
        </h2>

        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          {error && (
            <div style={{
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
            <label style={{
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
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '16px 20px',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '500',
                backgroundColor: 'white',
                color: '#1e293b',
                boxSizing: 'border-box'
              }}
              placeholder="Nhập họ và tên của bạn"
            />
          </div>

          <div>
            <label style={{
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
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '16px 20px',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '500',
                backgroundColor: 'white',
                color: '#1e293b',
                boxSizing: 'border-box'
              }}
              placeholder="Nhập email của bạn"
            />
          </div>

          <div>
            <label style={{
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
              name="username"
              value={formData.username}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '16px 20px',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '500',
                backgroundColor: 'white',
                color: '#1e293b',
                boxSizing: 'border-box'
              }}
              placeholder="Nhập tên người dùng"
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px',
              fontSize: '14px'
            }}>
              Mật khẩu *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '16px 20px',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '500',
                backgroundColor: 'white',
                color: '#1e293b',
                boxSizing: 'border-box'
              }}
              placeholder="Nhập mật khẩu (ít nhất 8 ký tự)"
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px',
              fontSize: '14px'
            }}>
              Xác nhận mật khẩu *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '16px 20px',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '500',
                backgroundColor: 'white',
                color: '#1e293b',
                boxSizing: 'border-box'
              }}
              placeholder="Nhập lại mật khẩu"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
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

        <div style={{
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

export default SimpleRegister;
