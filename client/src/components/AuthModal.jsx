import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

const AuthModal = ({ children, isOpen }) => {
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Render modal at document body level to avoid parent container issues
  return createPortal(
    <div 
      className="auth-modal" 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        width: '100vw', 
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        margin: 0,
        padding: 0
      }}
    >
      {children}
    </div>,
    document.body
  );
};

export default AuthModal;
