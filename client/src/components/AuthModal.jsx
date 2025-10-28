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
    <div className="auth-modal">
      {children}
    </div>,
    document.body
  );
};

export default AuthModal;
