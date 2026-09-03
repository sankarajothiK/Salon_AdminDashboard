import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { LoadingSpinner } from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, loading, isAuthenticated, hasRole } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner message="Verifying company authentication session..." size="lg" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !hasRole(allowedRoles)) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl shadow-xs font-alata">
        <h2 className="text-base font-bold text-rose-600">Restricted Authorization</h2>
        <p className="text-xs text-slate-500 mt-2">
          Your current role (<strong className="text-slate-800">{user?.role}</strong>) does not have sufficient permission to access this module.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
