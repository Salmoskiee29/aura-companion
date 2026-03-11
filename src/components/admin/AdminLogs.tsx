import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface AdminLogEntry {
  id: string;
  admin_id: string;
  admin_email: string;
  action: string;
  target_user_id: string | null;
  target_user_email: string;
  details: string;
  created_at: string;
}

export function AdminLogs() {
  const [logs, setLogs] = useState<AdminLogEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('admin_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    setLogs((data as AdminLogEntry[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-admin-primary" />
          <h3 className="text-lg font-semibold text-foreground">Admin Action History</h3>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading}>
          <RefreshCw className={`mr-1 h-3 w-3 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs text-muted-foreground font-medium p-4">Admin</th>
              <th className="text-left text-xs text-muted-foreground font-medium p-4">Action</th>
              <th className="text-left text-xs text-muted-foreground font-medium p-4">Target</th>
              <th className="text-left text-xs text-muted-foreground font-medium p-4">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                <td className="p-4 text-sm text-foreground">{log.admin_email}</td>
                <td className="p-4">
                  <span className="text-sm font-medium text-admin-primary">{log.action}</span>
                </td>
                <td className="p-4 text-sm text-muted-foreground">{log.target_user_email || '—'}</td>
                <td className="p-4 text-sm text-muted-foreground">{new Date(log.created_at).toLocaleString()}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-muted-foreground text-sm">No admin actions logged yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
