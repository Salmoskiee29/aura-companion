import { useState, useEffect } from 'react';
import { FileText, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Props {
  userId: string;
}

export function UserNotesPanel({ userId }: Props) {
  const { user } = useAuth();
  const [notes, setNotes] = useState({
    personality_summary: '',
    preferred_content_type: '',
    spending_level: 'low',
    highlights: '',
    notes: '',
  });
  const [noteId, setNoteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const fetch = async () => {
      const { data } = await supabase
        .from('user_notes')
        .select('*')
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle();
      if (data) {
        setNoteId(data.id);
        setNotes({
          personality_summary: data.personality_summary || '',
          preferred_content_type: data.preferred_content_type || '',
          spending_level: data.spending_level || 'low',
          highlights: data.highlights || '',
          notes: data.notes || '',
        });
      }
      setLoaded(true);
    };
    fetch();
  }, [userId]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      if (noteId) {
        await supabase.from('user_notes').update(notes).eq('id', noteId);
      } else {
        const { data } = await supabase.from('user_notes').insert({
          user_id: userId,
          author_id: user.id,
          ...notes,
        }).select('id').single();
        if (data) setNoteId(data.id);
      }
      toast.success('Notes saved');
    } catch {
      toast.error('Failed to save notes');
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) return null;

  return (
    <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <FileText className="h-4 w-4 text-chatter-primary" />
        <h3 className="text-sm font-semibold text-foreground">Internal Notes</h3>
      </div>

      <div>
        <label className="text-xs text-muted-foreground block mb-1">Personality Summary</label>
        <textarea
          value={notes.personality_summary}
          onChange={e => setNotes(n => ({ ...n, personality_summary: e.target.value }))}
          className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground resize-none h-16 focus:outline-none focus:ring-1 focus:ring-chatter-primary/40"
          placeholder="Shy, opens up over time..."
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Content Preference</label>
          <input
            value={notes.preferred_content_type}
            onChange={e => setNotes(n => ({ ...n, preferred_content_type: e.target.value }))}
            className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-chatter-primary/40"
            placeholder="Romantic, casual..."
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Spending Level</label>
          <select
            value={notes.spending_level}
            onChange={e => setNotes(n => ({ ...n, spending_level: e.target.value }))}
            className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-chatter-primary/40"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="whale">Whale 🐳</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs text-muted-foreground block mb-1">Highlights</label>
        <textarea
          value={notes.highlights}
          onChange={e => setNotes(n => ({ ...n, highlights: e.target.value }))}
          className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground resize-none h-14 focus:outline-none focus:ring-1 focus:ring-chatter-primary/40"
          placeholder="Past interesting moments..."
        />
      </div>

      <div>
        <label className="text-xs text-muted-foreground block mb-1">Free Notes</label>
        <textarea
          value={notes.notes}
          onChange={e => setNotes(n => ({ ...n, notes: e.target.value }))}
          className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground resize-none h-14 focus:outline-none focus:ring-1 focus:ring-chatter-primary/40"
          placeholder="Anything else..."
        />
      </div>

      <Button onClick={handleSave} disabled={saving} size="sm" className="w-full bg-chatter-primary hover:bg-chatter-primary/90 text-chatter-primary-foreground">
        <Save className="mr-1 h-3 w-3" /> {saving ? 'Saving...' : 'Save Notes'}
      </Button>
    </div>
  );
}
