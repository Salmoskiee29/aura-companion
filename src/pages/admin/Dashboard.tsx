import { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, MessageSquare, DollarSign, Activity,
  LayoutDashboard, UserCog, Bot, CreditCard,
  MessageCircle, LogOut, Plus, Search,
  Sun, Moon, RefreshCw, Shield,
  BarChart3, Settings as SettingsIcon, FileText, Menu, X,
} from 'lucide-react';
import logoImg from '@/assets/yourmatch-logo.png';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AdminAnalytics = lazy(() => import('./Analytics'));
import { ModelManagement } from '@/components/admin/ModelManagement';
import { ContentManagement } from '@/components/admin/ContentManagement';
import { SubscriptionManagement } from '@/components/admin/SubscriptionManagement';
import { UserManagement } from '@/components/admin/UserManagement';
import { ActivityLog } from '@/components/admin/ActivityLog';
import { AdminLogs } from '@/components/admin/AdminLogs';
import { PlatformStats } from '@/components/admin/PlatformStats';

type AdminTab = 'dashboard' | 'analytics' | 'models' | 'conversations' | 'users' | 'subscriptions' | 'activity' | 'admin-logs' | 'settings';

const sidebarItems = [
  { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'analytics' as const, label: 'Analytics', icon: BarChart3 },
  { id: 'users' as const, label: 'Users', icon: UserCog },
  { id: 'subscriptions' as const, label: 'Subscriptions', icon: CreditCard },
  { id: 'models' as const, label: 'Models / Content', icon: Bot },
  { id: 'conversations' as const, label: 'Conversations', icon: MessageCircle },
  { id: 'activity' as const, label: 'Activity Log', icon: Activity },
  { id: 'admin-logs' as const, label: 'Admin Logs', icon: Shield },
  { id: 'settings' as const, label: 'Settings', icon: SettingsIcon },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Create account form
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'user' | 'admin'>('user');
  const isDeveloper = user?.role === 'developer';
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const handleCreateAccount = async () => {
    if (!newEmail || !newPassword) return;
    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: { email: newEmail, password: newPassword, role: newRole },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      // Log admin action
      await supabase.from('admin_logs').insert({
        admin_id: user?.id || '',
        admin_email: user?.email || '',
        action: `Created ${newRole} account`,
        target_user_email: newEmail,
      });
      toast.success(`${newRole} account created for ${newEmail}`);
      setNewEmail('');
      setNewPassword('');
      setShowCreateForm(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create account');
    } finally {
      setCreating(false);
    }
  };

  const tabTitles: Record<AdminTab, string> = {
    dashboard: 'Dashboard',
    analytics: 'Analytics Dashboard',
    models: 'Model Management',
    conversations: 'Conversations',
    users: 'User Management',
    subscriptions: 'Subscriptions',
    activity: 'Activity Log',
    'admin-logs': 'Admin Logs',
    settings: 'Settings',
  };

  return (
    <div className="flex h-screen bg-background">
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden" onClick={() => setMobileSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col transition-transform duration-300 md:translate-x-0 md:static md:z-auto ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={logoImg} alt="YourMatch" className="h-6 w-6 rounded" />
              <span className="font-display font-bold text-foreground">YourMatch</span>
            </div>
            <button onClick={() => setMobileSidebarOpen(false)} className="md:hidden text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{user?.email}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeTab === item.id
                  ? 'bg-admin-primary/10 text-admin-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-border space-y-1">
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </Button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <LogOut className="h-4 w-4" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto flex flex-col min-w-0">
        <header className="h-14 border-b border-border bg-background/80 backdrop-blur-xl flex items-center justify-between px-4 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileSidebarOpen(true)} className="md:hidden text-muted-foreground hover:text-foreground">
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-xs font-bold tracking-widest text-admin-primary uppercase">Admin Panel</span>
          </div>
        </header>

        <div className="p-6 md:p-8 flex-1">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-display font-bold text-foreground">{tabTitles[activeTab]}</h1>
          </div>

          {/* Create Account Form */}
          {showCreateForm && activeTab === 'users' && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 font-sans">Create Account</h3>
              <div className="grid sm:grid-cols-4 gap-3">
                <input type="email" placeholder="Email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-admin-primary/40" />
                <input type="password" placeholder="Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-admin-primary/40" />
                <select value={newRole} onChange={e => setNewRole(e.target.value as 'user' | 'admin')} className="bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-admin-primary/40">
                  <option value="user">User</option>
                  {isDeveloper && <option value="admin">Admin</option>}
                </select>
                <Button onClick={handleCreateAccount} disabled={creating} className="bg-admin-primary hover:bg-admin-primary/90 text-admin-primary-foreground">
                  {creating ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <PlatformStats />
              <ActivityLog />
            </div>
          )}

          {/* Analytics */}
          {activeTab === 'analytics' && (
            <Suspense fallback={<div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-admin-primary border-t-transparent rounded-full animate-spin" /></div>}>
              <AdminAnalytics />
            </Suspense>
          )}

          {/* Users */}
          {activeTab === 'users' && (
            <UserManagement onCreateClick={() => setShowCreateForm(!showCreateForm)} isDeveloper={isDeveloper} />
          )}

          {/* Subscriptions */}
          {activeTab === 'subscriptions' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <SubscriptionManagement />
            </motion.div>
          )}

          {/* Models */}
          {activeTab === 'models' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <ModelManagement />
            </motion.div>
          )}

          {/* Activity Log */}
          {activeTab === 'activity' && <ActivityLog />}

          {/* Admin Logs */}
          {activeTab === 'admin-logs' && <AdminLogs />}

          {/* Placeholder tabs */}
          {(activeTab === 'conversations' || activeTab === 'settings') && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="bg-card border border-border rounded-2xl p-12 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {activeTab === 'conversations' && 'Conversation Monitor'}
                  {activeTab === 'settings' && 'Platform Settings'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {activeTab === 'conversations' && 'View all conversations.'}
                  {activeTab === 'settings' && 'Configure platform settings.'}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
