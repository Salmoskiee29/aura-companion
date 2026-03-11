import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search, RefreshCw, Plus, Trash2, Ban, CheckCircle, Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface UserRow {
  user_id: string;
  email: string;
  display_name: string;
  role: string;
  status: string;
  tier: string;
  created_at: string;
}

interface Props {
  onCreateClick: () => void;
  isDeveloper: boolean;
}

export function UserManagement({ onCreateClick, isDeveloper }: Props) {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    const [profilesRes, rolesRes, subsRes] = await Promise.all([
      supabase.from('profiles').select('user_id, email, display_name, created_at, status'),
      supabase.from('user_roles').select('user_id, role'),
      supabase.from('subscriptions').select('user_id, tier'),
    ]);
    const roleMap = new Map(rolesRes.data?.map(r => [r.user_id, r.role]) || []);
    const tierMap = new Map(subsRes.data?.map(s => [s.user_id, s.tier]) || []);
    const combined: UserRow[] = (profilesRes.data || []).map(p => ({
      user_id: p.user_id,
      email: p.email,
      display_name: p.display_name,
      role: (roleMap.get(p.user_id) as string) || 'user',
      status: p.status || 'active',
      tier: (tierMap.get(p.user_id) as string) || 'free',
      created_at: p.created_at,
    }));
    setUsers(combined);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const logAdminAction = async (action: string, targetUser: UserRow) => {
    await supabase.from('admin_logs').insert({
      admin_id: currentUser?.id || '',
      admin_email: currentUser?.email || '',
      action,
      target_user_id: targetUser.user_id,
      target_user_email: targetUser.email,
    });
  };

  const handleBlock = async (u: UserRow) => {
    const newStatus = u.status === 'blocked' ? 'active' : 'blocked';
    const { error } = await supabase.from('profiles').update({ status: newStatus }).eq('user_id', u.user_id);
    if (error) { toast.error('Failed to update user status'); return; }
    await logAdminAction(newStatus === 'blocked' ? 'Blocked user' : 'Unblocked user', u);
    toast.success(`User ${newStatus === 'blocked' ? 'blocked' : 'unblocked'}`);
    fetchUsers();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    // Delete related data, then profile
    await Promise.all([
      supabase.from('messages').delete().eq('sender_id', deleteTarget.user_id),
      supabase.from('user_characters').delete().eq('user_id', deleteTarget.user_id),
      supabase.from('gem_transactions').delete().eq('user_id', deleteTarget.user_id),
      supabase.from('gem_wallets').delete().eq('user_id', deleteTarget.user_id),
      supabase.from('subscriptions').delete().eq('user_id', deleteTarget.user_id),
      supabase.from('user_roles').delete().eq('user_id', deleteTarget.user_id),
    ]);
    // Delete conversations and their messages
    const { data: convos } = await supabase.from('conversations').select('id').eq('user_id', deleteTarget.user_id);
    if (convos?.length) {
      const ids = convos.map(c => c.id);
      await supabase.from('messages').delete().in('conversation_id', ids);
      await supabase.from('conversations').delete().eq('user_id', deleteTarget.user_id);
    }
    await supabase.from('profiles').delete().eq('user_id', deleteTarget.user_id);
    await logAdminAction('Deleted user', deleteTarget);
    toast.success(`User ${deleteTarget.email} deleted`);
    setDeleteTarget(null);
    fetchUsers();
  };

  const filtered = users.filter(u =>
    u.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-secondary border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-admin-primary/40"
          />
        </div>
        <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading}>
          <RefreshCw className={`mr-1 h-3 w-3 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
        {isDeveloper && (
          <Button size="sm" className="bg-admin-primary hover:bg-admin-primary/90 text-admin-primary-foreground" onClick={onCreateClick}>
            <Plus className="mr-1 h-3 w-3" /> Create Administrator
          </Button>
        )}
      </div>

      {/* User Table */}
      <div className="bg-card border border-border rounded-2xl overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs text-muted-foreground font-medium p-4">User</th>
              <th className="text-left text-xs text-muted-foreground font-medium p-4">Email</th>
              <th className="text-left text-xs text-muted-foreground font-medium p-4">Role</th>
              <th className="text-left text-xs text-muted-foreground font-medium p-4">Tier</th>
              <th className="text-left text-xs text-muted-foreground font-medium p-4">Status</th>
              <th className="text-left text-xs text-muted-foreground font-medium p-4">Joined</th>
              <th className="text-right text-xs text-muted-foreground font-medium p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.user_id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                <td className="p-4 text-sm text-foreground font-medium">{u.display_name}</td>
                <td className="p-4 text-sm text-muted-foreground">{u.email}</td>
                <td className="p-4">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    u.role === 'developer' ? 'bg-accent/10 text-accent' :
                    u.role === 'admin' ? 'bg-admin-primary/10 text-admin-primary' :
                    'bg-primary/10 text-primary'
                  }`}>
                    {u.role === 'developer' ? 'Master Admin' : u.role}
                  </span>
                </td>
                <td className="p-4">
                  <span className="text-xs px-2 py-1 rounded-full bg-secondary text-foreground capitalize">{u.tier}</span>
                </td>
                <td className="p-4">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    u.status === 'blocked' ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-600'
                  }`}>
                    {u.status}
                  </span>
                </td>
                <td className="p-4 text-sm text-muted-foreground">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td className="p-4 text-right">
                  {u.role !== 'developer' && (
                    <div className="flex gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleBlock(u)}
                        title={u.status === 'blocked' ? 'Unblock' : 'Block'}
                      >
                        {u.status === 'blocked' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Ban className="h-4 w-4 text-orange-500" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(u)}
                        title="Delete user"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-muted-foreground text-sm">No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.email}</strong>? This action cannot be undone. All user data including profile, companions, messages, and generated images will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
