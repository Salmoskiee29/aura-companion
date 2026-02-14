import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, MessageSquare, DollarSign, Activity,
  LayoutDashboard, UserCog, Bot, CreditCard,
  MessageCircle, Shield, LogOut, Plus, Search,
  Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockModels } from '@/data/models';

type AdminTab = 'dashboard' | 'models' | 'conversations' | 'users' | 'billing';

const stats = [
  { label: 'Total Users', value: '12,847', icon: Users, change: '+12%' },
  { label: 'Active Subscribers', value: '3,291', icon: CreditCard, change: '+8%' },
  { label: 'Monthly Revenue', value: '$48,230', icon: DollarSign, change: '+23%' },
  { label: 'Active Chats Now', value: '847', icon: Activity, change: '+5%' },
];

const sidebarItems = [
  { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'models' as const, label: 'Models', icon: Bot },
  { id: 'conversations' as const, label: 'Conversations', icon: MessageCircle },
  { id: 'users' as const, label: 'Users', icon: UserCog },
  { id: 'billing' as const, label: 'Billing', icon: CreditCard },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col shrink-0 hidden md:flex">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            <span className="font-display font-bold text-foreground">Admin</span>
          </div>
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
        <div className="p-4 border-t border-border">
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <LogOut className="h-4 w-4" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">
                {activeTab === 'dashboard' && 'Dashboard'}
                {activeTab === 'models' && 'Model Management'}
                {activeTab === 'conversations' && 'Conversations'}
                {activeTab === 'users' && 'User Management'}
                {activeTab === 'billing' && 'Billing & Revenue'}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {activeTab === 'dashboard' && 'Overview of your platform performance'}
                {activeTab === 'models' && 'Create and manage AI companion models'}
              </p>
            </div>
            {activeTab === 'models' && (
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="mr-2 h-4 w-4" /> Add Model
              </Button>
            )}
          </div>

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((stat) => (
                  <div key={stat.label} className="bg-card border border-border rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <stat.icon className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-xs font-medium text-emerald-400">{stat.change}</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Recent activity */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {[
                    { text: 'New user signed up: john@example.com', time: '2m ago' },
                    { text: 'Subscription upgraded: Premium → VIP', time: '5m ago' },
                    { text: 'New chatter assigned to Sophia', time: '12m ago' },
                    { text: 'Model "Emma" updated by admin', time: '1h ago' },
                    { text: 'Monthly revenue milestone: $48K', time: '3h ago' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <span className="text-sm text-foreground">{item.text}</span>
                      <span className="text-xs text-muted-foreground shrink-0 ml-4">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Models Tab */}
          {activeTab === 'models' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockModels.map((model) => (
                  <div key={model.id} className="bg-card border border-border rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-4 p-4">
                      <img src={model.avatar} alt={model.name} className="w-14 h-14 rounded-xl object-cover" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground">{model.name}, {model.age}</h4>
                        <p className="text-xs text-muted-foreground">{model.nationality} • {model.occupation}</p>
                      </div>
                      <div className={`w-2.5 h-2.5 rounded-full ${model.online ? 'bg-emerald-400' : 'bg-muted-foreground'}`} />
                    </div>
                    <div className="px-4 pb-4">
                      <div className="flex flex-wrap gap-1 mb-3">
                        {model.traits.map((t) => (
                          <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{t}</span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1 border-border text-foreground hover:bg-secondary">Edit</Button>
                        <Button size="sm" variant="outline" className="border-border text-destructive hover:bg-destructive/10">Delete</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-border">
                  <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      placeholder="Search users..."
                      className="w-full bg-secondary border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-xs text-muted-foreground font-medium p-4">User</th>
                      <th className="text-left text-xs text-muted-foreground font-medium p-4">Role</th>
                      <th className="text-left text-xs text-muted-foreground font-medium p-4">Status</th>
                      <th className="text-left text-xs text-muted-foreground font-medium p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { email: 'john@example.com', role: 'user', status: 'active' },
                      { email: 'sarah@example.com', role: 'user', status: 'active' },
                      { email: 'mike@example.com', role: 'chatter', status: 'active' },
                      { email: 'emma@example.com', role: 'user', status: 'inactive' },
                    ].map((user, i) => (
                      <tr key={i} className="border-b border-border last:border-0">
                        <td className="p-4 text-sm text-foreground">{user.email}</td>
                        <td className="p-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            user.role === 'chatter' ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`text-xs ${user.status === 'active' ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-destructive text-xs">
                            <Shield className="mr-1 h-3 w-3" /> Ban
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Conversations & Billing placeholders */}
          {(activeTab === 'conversations' || activeTab === 'billing') && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="bg-card border border-border rounded-2xl p-12 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {activeTab === 'conversations' ? 'Conversation Monitor' : 'Revenue Dashboard'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Connect Lovable Cloud to view live {activeTab} data.
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
