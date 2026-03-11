import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, MessageSquare, Bot, CreditCard, ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export function PlatformStats() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalMessages: 0,
    totalCharacters: 0,
    activeSubscriptions: 0,
  });

  const fetchStats = async () => {
    const today = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const [usersRes, activeRes, msgsRes, charsRes, subsRes] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('conversations').select('user_id', { count: 'exact', head: true }).gte('created_at', today),
      supabase.from('messages').select('id', { count: 'exact', head: true }),
      supabase.from('user_characters').select('id', { count: 'exact', head: true }),
      supabase.from('subscriptions').select('id', { count: 'exact', head: true }).neq('tier', 'free'),
    ]);
    setStats({
      totalUsers: usersRes.count ?? 0,
      activeUsers: activeRes.count ?? 0,
      totalMessages: msgsRes.count ?? 0,
      totalCharacters: charsRes.count ?? 0,
      activeSubscriptions: subsRes.count ?? 0,
    });
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const cards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users },
    { label: 'Active Users (24h)', value: stats.activeUsers, icon: Users },
    { label: 'Total Messages', value: stats.totalMessages, icon: MessageSquare },
    { label: 'Characters Created', value: stats.totalCharacters, icon: Bot },
    { label: 'Paid Subscriptions', value: stats.activeSubscriptions, icon: CreditCard },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map(c => (
          <div key={c.label} className="bg-card border border-border rounded-2xl p-5">
            <div className="w-10 h-10 rounded-xl bg-admin-primary/10 flex items-center justify-center mb-3">
              <c.icon className="h-5 w-5 text-admin-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{c.value.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
