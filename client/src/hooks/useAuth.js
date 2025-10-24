import { useAuth as useAuthContext } from '../contexts/AuthContext';

export const useAuth = () => {
  return useAuthContext();
};

export const useAuthActions = () => {
  const { login, register, logout, updateProfile, changePassword } = useAuthContext();
  
  return {
    login,
    register,
    logout,
    updateProfile,
    changePassword,
  };
};

export const useUser = () => {
  const { user, isAuthenticated, loading, logout } = useAuthContext();
  
  return {
    user,
    isAuthenticated,
    loading,
    logout,
  };
};
