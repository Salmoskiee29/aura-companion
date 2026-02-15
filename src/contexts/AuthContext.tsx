import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { AppRole } from '@/types';

interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  joinedAt: Date;
  role: AppRole;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

async function fetchUserRole(userId: string): Promise<AppRole> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .limit(1)
      .single();
    if (error) {
      console.error('fetchUserRole error:', error);
      return 'user';
    }
    return (data?.role as AppRole) || 'user';
  } catch (e) {
    console.error('fetchUserRole exception:', e);
    return 'user';
  }
}

function buildBasicUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email || '',
    displayName: user.user_metadata?.display_name || user.email?.split('@')[0] || '',
    joinedAt: new Date(user.created_at),
    role: 'user', // Default, will be updated
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch role separately to avoid blocking auth state changes
  const loadUserWithRole = useCallback(async (supaUser: User) => {
    const basic = buildBasicUser(supaUser);
    setUser(basic); // Set immediately so isAuthenticated becomes true
    // Then fetch role asynchronously
    const role = await fetchUserRole(supaUser.id);
    setUser(prev => prev && prev.id === supaUser.id ? { ...prev, role } : prev);
    return { ...basic, role };
  }, []);

  useEffect(() => {
    // First get current session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await loadUserWithRole(session.user);
      }
      setIsLoading(false);
    });

    // Then listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // Use setTimeout to avoid blocking the auth state change callback
        setTimeout(() => {
          loadUserWithRole(session.user);
        }, 0);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [loadUserWithRole]);

  const login = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    const basic = buildBasicUser(data.user);
    setUser(basic);
    // Fetch role after login
    const role = await fetchUserRole(data.user.id);
    const authUser = { ...basic, role };
    setUser(authUser);
    return authUser;
  }, []);

  const signup = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) throw new Error(error.message);
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
