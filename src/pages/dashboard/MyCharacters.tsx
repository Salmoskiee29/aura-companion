import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { UserCircle, Sparkles, MessageCircle, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface UserCharacter {
  id: string;
  name: string;
  description: string;
  personality_prompt: string;
  tone: string;
  avatar_url: string | null;
  created_at: string;
}

export default function MyCharacters() {
  const { user } = useAuth();
  const [characters, setCharacters] = useState<UserCharacter[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchCharacters = async () => {
      const { data, error } = await supabase
        .from('user_characters' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setCharacters(data as unknown as UserCharacter[]);
      if (error) console.error('Fetch characters error:', error);
      setLoading(false);
    };
    fetchCharacters();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this character?')) return;
    setDeleting(id);
    try {
      const { error } = await supabase
        .from('user_characters' as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
      setCharacters(prev => prev.filter(c => c.id !== id));
      toast.success('Character deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-5xl mx-auto">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden">
              <Skeleton className="aspect-[3/4] w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              My <span className="text-gradient-primary">Characters</span>
            </h1>
            <p className="text-muted-foreground">Your AI companions. Chat, edit, or create new ones.</p>
          </div>
          <Link to="/dashboard/create-character">
            <Button className="btn-premium text-primary-foreground">
              <Sparkles className="mr-2 h-4 w-4" />
              Create New
            </Button>
          </Link>
        </div>

        {characters.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <UserCircle className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground mb-3">No Characters Yet</h2>
            <p className="text-muted-foreground mb-6">Create your first AI companion to get started.</p>
            <Link to="/dashboard/create-character">
              <Button className="btn-premium text-primary-foreground">
                <Sparkles className="mr-2 h-4 w-4" />
                Create Character
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {characters.map((char, i) => (
              <motion.div
                key={char.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl overflow-hidden border border-border bg-card glow-card group"
              >
                {/* Avatar */}
                <div className="relative aspect-[3/4] bg-secondary">
                  {char.avatar_url ? (
                    <img src={char.avatar_url} alt={char.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <UserCircle className="h-20 w-20 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-80" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-lg font-semibold text-foreground drop-shadow-lg">{char.name}</h3>
                    <p className="text-sm text-foreground/70">{char.tone}</p>
                  </div>
                </div>

                {/* Info + Actions */}
                <div className="p-4 space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">{char.description || char.personality_prompt}</p>
                  <div className="flex items-center gap-2">
                    <Link to={`/chat/user-${char.id}`} className="flex-1">
                      <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                        <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
                        Chat
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-border text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(char.id)}
                      disabled={deleting === char.id}
                    >
                      {deleting === char.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
