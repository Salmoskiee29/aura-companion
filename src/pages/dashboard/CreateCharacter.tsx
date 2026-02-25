import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const toneOptions = ['Friendly', 'Romantic', 'Playful', 'Mysterious', 'Confident', 'Caring', 'Witty', 'Bold'];

export default function CreateCharacter() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [personalityPrompt, setPersonalityPrompt] = useState('');
  const [tone, setTone] = useState('Friendly');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast.error('Please enter a character description first.');
      return;
    }
    setIsGenerating(true);
    setGeneratedImages([]);
    setSelectedImage(null);

    try {
      const prompt = `${description}. Personality: ${tone}. ${name ? `Name: ${name}.` : ''}`;
      
      // Generate 2 images in parallel
      const results = await Promise.allSettled([
        supabase.functions.invoke('generate-image', { body: { prompt } }),
        supabase.functions.invoke('generate-image', { body: { prompt: prompt + ' Different angle and expression.' } }),
      ]);

      const images: string[] = [];
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value.data?.imageUrl) {
          images.push(result.value.data.imageUrl);
        }
      }

      if (images.length === 0) {
        toast.error('Image generation failed. Try a different description.');
      } else {
        setGeneratedImages(images);
        setSelectedImage(images[0]);
        toast.success(`${images.length} image(s) generated!`);
      }
    } catch (err: any) {
      console.error('Generate error:', err);
      toast.error(err.message || 'Failed to generate images');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!user || !name.trim()) {
      toast.error('Please enter a character name.');
      return;
    }
    if (!personalityPrompt.trim()) {
      toast.error('Please enter a personality prompt for your character.');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.from('user_characters' as any).insert({
        user_id: user.id,
        name: name.trim(),
        description: description.trim(),
        personality_prompt: personalityPrompt.trim(),
        tone,
        avatar_url: selectedImage || null,
      });

      if (error) throw error;
      toast.success('Character saved! 🎉');
      navigate('/dashboard/my-characters');
    } catch (err: any) {
      console.error('Save error:', err);
      toast.error(err.message || 'Failed to save character');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">
          Create Your <span className="text-gradient-primary">Character</span>
        </h1>
        <p className="text-muted-foreground">Design a unique AI companion with a custom personality and AI-generated avatar.</p>
      </motion.div>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Character Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Luna, Alex, Mika..."
              className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Character Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your character's appearance, style, and vibe... (e.g. A cheerful 25-year-old with long dark hair, warm brown eyes, casual outfit, friendly smile)"
              rows={3}
              className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Personality Prompt *</label>
            <textarea
              value={personalityPrompt}
              onChange={(e) => setPersonalityPrompt(e.target.value)}
              placeholder="How should your character behave in conversations? (e.g. You are Luna, a warm and caring companion who loves deep conversations about life, art, and dreams. You're empathetic, curious, and always supportive.)"
              rows={4}
              className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Tone / Style</label>
            <div className="flex flex-wrap gap-2">
              {toneOptions.map(t => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    tone === t
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Image Generation */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 font-sans flex items-center gap-2">
            <ImagePlus className="h-5 w-5 text-primary" />
            AI Avatar Generation
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Generate an AI portrait based on your character description. You can regenerate until you're happy.
          </p>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !description.trim()}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-base"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating Images...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generate Character Images
              </>
            )}
          </Button>

          {/* Generated Images Grid */}
          {generatedImages.length > 0 && (
            <div className="mt-6">
              <p className="text-sm text-muted-foreground mb-3">Select your favorite:</p>
              <div className="grid grid-cols-2 gap-4">
                {generatedImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === img ? 'border-primary glow-primary' : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <img src={img} alt={`Generated ${i + 1}`} className="w-full h-full object-cover" />
                    {selectedImage === img && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Sparkles className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <Button
                variant="outline"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full mt-4 border-border text-foreground"
              >
                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Regenerate
              </Button>
            </div>
          )}
        </div>

        {/* Save */}
        <Button
          onClick={handleSave}
          disabled={isSaving || !name.trim() || !personalityPrompt.trim()}
          className="w-full btn-premium text-primary-foreground py-6 text-base"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Saving Character...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Save Character
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
