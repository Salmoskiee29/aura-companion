import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { AppRole } from '@/types';

interface Props {
  children: React.ReactNode;
  requiredRole: AppRole | AppRole[];
}

export function RoleProtectedRoute({ children, requiredRole }: Props) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/auth?mode=login" replace />;

  const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  if (!user?.role || !allowedRoles.includes(user.role)) {
    if (user?.role === 'developer') return <Navigate to="/admin-panel" replace />;
    if (user?.role === 'admin') return <Navigate to="/admin-panel" replace />;
    if (user?.role === 'chatter') return <Navigate to="/chatter-panel" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
