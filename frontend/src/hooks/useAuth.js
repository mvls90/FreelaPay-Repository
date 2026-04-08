// src/hooks/useAuth.js
import { useAuthStore } from '../store/index';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

export function useAuth() {
  const { user, accessToken, logout } = useAuthStore();
  const navigate = useNavigate();

  const requireAuth = useCallback(() => {
    if (!accessToken) { navigate('/login'); return false; }
    return true;
  }, [accessToken, navigate]);

  const requireRole = useCallback((...roles) => {
    if (!user) { navigate('/login'); return false; }
    if (!roles.includes(user.type)) { navigate('/dashboard'); return false; }
    return true;
  }, [user, navigate]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const isFreelancer = user?.type === 'freelancer';
  const isClient     = user?.type === 'client';
  const isAdmin      = ['admin', 'mediator', 'support'].includes(user?.type);

  const dashboardPath = isFreelancer ? '/freelancer/dashboard'
    : isClient ? '/cliente/dashboard'
    : '/admin/dashboard';

  return { user, accessToken, isFreelancer, isClient, isAdmin, dashboardPath, requireAuth, requireRole, handleLogout };
}
