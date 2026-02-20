import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Shield, Activity, MessageCircle, DollarSign, Diamond,
  AlertTriangle,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface ChatterRow {
  email?: string;
  status: string;
  active_conversations: number;
  max_capacity: number;
}

interface Props {
  userCount: number;
  chatterCount: number;
  onlineChatters: number;
  overloadedChatters: ChatterRow[];
}

export function AdminDashboardTab({ userCount, chatterCount, onlineChatters, overloadedChatters }: Props) {
  const [liveChats, setLiveChats] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiveData = async () => {
      // Count conversations created in the last 24 hours as "live"
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from('conversations')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', since);
      
      setLiveChats(count ?? 0);
      setLoading(false);
    };
    fetchLiveData();

    // Auto-refresh every 30s
    const interval = setInterval(fetchLiveData, 30000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { label: 'Active Users', value: userCount, icon: Users, color: 'text-admin-primary' },
    { label: 'Online Chatters', value: onlineChatters, icon: Activity, color: 'text-[hsl(var(--online))]' },
    { label: 'Live Chats (24h)', value: liveChats, icon: MessageCircle, color: 'text-admin-primary' },
    { label: 'Total Chatters', value: chatterCount, icon: Shield, color: 'text-admin-primary' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-2xl p-5">
            <div className="w-10 h-10 rounded-xl bg-admin-primary/10 flex items-center justify-center mb-3">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            {loading && stat.value === null ? (
              <Skeleton className="h-8 w-12 mb-1" />
            ) : (
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            )}
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Overloaded chatters warning */}
      {overloadedChatters.length > 0 && (
        <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h3 className="font-semibold text-foreground">Overloaded Chatters</h3>
          </div>
          <div className="space-y-2">
            {overloadedChatters.map((c, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{c.email || 'Unknown'}</span>
                <span className="text-destructive font-medium">{c.active_conversations}/{c.max_capacity} capacity</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
