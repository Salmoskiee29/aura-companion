import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, MessageSquare, DollarSign, Activity,
  LayoutDashboard, UserCog, Bot, CreditCard,
  MessageCircle, LogOut, Plus, Search,
  Heart, Sun, Moon, Shield, RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type AdminTab = 'dashboard' | 'models' | 'conversations' | 'users' | 'chatters';

const sidebarItems = [
  { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users' as const, label: 'Users', icon: UserCog },
  { id: 'chatters' as const, label: 'Chatters', icon: Shield },
  { id: 'models' as const, label: 'Models', icon: Bot },
  { id: 'conversations' as const, label: 'Conversations', icon: MessageCircle },
];

interface UserRow {
  user_id: string;
  email: string;
  display_name: string;
  role: string;
}

interface ChatterRow {
  id: string;
  user_id: string;
  status: string;
  max_capacity: number;
  active_conversations: number;
  email?: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [users, setUsers] = useState<UserRow[]>([]);
  const [chattersList, setChattersList] = useState<ChatterRow[]>([]);
  const [loading, setLoading] = useState(false);

  // Create account form
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'chatter' | 'admin'>('chatter');
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Reassignment
  const [reassignUserId, setReassignUserId] = useState<string | null>(null);
  const [reassignChatterId, setReassignChatterId] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    const { data: profiles } = await supabase.from('profiles').select('user_id, email, display_name');
    const { data: roles } = await supabase.from('user_roles').select('user_id, role');
    const roleMap = new Map(roles?.map(r => [r.user_id, r.role]) || []);
    const combined = (profiles || []).map(p => ({
      ...p,
      role: (roleMap.get(p.user_id) as string) || 'user',
    }));
    setUsers(combined);
    setLoading(false);
  };

  const fetchChatters = async () => {
    const { data: chattersData } = await supabase.from('chatters').select('*');
    const { data: profiles } = await supabase.from('profiles').select('user_id, email');
    const emailMap = new Map(profiles?.map(p => [p.user_id, p.email]) || []);
    setChattersList((chattersData || []).map(c => ({ ...c, email: emailMap.get(c.user_id) || '' })));
  };

  useEffect(() => {
    fetchUsers();
    fetchChatters();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const handleCreateAccount = async () => {
    if (!newEmail || !newPassword) return;
    setCreating(true);
    try {
      // Use edge function to create account server-side
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: { email: newEmail, password: newPassword, role: newRole },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success(`${newRole} account created for ${newEmail}`);
      setNewEmail('');
      setNewPassword('');
      setShowCreateForm(false);
      fetchUsers();
      if (newRole === 'chatter') fetchChatters();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create account');
    } finally {
      setCreating(false);
    }
  };

  const handleReassign = async (userId: string, chatterId: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ assigned_chatter_id: chatterId })
        .eq('user_id', userId);
      if (error) throw error;
      toast.success('User reassigned successfully');
      setReassignUserId(null);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const userCount = users.filter(u => u.role === 'user').length;
  const chatterCount = chattersList.length;

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col shrink-0 hidden md:flex">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            <span className="font-display font-bold text-foreground">Admin Panel</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{user?.email}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeTab === item.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-border space-y-1">
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
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">
                {activeTab === 'dashboard' && 'Dashboard'}
                {activeTab === 'models' && 'Model Management'}
                {activeTab === 'conversations' && 'Conversations'}
                {activeTab === 'users' && 'User Management'}
                {activeTab === 'chatters' && 'Chatter Management'}
              </h1>
            </div>
            {(activeTab === 'users' || activeTab === 'chatters') && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { fetchUsers(); fetchChatters(); }}>
                  <RefreshCw className="mr-1 h-3 w-3" /> Refresh
                </Button>
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => setShowCreateForm(!showCreateForm)}>
                  <Plus className="mr-1 h-3 w-3" /> Create Account
                </Button>
              </div>
            )}
          </div>

          {/* Create Account Form */}
          {showCreateForm && (activeTab === 'users' || activeTab === 'chatters') && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 font-sans">Create Staff Account</h3>
              <div className="grid sm:grid-cols-4 gap-3">
                <input
                  type="email"
                  placeholder="Email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className="bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value as 'chatter' | 'admin')}
                  className="bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="chatter">Chatter</option>
                  <option value="admin">Admin</option>
                </select>
                <Button onClick={handleCreateAccount} disabled={creating} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  {creating ? 'Creating...' : 'Create'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">New accounts are created server-side. The user will receive a confirmation email.</p>
            </motion.div>
          )}

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Total Users', value: userCount, icon: Users, color: 'text-primary' },
                  { label: 'Active Chatters', value: chatterCount, icon: Shield, color: 'text-primary' },
                  { label: 'Online Chatters', value: chattersList.filter(c => c.status === 'online').length, icon: Activity, color: 'text-online' },
                  { label: 'Total Conversations', value: '—', icon: MessageCircle, color: 'text-primary' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-card border border-border rounded-2xl p-5">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-xs text-muted-foreground font-medium p-4">Email</th>
                      <th className="text-left text-xs text-muted-foreground font-medium p-4">Name</th>
                      <th className="text-left text-xs text-muted-foreground font-medium p-4">Role</th>
                      <th className="text-left text-xs text-muted-foreground font-medium p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.user_id} className="border-b border-border last:border-0">
                        <td className="p-4 text-sm text-foreground">{u.email}</td>
                        <td className="p-4 text-sm text-foreground">{u.display_name}</td>
                        <td className="p-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            u.role === 'admin' ? 'bg-destructive/10 text-destructive' :
                            u.role === 'chatter' ? 'bg-accent/10 text-accent' :
                            'bg-primary/10 text-primary'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4">
                          {u.role === 'user' && (
                            reassignUserId === u.user_id ? (
                              <div className="flex gap-2 items-center">
                                <select
                                  value={reassignChatterId}
                                  onChange={e => setReassignChatterId(e.target.value)}
                                  className="bg-secondary border border-border rounded-lg px-2 py-1 text-xs text-foreground"
                                >
                                  <option value="">Select chatter</option>
                                  {chattersList.map(c => (
                                    <option key={c.id} value={c.user_id}>{c.email} ({c.status})</option>
                                  ))}
                                </select>
                                <Button size="sm" variant="outline" className="text-xs" onClick={() => handleReassign(u.user_id, reassignChatterId)}>
                                  Assign
                                </Button>
                                <Button size="sm" variant="ghost" className="text-xs" onClick={() => setReassignUserId(null)}>
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <Button size="sm" variant="ghost" className="text-xs text-muted-foreground" onClick={() => setReassignUserId(u.user_id)}>
                                Reassign
                              </Button>
                            )
                          )}
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr><td colSpan={4} className="p-8 text-center text-muted-foreground text-sm">No users found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Chatters Tab */}
          {activeTab === 'chatters' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-xs text-muted-foreground font-medium p-4">Email</th>
                      <th className="text-left text-xs text-muted-foreground font-medium p-4">Status</th>
                      <th className="text-left text-xs text-muted-foreground font-medium p-4">Active / Max</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chattersList.map((c) => (
                      <tr key={c.id} className="border-b border-border last:border-0">
                        <td className="p-4 text-sm text-foreground">{c.email}</td>
                        <td className="p-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${c.status === 'online' ? 'bg-online/10 text-online' : 'bg-muted text-muted-foreground'}`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-foreground">{c.active_conversations} / {c.max_capacity}</td>
                      </tr>
                    ))}
                    {chattersList.length === 0 && (
                      <tr><td colSpan={3} className="p-8 text-center text-muted-foreground text-sm">No chatters yet. Create one above.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Models / Conversations placeholders */}
          {(activeTab === 'models' || activeTab === 'conversations') && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="bg-card border border-border rounded-2xl p-12 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {activeTab === 'models' ? 'Model Management' : 'Conversation Monitor'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {activeTab === 'models' ? 'Manage AI companion models from here.' : 'View all live conversations.'}
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
