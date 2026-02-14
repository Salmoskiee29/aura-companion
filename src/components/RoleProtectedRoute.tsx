import { Navigate } from 'react-router-dom';
import { useRoleAuth } from '@/contexts/RoleAuthContext';
import type { AppRole } from '@/types';

interface Props {
  children: React.ReactNode;
  requiredRole: AppRole;
}

export function RoleProtectedRoute({ children, requiredRole }: Props) {
  const { isChatterAuthenticated, isAdminAuthenticated } = useRoleAuth();

  if (requiredRole === 'chatter' && !isChatterAuthenticated) {
    return <Navigate to="/chatter-login" replace />;
  }

  if (requiredRole === 'admin' && !isAdminAuthenticated) {
    return <Navigate to="/admin-login" replace />;
  }

  return <>{children}</>;
}
