import React, { useState } from 'react';
import AuthModal from './AuthModal';

const TestModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ padding: '20px' }}>
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        Test Modal
      </button>
      
      {isOpen && (
        <AuthModal isOpen={true}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '40px',
            width: '100%',
            maxWidth: '420px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            color: 'black'
          }}>
            <h2 style={{
              fontSize: '32px',
              fontWeight: '800',
              color: '#1e293b',
              textAlign: 'center',
              marginBottom: '40px'
            }}>
              Test Modal
            </h2>
            
            <p style={{
              color: '#374151',
              marginBottom: '20px'
            }}>
              Modal đang hoạt động bình thường!
            </p>
            
            <button
              onClick={() => setIsOpen(false)}
              style={{
                width: '100%',
                padding: '16px 24px',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Đóng Modal
            </button>
          </div>
        </AuthModal>
      )}
    </div>
  );
};

export default TestModal;
