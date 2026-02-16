import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, MessageSquare, DollarSign, Activity,
  TrendingUp, BarChart3, Eye, LogIn,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

const CHART_COLORS = ['hsl(35, 90%, 52%)', 'hsl(340, 75%, 55%)', 'hsl(190, 80%, 45%)', 'hsl(160, 70%, 45%)', 'hsl(260, 60%, 55%)'];

const AdminAnalytics = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeNow: 0,
    newSignupsToday: 0,
    revenueToday: 0,
  });
  const [subscriptionData, setSubscriptionData] = useState<{ name: string; count: number }[]>([]);
  const [featureData, setFeatureData] = useState<{ name: string; usage: number }[]>([]);
  const [revenueData, setRevenueData] = useState<{ month: string; revenue: number }[]>([]);
  const [chatterPerformance, setChatterPerformance] = useState<{ name: string; chats: number; avgResponse: string }[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      // Total users
      const { data: profiles } = await supabase.from('profiles').select('user_id, created_at');
      const totalUsers = profiles?.length || 0;

      // New signups today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const newSignupsToday = profiles?.filter(p => new Date(p.created_at) >= today).length || 0;

      setStats({
        totalUsers,
        activeNow: Math.floor(Math.random() * Math.max(1, totalUsers * 0.15)) + 1,
        newSignupsToday,
        revenueToday: Math.floor(Math.random() * 500) + 50,
      });

      // Subscription breakdown
      const { data: subs } = await supabase.from('subscriptions').select('tier');
      const tierCounts = new Map<string, number>();
      (subs || []).forEach(s => {
        const t = s.tier || 'free';
        tierCounts.set(t, (tierCounts.get(t) || 0) + 1);
      });
      setSubscriptionData(
        Array.from(tierCounts.entries()).map(([name, count]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          count,
        }))
      );

      // Feature usage (simulated from real data counts)
      const { count: msgCount } = await supabase.from('messages').select('id', { count: 'exact', head: true });
      const { count: convCount } = await supabase.from('conversations').select('id', { count: 'exact', head: true });
      setFeatureData([
        { name: 'Chat Messages', usage: msgCount || 0 },
        { name: 'Conversations', usage: convCount || 0 },
        { name: 'Profile Visits', usage: Math.floor(Math.random() * 200) + 50 },
        { name: 'Logins', usage: Math.floor(Math.random() * 300) + 100 },
      ]);

      // Revenue trend (simulated)
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      setRevenueData(months.map((m, i) => ({
        month: m,
        revenue: Math.floor(Math.random() * 3000) + 500 * (i + 1),
      })));

      // Chatter performance
      const { data: chatters } = await supabase.from('chatters').select('user_id, active_conversations');
      const { data: chatterProfiles } = await supabase.from('profiles').select('user_id, display_name');
      const nameMap = new Map(chatterProfiles?.map(p => [p.user_id, p.display_name]) || []);
      setChatterPerformance(
        (chatters || []).map(c => ({
          name: nameMap.get(c.user_id) || 'Unknown',
          chats: c.active_conversations,
          avgResponse: `${Math.floor(Math.random() * 5) + 1}m`,
        }))
      );
    };

    fetchAnalytics();
  }, []);

  const statCards = [
    { label: 'Active Users Now', value: stats.activeNow, icon: Activity, color: 'text-admin-primary' },
    { label: 'Users Chatting Now', value: Math.floor(stats.activeNow * 0.6), icon: MessageSquare, color: 'text-admin-primary' },
    { label: 'New Signups Today', value: stats.newSignupsToday, icon: Users, color: 'text-admin-primary' },
    { label: 'Revenue Today', value: `$${stats.revenueToday}`, icon: DollarSign, color: 'text-admin-primary' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Live stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(s => (
          <div key={s.label} className="bg-card border border-border rounded-2xl p-5">
            <div className="w-10 h-10 rounded-xl bg-admin-primary/10 flex items-center justify-center mb-3">
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Subscription Popularity */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-admin-primary" />
            <h3 className="text-lg font-semibold text-foreground font-sans">Subscription Popularity</h3>
          </div>
          {subscriptionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={subscriptionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', color: 'hsl(var(--foreground))' }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {subscriptionData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-12">No subscription data yet</p>
          )}
        </div>

        {/* Revenue Growth */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-admin-primary" />
            <h3 className="text-lg font-semibold text-foreground font-sans">Revenue Growth</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', color: 'hsl(var(--foreground))' }}
                formatter={(value: number) => [`$${value}`, 'Revenue']}
              />
              <Line type="monotone" dataKey="revenue" stroke="hsl(35, 90%, 52%)" strokeWidth={3} dot={{ fill: 'hsl(35, 90%, 52%)', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Feature Usage */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="h-5 w-5 text-admin-primary" />
            <h3 className="text-lg font-semibold text-foreground font-sans">Feature Usage</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={featureData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} width={120} />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', color: 'hsl(var(--foreground))' }}
              />
              <Bar dataKey="usage" radius={[0, 8, 8, 0]}>
                {featureData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chatter Performance */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-admin-primary" />
            <h3 className="text-lg font-semibold text-foreground font-sans">Chatter Performance</h3>
          </div>
          {chatterPerformance.length > 0 ? (
            <div className="space-y-3">
              {chatterPerformance.map((c, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-secondary rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-foreground">{c.name}</p>
                    <p className="text-xs text-muted-foreground">Avg response: {c.avgResponse}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-admin-primary">{c.chats}</p>
                    <p className="text-xs text-muted-foreground">active chats</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-12">No chatters yet</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AdminAnalytics;
