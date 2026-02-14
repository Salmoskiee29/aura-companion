import { Link, useLocation, Outlet } from 'react-router-dom';
import { Heart, Home, Users, UserCircle, Sparkles, MessageCircle, CreditCard, Settings, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Home', end: true },
  { to: '/dashboard/models', icon: Users, label: 'Models' },
  { to: '/dashboard/my-character', icon: UserCircle, label: 'My Character' },
  { to: '/dashboard/create-character', icon: Sparkles, label: 'Create Character' },
  { to: '/dashboard/chats', icon: MessageCircle, label: 'Chats' },
  { to: '/dashboard/billing', icon: CreditCard, label: 'Billing' },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path: string, end?: boolean) => {
    if (end) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col transition-transform duration-300 md:translate-x-0 md:static md:z-auto",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-border shrink-0">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            <span className="text-lg font-display font-bold text-foreground">Lumière</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                isActive(item.to, item.end)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-border shrink-0 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-semibold text-primary">
                {user?.displayName?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors w-full"
          >
            <LogOut className="h-4 w-4" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur-xl flex items-center justify-between px-4 shrink-0 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-muted-foreground hover:text-foreground">
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden md:block" />
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
