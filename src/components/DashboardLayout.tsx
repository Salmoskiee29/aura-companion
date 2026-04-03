import { Link, useLocation, Outlet } from 'react-router-dom';
import { Home, Users, UserCircle, Sparkles, MessageCircle, CreditCard, Settings, LogOut, Menu, X, Heart, Compass, Sun, Moon, Crown } from 'lucide-react';
import { NotificationDropdown } from '@/components/NotificationDropdown';
import logoImg from '@/assets/yourmatch-logo.png';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useSubscriptionTier } from '@/hooks/useSubscriptionTier';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const mainNav = [
  { to: '/dashboard', icon: Home, label: 'Home', end: true },
  { to: '/dashboard/chats', icon: MessageCircle, label: 'Chat' },
];

const exploreNav = [
  { to: '/dashboard/models', icon: Compass, label: 'Explore Characters' },
  { to: '/dashboard/my-characters', icon: Heart, label: 'My Characters' },
];

const createNav = [
  { to: '/dashboard/create-character', icon: Sparkles, label: 'Create Character' },
];

const bottomNav = [
  { to: '/dashboard/billing', icon: CreditCard, label: 'Pricing' },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { isVip } = useSubscriptionTier();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path: string, end?: boolean) => {
    if (end) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const NavItem = ({ item }: { item: { to: string; icon: any; label: string; end?: boolean } }) => (
    <Link
      to={item.to}
      onClick={() => setSidebarOpen(false)}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
        isActive(item.to, item.end)
          ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_-5px_hsl(var(--primary)/0.3)]"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
      )}
    >
      <item.icon className="h-5 w-5 shrink-0" />
      <span>{item.label}</span>
    </Link>
  );

  return (
    <div className="min-h-screen bg-background flex relative">
      {/* Subtle background glow for dashboard */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] rounded-full blur-[200px] opacity-[0.03]" style={{ background: 'hsl(325 80% 58%)' }} />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[180px] opacity-[0.03]" style={{ background: 'hsl(280 65% 55%)' }} />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-60 glass-card-strong border-r border-border/30 flex flex-col transition-transform duration-300 md:translate-x-0 md:static md:z-auto",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border/30 shrink-0">
          <Link to="/dashboard" className="flex items-center gap-2">
            <img src={logoImg} alt="YourMatch" className="h-7 w-7 rounded" />
            <span className="text-lg font-bold text-foreground" style={{ fontFamily: "'Orbitron', sans-serif" }}>YourMatch</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav sections */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          <div className="space-y-1">
            {mainNav.map(item => <NavItem key={item.to} item={item} />)}
          </div>

          <div>
            <p className="px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Explore</p>
            <div className="space-y-1">
              {exploreNav.map(item => <NavItem key={item.to} item={item} />)}
            </div>
          </div>

          <div>
            <p className="px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Create</p>
            <div className="space-y-1">
              {createNav.map(item => <NavItem key={item.to} item={item} />)}
            </div>
          </div>

          {/* VIP-gated Premium section */}
          {isVip && (
            <div>
              <p className="px-3 text-[11px] font-semibold text-primary uppercase tracking-wider mb-2 flex items-center gap-1">
                <Crown className="h-3 w-3" /> Premium
              </p>
              <div className="space-y-1">
                <NavItem item={{ to: '/dashboard/premium', icon: Crown, label: 'Exclusive Content' }} />
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-border/30 space-y-1">
            {bottomNav.map(item => <NavItem key={item.to} item={item} />)}
          </div>
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-border/30 shrink-0 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <span className="text-sm font-semibold text-primary">
                {user?.displayName?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.displayName}</p>
              <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
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
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Top bar */}
        <header className="h-14 border-b border-border/30 glass-card flex items-center justify-between px-4 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden text-muted-foreground hover:text-foreground">
              <Menu className="h-5 w-5" />
            </button>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary">
              <Bell className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-primary"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Link to="/dashboard/billing">
              <button className="ml-2 px-4 py-1.5 rounded-full bg-muted text-muted-foreground text-xs font-semibold border border-border cursor-default">
                FREE ACCESS
              </button>
            </Link>
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
