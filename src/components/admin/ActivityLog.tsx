import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface LogEntry {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  action: string;
  details: string;
  created_at: string;
}

export function ActivityLog() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    setLogs((data as LogEntry[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 15000);
    return () => clearInterval(interval);
  }, []);

  const getActionColor = (action: string) => {
    if (action.includes('sign')) return 'text-green-500';
    if (action.includes('login') || action.includes('Login')) return 'text-blue-500';
    if (action.includes('message') || action.includes('chat')) return 'text-primary';
    if (action.includes('image') || action.includes('generate')) return 'text-purple-500';
    if (action.includes('companion') || action.includes('character')) return 'text-accent';
    return 'text-admin-primary';
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-admin-primary" />
          <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
          <span className="text-xs text-muted-foreground">(auto-refreshes every 15s)</span>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading}>
          <RefreshCw className={`mr-1 h-3 w-3 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      <div className="bg-card border border-border rounded-2xl divide-y divide-border max-h-[500px] overflow-y-auto">
        {logs.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-12">No activity logged yet</p>
        )}
        {logs.map(log => (
          <div key={log.id} className="p-4 flex items-start gap-3 hover:bg-secondary/50 transition-colors">
            <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${getActionColor(log.action).replace('text-', 'bg-')}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">
                <span className="font-medium">{log.user_name || log.user_email}</span>
                <span className="text-muted-foreground"> — </span>
                <span className={getActionColor(log.action)}>{log.action}</span>
              </p>
              {log.details && <p className="text-xs text-muted-foreground mt-0.5">{log.details}</p>}
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(log.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
