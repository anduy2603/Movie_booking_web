import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../hooks/useAuth';

const ProtectedRoute = ({ children, requireAuth = true }) => {
  const { isAuthenticated, loading } = useUser();
  const location = useLocation();

  // Hiển thị loading khi đang kiểm tra authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Nếu route yêu cầu authentication nhưng user chưa đăng nhập
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Nếu route không yêu cầu authentication hoặc user đã đăng nhập
  return children;
};

export default ProtectedRoute;
