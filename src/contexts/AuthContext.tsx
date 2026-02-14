import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  joinedAt: Date;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('lumiere_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = useCallback(async (email: string, _password: string) => {
    // Mock login - will be replaced with Lovable Cloud auth
    const mockUser: AuthUser = {
      id: crypto.randomUUID(),
      email,
      displayName: email.split('@')[0],
      joinedAt: new Date(),
    };
    setUser(mockUser);
    localStorage.setItem('lumiere_user', JSON.stringify(mockUser));
  }, []);

  const signup = useCallback(async (email: string, _password: string) => {
    const mockUser: AuthUser = {
      id: crypto.randomUUID(),
      email,
      displayName: email.split('@')[0],
      joinedAt: new Date(),
    };
    setUser(mockUser);
    localStorage.setItem('lumiere_user', JSON.stringify(mockUser));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('lumiere_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
