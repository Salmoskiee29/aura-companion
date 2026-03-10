import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { RefreshCw, Search } from 'lucide-react';
import { toast } from 'sonner';

interface SubRow {
  id: string;
  user_id: string;
  tier: string;
  status: string;
  plan: string;
  free_messages_used: number;
  daily_human_replies_used: number;
  daily_human_replies_limit: number;
  current_period_end: string | null;
  email?: string;
  display_name?: string;
}

export function SubscriptionManagement() {
  const [subs, setSubs] = useState<SubRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [search, setSearch] = useState('');

  const fetchSubs = async () => {
    setLoading(true);
    const { data: subData } = await supabase.from('subscriptions').select('*');
    const { data: profiles } = await supabase.from('profiles').select('user_id, email, display_name');
    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

    const combined = (subData || []).map(s => ({
      ...s,
      email: profileMap.get(s.user_id)?.email || '',
      display_name: profileMap.get(s.user_id)?.display_name || '',
    }));
    setSubs(combined);
    setLoading(false);
  };

  useEffect(() => { fetchSubs(); }, []);

  const handleChangeTier = async (userId: string, newTier: string) => {
    const isFreeTier = newTier === 'free';
    await supabase.from('subscriptions').update({
      tier: newTier,
      plan: newTier,
      status: isFreeTier ? 'inactive' : 'active',
    }).eq('user_id', userId);
    toast.success(`Tier updated to ${newTier}`);
    fetchSubs();
  };

  const handleResetMessages = async (userId: string) => {
    await supabase.from('subscriptions').update({
      free_messages_used: 0,
      daily_human_replies_used: 0,
    }).eq('user_id', userId);
    toast.success('Message limits reset');
    fetchSubs();
  };

  const filtered = subs.filter(s => {
    if (filter === 'active' && s.status !== 'active') return false;
    if (filter === 'inactive' && s.status === 'active') return false;
    if (search) {
      const q = search.toLowerCase();
      return s.email?.toLowerCase().includes(q) || s.display_name?.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by email or name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-secondary border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div className="flex gap-1">
          {(['all', 'active', 'inactive'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                filter === f ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={fetchSubs} disabled={loading}>
          <RefreshCw className={`mr-1 h-3 w-3 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs text-muted-foreground font-medium p-4">User</th>
              <th className="text-left text-xs text-muted-foreground font-medium p-4">Tier</th>
              <th className="text-left text-xs text-muted-foreground font-medium p-4">Status</th>
              <th className="text-left text-xs text-muted-foreground font-medium p-4">Messages Used</th>
              <th className="text-left text-xs text-muted-foreground font-medium p-4">Expiry</th>
              <th className="text-left text-xs text-muted-foreground font-medium p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} className="border-b border-border last:border-0">
                <td className="p-4">
                  <div className="text-foreground font-medium">{s.display_name || '—'}</div>
                  <div className="text-xs text-muted-foreground">{s.email}</div>
                </td>
                <td className="p-4">
                  <select
                    value={s.tier}
                    onChange={e => handleChangeTier(s.user_id, e.target.value)}
                    className="bg-secondary border border-border rounded-lg px-2 py-1 text-xs text-foreground focus:outline-none"
                  >
                    <option value="free">Free</option>
                    <option value="basic">Basic</option>
                    <option value="premium">Premium</option>
                    <option value="vip">VIP</option>
                  </select>
                </td>
                <td className="p-4">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    s.status === 'active' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                  }`}>
                    {s.status}
                  </span>
                </td>
                <td className="p-4 text-foreground">
                  {s.tier === 'free'
                    ? `${s.free_messages_used}/20`
                    : `${s.daily_human_replies_used}/${s.daily_human_replies_limit}`
                  }
                </td>
                <td className="p-4 text-xs text-muted-foreground">
                  {s.current_period_end ? new Date(s.current_period_end).toLocaleDateString() : '—'}
                </td>
                <td className="p-4">
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => handleResetMessages(s.user_id)}>
                    Reset Limits
                  </Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No subscriptions found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
