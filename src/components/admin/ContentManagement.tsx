import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Trash2, X, Upload, Lock, Unlock, Diamond, Film, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ContentRow {
  id: string;
  model_id: string;
  media_url: string;
  preview_url: string | null;
  price: number;
  is_locked: boolean;
  requires_model_subscription: boolean;
  title: string;
  description: string | null;
  media_type: string;
  created_at: string;
}

interface ModelOption {
  id: string;
  name: string;
  avatar: string;
}

export const ContentManagement = () => {
  const [content, setContent] = useState<ContentRow[]>([]);
  const [models, setModels] = useState<ModelOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterModelId, setFilterModelId] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formModelId, setFormModelId] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDiamondPrice, setFormDiamondPrice] = useState('5');
  const [formMediaType, setFormMediaType] = useState<'image' | 'video'>('image');
  const [formRequiresSub, setFormRequiresSub] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const mediaRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    setLoading(true);
    const [contentRes, modelsRes] = await Promise.all([
      supabase.from('premium_content').select('*').order('created_at', { ascending: false }),
      supabase.from('companion_models').select('id, name, avatar').eq('status', 'active').order('name'),
    ]);
    if (contentRes.data) setContent(contentRes.data as ContentRow[]);
    if (modelsRes.data) setModels(modelsRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setFormModelId('');
    setFormTitle('');
    setFormDiamondPrice('5');
    setFormMediaType('image');
    setFormRequiresSub(false);
    setMediaFile(null);
    setMediaPreview(null);
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
    setFormMediaType(file.type.startsWith('video') ? 'video' : 'image');
  };

  const uploadFile = async (file: File, folder: string): Promise<string> => {
    const ext = file.name.split('.').pop();
    const path = `${folder}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from('premium-content').upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from('premium-content').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSave = async () => {
    if (!formModelId) { toast.error('Please select a model'); return; }
    if (!mediaFile) { toast.error('Please upload media'); return; }
    setSaving(true);
    try {
      const mediaUrl = await uploadFile(mediaFile, 'media');

      const { error } = await supabase.from('premium_content').insert({
        model_id: formModelId,
        media_url: mediaUrl,
        preview_url: null, // Auto-blur handled client-side
        price: parseInt(formDiamondPrice) || 5,
        is_locked: true,
        requires_model_subscription: formRequiresSub,
        title: formTitle,
        media_type: formMediaType,
      });
      if (error) throw error;
      toast.success('Content uploaded successfully');
      setShowForm(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this content? This cannot be undone.')) return;
    const { error } = await supabase.from('premium_content').delete().eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success('Content deleted'); fetchData(); }
  };

  const filtered = content.filter(c => {
    if (filterModelId !== 'all' && c.model_id !== filterModelId) return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getModelName = (modelId: string) => models.find(m => m.id === modelId)?.name || 'Unknown';

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search content..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-secondary border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-admin-primary/40"
          />
        </div>
        <select
          value={filterModelId}
          onChange={e => setFilterModelId(e.target.value)}
          className="bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-admin-primary/40"
        >
          <option value="all">All Models</option>
          {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="bg-admin-primary hover:bg-admin-primary/90 text-admin-primary-foreground">
          <Plus className="mr-1 h-4 w-4" /> Upload Content
        </Button>
      </div>

      {/* Upload Form Modal */}
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
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg relative"
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
              <h3 className="text-xl font-semibold text-foreground mb-6">Upload Premium Content</h3>

              <div className="space-y-4">
                {/* Model Selection */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Select Model *</label>
                  <select
                    value={formModelId}
                    onChange={e => setFormModelId(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-admin-primary/40"
                  >
                    <option value="">Choose a model...</option>
                    {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Title (optional)</label>
                  <input
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    placeholder="Content title..."
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-admin-primary/40"
                  />
                </div>

                {/* Media Upload */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Upload Media *</label>
                  <div
                    onClick={() => mediaRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-border rounded-xl bg-secondary flex flex-col items-center justify-center cursor-pointer hover:border-admin-primary/50 transition-colors overflow-hidden"
                  >
                    {mediaPreview ? (
                      formMediaType === 'video' ? (
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <Film className="h-5 w-5 text-admin-primary" />
                          <span>{mediaFile?.name}</span>
                        </div>
                      ) : (
                        <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
                      )
                    ) : (
                      <>
                        <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                        <span className="text-xs text-muted-foreground">Click to upload image or video</span>
                      </>
                    )}
                  </div>
                  <input ref={mediaRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleMediaChange} />
                  <p className="text-[10px] text-muted-foreground mt-1">Blur preview is generated automatically — no need to upload a separate one.</p>
                </div>

                {/* Diamond Price + Options */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Price (💎 Diamonds)</label>
                    <div className="relative">
                      <Diamond className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                      <input
                        type="number"
                        min="1"
                        value={formDiamondPrice}
                        onChange={e => setFormDiamondPrice(e.target.value)}
                        className="w-full bg-secondary border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-admin-primary/40"
                      />
                    </div>
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <button
                        type="button"
                        onClick={() => setFormRequiresSub(!formRequiresSub)}
                        className={`w-10 h-6 rounded-full transition-colors relative ${formRequiresSub ? 'bg-admin-primary' : 'bg-secondary border border-border'}`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-foreground absolute top-1 transition-transform ${formRequiresSub ? 'translate-x-5' : 'translate-x-1'}`} />
                      </button>
                      <span className="text-xs text-muted-foreground">Requires Model Sub</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button onClick={handleSave} disabled={saving} className="bg-admin-primary hover:bg-admin-primary/90 text-admin-primary-foreground">
                    {saving ? 'Uploading...' : 'Upload Content'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-admin-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Content Yet</h3>
          <p className="text-sm text-muted-foreground">Upload premium content for your models.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card border border-border rounded-xl overflow-hidden group"
            >
              <div className="aspect-[3/4] relative overflow-hidden bg-secondary">
                {item.media_type === 'video' ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Film className="h-10 w-10 text-muted-foreground" />
                  </div>
                ) : (
                  <img src={item.media_url} alt={item.title} className="w-full h-full object-cover" />
                )}
                <div className="absolute top-2 left-2 flex gap-1">
                  {item.is_locked ? (
                    <span className="px-2 py-0.5 rounded-full bg-destructive/80 text-destructive-foreground text-[10px] font-bold flex items-center gap-1">
                      <Lock className="h-2.5 w-2.5" /> Locked
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-green-500/80 text-white text-[10px] font-bold flex items-center gap-1">
                      <Unlock className="h-2.5 w-2.5" /> Open
                    </span>
                  )}
                </div>
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="w-7 h-7 rounded-full bg-background/80 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                  <span className="text-[10px] text-foreground bg-background/70 px-2 py-0.5 rounded-full truncate">
                    {getModelName(item.model_id)}
                  </span>
                  <span className="flex items-center gap-0.5 text-[10px] font-bold text-primary bg-background/70 px-2 py-0.5 rounded-full">
                    <Diamond className="h-2.5 w-2.5" />{item.price} 💎
                  </span>
                </div>
              </div>
              {item.title && (
                <div className="p-2">
                  <p className="text-xs text-foreground truncate">{item.title}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
