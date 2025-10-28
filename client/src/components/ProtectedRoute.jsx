import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';

const ProtectedRoute = ({ children, requireAuth = true, requireAdmin = false }) => {
  const { isAuthenticated, loading, user } = useUser();
  const location = useLocation();

  // Hiển thị loading khi đang kiểm tra authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Kiểm tra authentication
  if (requireAuth && !isAuthenticated) {
    toast.error('Please login to continue');
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Kiểm tra quyền admin
  if (requireAdmin && (!user || user.role !== 'admin')) {
    toast.error('Admin access required');
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Nếu đã pass tất cả điều kiện
  return children;
};

export default ProtectedRoute;
