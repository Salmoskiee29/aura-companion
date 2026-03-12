import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Pencil, Trash2, X, Instagram, Eye, EyeOff, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ModelRow {
  id: string;
  name: string;
  age: number;
  nationality: string;
  personality: string;
  occupation: string;
  traits: string[];
  avatar: string;
  online: boolean;
  instagram_link: string;
  status: string;
  languages: string[];
  hobbies: string[];
  relationship_style: string;
  conversation_speed: string;
  emoji_usage: string;
  message_length: string;
  system_prompt: string;
  is_featured: boolean;
}

const PERSONALITY_TAGS = ['Friendly', 'Shy', 'Romantic', 'Bold', 'Playful', 'Mysterious', 'Confident', 'Sweet', 'Intelligent', 'Funny', 'Calm', 'Flirty', 'Supportive', 'Dominant'];

const PERSONALITY_TYPES = [
  { value: 'sweet', label: 'Sweet Girlfriend' },
  { value: 'flirty', label: 'Flirty Girlfriend' },
  { value: 'dominant', label: 'Dominant Girlfriend' },
  { value: 'shy', label: 'Shy Girlfriend' },
  { value: 'supportive', label: 'Supportive Companion' },
  { value: 'playful', label: 'Playful Partner' },
];

const DEFAULT_MOODS = ['Happy', 'Romantic', 'Playful', 'Mysterious', 'Confident', 'Caring'];

const emptyForm = {
  name: '',
  age: 22,
  nationality: '',
  personality: '',
  occupation: '',
  traits: [] as string[],
  instagram_link: '',
  status: 'active',
  online: false,
  is_featured: false,
  languages: [] as string[],
  hobbies: [] as string[],
  relationship_style: '',
  conversation_speed: 'normal',
  emoji_usage: 'medium',
  message_length: 'medium',
  system_prompt: '',
};

export const ModelManagement = () => {
  const [models, setModels] = useState<ModelRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'hidden'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchModels = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('companion_models')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) toast.error(error.message);
    else setModels((data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchModels(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview(null);
    setShowForm(true);
  };

  const openEdit = (m: ModelRow) => {
    setEditingId(m.id);
    setForm({
      name: m.name,
      age: m.age,
      nationality: m.nationality,
      personality: m.personality,
      occupation: m.occupation,
      traits: m.traits || [],
      instagram_link: m.instagram_link || '',
      status: m.status || 'active',
      online: m.online,
      is_featured: (m as any).is_featured || false,
      languages: m.languages || [],
      hobbies: m.hobbies || [],
      relationship_style: m.relationship_style || '',
      conversation_speed: m.conversation_speed || 'normal',
      emoji_usage: m.emoji_usage || 'medium',
      message_length: m.message_length || 'medium',
      system_prompt: m.system_prompt || '',
    });
    setImageFile(null);
    setImagePreview(m.avatar || null);
    setShowForm(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadAvatar = async (file: File): Promise<string> => {
    const ext = file.name.split('.').pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from('model-avatars').upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from('model-avatars').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Model name is required'); return; }
    if (!editingId && !imageFile && !imagePreview) { toast.error('Profile image is required'); return; }
    setSaving(true);
    try {
      let avatarUrl = editingId ? models.find(m => m.id === editingId)?.avatar || '' : '';
      if (imageFile) avatarUrl = await uploadAvatar(imageFile);

      const payload = {
        name: form.name,
        age: form.age,
        nationality: form.nationality,
        personality: form.personality,
        occupation: form.occupation,
        traits: form.traits,
        instagram_link: form.instagram_link,
        status: form.status,
        online: form.online,
        is_featured: form.is_featured,
        avatar: avatarUrl,
        languages: form.languages,
        hobbies: form.hobbies,
        relationship_style: form.relationship_style,
        conversation_speed: form.conversation_speed,
        emoji_usage: form.emoji_usage,
        message_length: form.message_length,
        system_prompt: form.system_prompt,
      };

      if (editingId) {
        const { error } = await supabase.from('companion_models').update(payload).eq('id', editingId);
        if (error) throw error;
        toast.success('Model updated');
      } else {
        const { error } = await supabase.from('companion_models').insert(payload);
        if (error) throw error;
        toast.success('Model created');
      }
      setShowForm(false);
      fetchModels();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete model "${name}"? This cannot be undone.`)) return;
    const { error } = await supabase.from('companion_models').delete().eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success('Model deleted'); fetchModels(); }
  };

  const toggleTag = (tag: string) => {
    setForm(f => ({
      ...f,
      traits: f.traits.includes(tag) ? f.traits.filter(t => t !== tag) : [...f.traits, tag],
    }));
  };

  const filtered = models.filter(m => {
    if (filterStatus !== 'all' && m.status !== filterStatus) return false;
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search models..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-secondary border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-admin-primary/40"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as any)}
          className="bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-admin-primary/40"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="hidden">Hidden</option>
        </select>
        <Button onClick={openCreate} className="bg-admin-primary hover:bg-admin-primary/90 text-admin-primary-foreground">
          <Plus className="mr-1 h-4 w-4" /> Add Model
        </Button>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center bg-background/80 backdrop-blur-sm overflow-y-auto py-8 px-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
              <h3 className="text-xl font-semibold text-foreground mb-6 font-sans">
                {editingId ? 'Edit Model' : 'Add New Model'}
              </h3>

              <div className="space-y-5">
                {/* Image Upload */}
                <div className="flex items-center gap-4">
                  <div
                    className="w-24 h-24 rounded-2xl border-2 border-dashed border-border bg-secondary flex items-center justify-center overflow-hidden cursor-pointer hover:border-admin-primary/50 transition-colors"
                    onClick={() => fileRef.current?.click()}
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
                        <span className="text-[10px] text-muted-foreground">Upload</span>
                      </div>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">Profile Image</p>
                    <p>Click to upload. JPG, PNG recommended.</p>
                  </div>
                </div>

                {/* Required Fields */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Model Name *</label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-admin-primary/40" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Age</label>
                    <input type="number" value={form.age} onChange={e => setForm(f => ({ ...f, age: parseInt(e.target.value) || 18 }))} className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-admin-primary/40" />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Short Description / Bio</label>
                  <textarea value={form.personality} onChange={e => setForm(f => ({ ...f, personality: e.target.value }))} rows={2} className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-admin-primary/40 resize-none" />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Instagram Link</label>
                    <input value={form.instagram_link} onChange={e => setForm(f => ({ ...f, instagram_link: e.target.value }))} placeholder="https://instagram.com/..." className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-admin-primary/40" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Country</label>
                    <input value={form.nationality} onChange={e => setForm(f => ({ ...f, nationality: e.target.value }))} className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-admin-primary/40" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Status</label>
                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-admin-primary/40">
                      <option value="active">Active</option>
                      <option value="hidden">Hidden</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Occupation</label>
                    <input value={form.occupation} onChange={e => setForm(f => ({ ...f, occupation: e.target.value }))} className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-admin-primary/40" />
                  </div>
                </div>

                {/* Personality Tags */}
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Personality Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {PERSONALITY_TAGS.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                          form.traits.includes(tag)
                            ? 'bg-admin-primary/15 text-admin-primary border-admin-primary/30'
                            : 'bg-secondary text-muted-foreground border-border hover:border-admin-primary/30'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chat Availability */}
                <div className="flex items-center gap-3">
                  <label className="text-xs text-muted-foreground">Chat Available (Online)</label>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, online: !f.online }))}
                    className={`w-10 h-6 rounded-full transition-colors relative ${form.online ? 'bg-online' : 'bg-secondary border border-border'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-foreground absolute top-1 transition-transform ${form.online ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </div>

                {/* System Prompt */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">System Prompt (AI personality)</label>
                  <textarea value={form.system_prompt} onChange={e => setForm(f => ({ ...f, system_prompt: e.target.value }))} rows={3} placeholder="Describe how this model should behave in chat..." className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-admin-primary/40 resize-none" />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button onClick={handleSave} disabled={saving} className="bg-admin-primary hover:bg-admin-primary/90 text-admin-primary-foreground">
                    {saving ? 'Saving...' : editingId ? 'Update Model' : 'Create Model'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Models Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-admin-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Models Found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {models.length === 0 ? 'Add your first model to get started.' : 'Try adjusting your search or filter.'}
          </p>
          {models.length === 0 && (
            <Button onClick={openCreate} className="bg-admin-primary hover:bg-admin-primary/90 text-admin-primary-foreground">
              <Plus className="mr-1 h-4 w-4" /> Add First Model
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(m => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-admin-primary/30 transition-all"
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
                {/* Status badge */}
                <div className="absolute top-2 left-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    m.status === 'active' ? 'bg-online/20 text-online' : 'bg-muted text-muted-foreground'
                  }`}>
                    {m.status === 'active' ? 'Active' : 'Hidden'}
                  </span>
                </div>
                {m.online && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full glass-card">
                    <div className="w-1.5 h-1.5 rounded-full bg-online animate-pulse" />
                    <span className="text-[10px] text-foreground">Online</span>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h4 className="text-sm font-semibold text-foreground drop-shadow-lg">{m.name}, {m.age}</h4>
                  <p className="text-xs text-foreground/70">{m.nationality}</p>
                </div>
              </div>
              <div className="p-3 space-y-2">
                <p className="text-xs text-muted-foreground line-clamp-2">{m.personality}</p>
                <div className="flex flex-wrap gap-1">
                  {(m.traits || []).slice(0, 3).map(t => (
                    <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-admin-primary/10 text-admin-primary">{t}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-border">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(m)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(m.id, m.name)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    {m.instagram_link && (
                      <a href={m.instagram_link} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                        <Instagram className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                  <button
                    onClick={async () => {
                      const newStatus = m.status === 'active' ? 'hidden' : 'active';
                      await supabase.from('companion_models').update({ status: newStatus }).eq('id', m.id);
                      fetchModels();
                    }}
                    className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                    title={m.status === 'active' ? 'Hide model' : 'Activate model'}
                  >
                    {m.status === 'active' ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
