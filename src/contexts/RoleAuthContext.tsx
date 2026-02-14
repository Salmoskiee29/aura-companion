import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import type { AppRole } from '@/types';

interface RoleUser {
  id: string;
  email: string;
  role: AppRole;
  displayName: string;
  lastActivity: number;
}

interface RoleAuthContextType {
  chatterUser: RoleUser | null;
  adminUser: RoleUser | null;
  loginAsChatter: (email: string, password: string) => Promise<void>;
  loginAsAdmin: (email: string, password: string) => Promise<void>;
  logoutChatter: () => void;
  logoutAdmin: () => void;
  isChatterAuthenticated: boolean;
  isAdminAuthenticated: boolean;
}

const RoleAuthContext = createContext<RoleAuthContextType | null>(null);

export function useRoleAuth() {
  const ctx = useContext(RoleAuthContext);
  if (!ctx) throw new Error('useRoleAuth must be used within RoleAuthProvider');
  return ctx;
}

// Mock accounts database
const MOCK_ACCOUNTS: Array<{ email: string; password: string; role: AppRole; displayName: string }> = [
  { email: 'chatter1@lumiere.com', password: 'chatter123', role: 'chatter', displayName: 'Chatter Alex' },
  { email: 'chatter2@lumiere.com', password: 'chatter123', role: 'chatter', displayName: 'Chatter Maria' },
  { email: 'chatter3@lumiere.com', password: 'chatter123', role: 'chatter', displayName: 'Chatter Jake' },
  { email: 'admin@lumiere.com', password: 'admin123', role: 'admin', displayName: 'Admin' },
  { email: 'superadmin@lumiere.com', password: 'admin456', role: 'admin', displayName: 'Super Admin' },
];

// Login attempt tracking for rate limiting
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(email: string): boolean {
  const now = Date.now();
  const record = loginAttempts.get(email);
  if (!record) return true;
  if (now - record.lastAttempt > LOCKOUT_DURATION) {
    loginAttempts.delete(email);
    return true;
  }
  return record.count < MAX_LOGIN_ATTEMPTS;
}

function recordAttempt(email: string) {
  const now = Date.now();
  const record = loginAttempts.get(email);
  if (!record || now - record.lastAttempt > LOCKOUT_DURATION) {
    loginAttempts.set(email, { count: 1, lastAttempt: now });
  } else {
    loginAttempts.set(email, { count: record.count + 1, lastAttempt: now });
  }
}

function getRemainingLockout(email: string): number {
  const record = loginAttempts.get(email);
  if (!record || record.count < MAX_LOGIN_ATTEMPTS) return 0;
  const elapsed = Date.now() - record.lastAttempt;
  return Math.max(0, Math.ceil((LOCKOUT_DURATION - elapsed) / 60000));
}

export { getRemainingLockout };

export function RoleAuthProvider({ children }: { children: ReactNode }) {
  const [chatterUser, setChatterUser] = useState<RoleUser | null>(() => {
    const saved = localStorage.getItem('lumiere_chatter_session');
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    // Check inactivity
    if (Date.now() - parsed.lastActivity > INACTIVITY_TIMEOUT) {
      localStorage.removeItem('lumiere_chatter_session');
      return null;
    }
    return parsed;
  });

  const [adminUser, setAdminUser] = useState<RoleUser | null>(() => {
    const saved = localStorage.getItem('lumiere_admin_session');
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    if (Date.now() - parsed.lastActivity > INACTIVITY_TIMEOUT) {
      localStorage.removeItem('lumiere_admin_session');
      return null;
    }
    return parsed;
  });

  // Inactivity auto-logout
  useEffect(() => {
    const interval = setInterval(() => {
      if (chatterUser && Date.now() - chatterUser.lastActivity > INACTIVITY_TIMEOUT) {
        setChatterUser(null);
        localStorage.removeItem('lumiere_chatter_session');
      }
      if (adminUser && Date.now() - adminUser.lastActivity > INACTIVITY_TIMEOUT) {
        setAdminUser(null);
        localStorage.removeItem('lumiere_admin_session');
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [chatterUser, adminUser]);

  // Update lastActivity on interaction
  useEffect(() => {
    const updateActivity = () => {
      if (chatterUser) {
        const updated = { ...chatterUser, lastActivity: Date.now() };
        setChatterUser(updated);
        localStorage.setItem('lumiere_chatter_session', JSON.stringify(updated));
      }
      if (adminUser) {
        const updated = { ...adminUser, lastActivity: Date.now() };
        setAdminUser(updated);
        localStorage.setItem('lumiere_admin_session', JSON.stringify(updated));
      }
    };
    window.addEventListener('click', updateActivity);
    window.addEventListener('keydown', updateActivity);
    return () => {
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('keydown', updateActivity);
    };
  }, [chatterUser, adminUser]);

  const loginAsChatter = useCallback(async (email: string, password: string) => {
    if (!checkRateLimit(email)) {
      const mins = getRemainingLockout(email);
      throw new Error(`Too many login attempts. Try again in ${mins} minute(s).`);
    }
    const account = MOCK_ACCOUNTS.find(a => a.email === email && a.password === password);
    if (!account) {
      recordAttempt(email);
      throw new Error('Invalid email or password.');
    }
    if (account.role !== 'chatter') {
      recordAttempt(email);
      throw new Error('Unauthorized access. Chatter account required.');
    }
    const user: RoleUser = {
      id: `chatter-${account.email}`,
      email: account.email,
      role: 'chatter',
      displayName: account.displayName,
      lastActivity: Date.now(),
    };
    setChatterUser(user);
    localStorage.setItem('lumiere_chatter_session', JSON.stringify(user));
  }, []);

  const loginAsAdmin = useCallback(async (email: string, password: string) => {
    if (!checkRateLimit(email)) {
      const mins = getRemainingLockout(email);
      throw new Error(`Too many login attempts. Try again in ${mins} minute(s).`);
    }
    const account = MOCK_ACCOUNTS.find(a => a.email === email && a.password === password);
    if (!account) {
      recordAttempt(email);
      throw new Error('Invalid email or password.');
    }
    if (account.role !== 'admin') {
      recordAttempt(email);
      throw new Error('Unauthorized access. Admin account required.');
    }
    const user: RoleUser = {
      id: `admin-${account.email}`,
      email: account.email,
      role: 'admin',
      displayName: account.displayName,
      lastActivity: Date.now(),
    };
    setAdminUser(user);
    localStorage.setItem('lumiere_admin_session', JSON.stringify(user));
  }, []);

  const logoutChatter = useCallback(() => {
    setChatterUser(null);
    localStorage.removeItem('lumiere_chatter_session');
  }, []);

  const logoutAdmin = useCallback(() => {
    setAdminUser(null);
    localStorage.removeItem('lumiere_admin_session');
  }, []);

  return (
    <RoleAuthContext.Provider value={{
      chatterUser, adminUser,
      loginAsChatter, loginAsAdmin,
      logoutChatter, logoutAdmin,
      isChatterAuthenticated: !!chatterUser,
      isAdminAuthenticated: !!adminUser,
    }}>
      {children}
    </RoleAuthContext.Provider>
  );
}
