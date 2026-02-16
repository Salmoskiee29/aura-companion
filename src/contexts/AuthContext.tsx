import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
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

function buildAuthUser(user: User, role: AppRole): AuthUser {
  return {
    id: user.id,
    email: user.email || '',
    displayName: user.user_metadata?.display_name || user.email?.split('@')[0] || '',
    joinedAt: new Date(user.created_at),
    role,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Flag to prevent onAuthStateChange from overwriting login result
  const isLoggingIn = useRef(false);

  // Load user WITH role resolved before setting state
  const loadUserWithRole = useCallback(async (supaUser: User) => {
    const role = await fetchUserRole(supaUser.id);
    const authUser = buildAuthUser(supaUser, role);
    setUser(authUser);
    return authUser;
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await loadUserWithRole(session.user);
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // Skip if login() is handling this — it will set user itself
      if (isLoggingIn.current) return;

      if (session?.user) {
        await loadUserWithRole(session.user);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [loadUserWithRole]);

  const login = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    isLoggingIn.current = true;
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      // Fetch role BEFORE setting user — prevents premature redirect
      const role = await fetchUserRole(data.user.id);
      const authUser = buildAuthUser(data.user, role);
      setUser(authUser);
      return authUser;
    } finally {
      isLoggingIn.current = false;
    }
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
