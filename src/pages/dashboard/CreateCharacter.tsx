import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, ImagePlus, Shuffle, RotateCcw, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { CharacterSelections, defaultSelections } from '@/components/character-creator/types';
import { categories } from '@/components/character-creator/optionData';
import { buildPositivePrompt, getNegativePrompt } from '@/components/character-creator/promptBuilder';
import OptionSection from '@/components/character-creator/OptionSection';
import RealismSlider from '@/components/character-creator/RealismSlider';

const toneOptions = ['Friendly', 'Romantic', 'Playful', 'Mysterious', 'Confident', 'Caring', 'Witty', 'Bold'];

function randomize(): CharacterSelections {
  const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
  const cat = (id: string) => categories.find((c) => c.id === id)!;
  const pickField = (catId: string, key: string) => {
    const field = cat(catId).options.find((f) => f.key === key)!;
    return pick(field.choices!);
  };

  return {
    gender: pickField('appearance', 'gender'),
    ageRange: pickField('appearance', 'ageRange'),
    ethnicity: pickField('appearance', 'ethnicity'),
    skinTone: pickField('appearance', 'skinTone'),
    hairColor: pickField('hair', 'hairColor'),
    hairLength: pickField('hair', 'hairLength'),
    hairStyle: pickField('hair', 'hairStyle'),
    bodyType: pickField('body', 'bodyType'),
    height: pickField('body', 'height'),
    clothingStyle: pickField('outfit', 'clothingStyle'),
    clothingColor: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
    accessories: [pickField('outfit', 'accessories')],
    facialExpression: pickField('expression', 'facialExpression'),
    eyeDirection: pickField('expression', 'eyeDirection'),
    location: pickField('environment', 'location'),
    timeOfDay: pickField('environment', 'timeOfDay'),
    lighting: pickField('environment', 'lighting'),
    shotType: pickField('camera', 'shotType'),
    angle: pickField('camera', 'angle'),
    lens: pickField('camera', 'lens'),
    realismLevel: pick(['standard', 'high', 'ultra'] as const),
  };
}

export default function CreateCharacter() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [personalityPrompt, setPersonalityPrompt] = useState('');
  const [tone, setTone] = useState('Friendly');
  const [selections, setSelections] = useState<CharacterSelections>(defaultSelections);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const positivePrompt = useMemo(() => buildPositivePrompt(selections), [selections]);
  const negativePrompt = getNegativePrompt();

  const handleChange = (key: keyof CharacterSelections, value: any) => {
    setSelections((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedImages([]);
    setSelectedImage(null);

    try {
      const results = await Promise.allSettled([
        supabase.functions.invoke('generate-image', { body: { prompt: positivePrompt, negativePrompt } }),
        supabase.functions.invoke('generate-image', { body: { prompt: positivePrompt + ', different angle and expression', negativePrompt } }),
      ]);

      const images: string[] = [];
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value.data?.imageUrl) {
          images.push(result.value.data.imageUrl);
        }
      }

      if (images.length === 0) {
        toast.error('Image generation failed. Try adjusting your selections.');
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
      const { error } = await supabase.from('user_characters').insert({
        user_id: user.id,
        name: name.trim(),
        description: positivePrompt,
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
        <p className="text-muted-foreground">Customize every detail and generate an AI portrait — no typing needed.</p>
      </motion.div>

      <div className="space-y-4">
        {/* Name & Personality */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wide">Character Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Luna, Alex, Mika..."
              className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wide">Personality Prompt *</label>
            <textarea
              value={personalityPrompt}
              onChange={(e) => setPersonalityPrompt(e.target.value)}
              placeholder="How should your character behave in conversations? (e.g. You are Luna, a warm companion who loves deep conversations...)"
              rows={3}
              className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block uppercase tracking-wide">Tone / Style</label>
            <div className="flex flex-wrap gap-2">
              {toneOptions.map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    tone === t ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Utility Buttons */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setSelections(randomize())} className="flex-1 border-border text-foreground">
            <Shuffle className="mr-2 h-4 w-4" /> Randomize
          </Button>
          <Button variant="outline" size="sm" onClick={() => setSelections(defaultSelections)} className="flex-1 border-border text-foreground">
            <RotateCcw className="mr-2 h-4 w-4" /> Reset
          </Button>
        </div>

        {/* Customization Sections */}
        {categories.map((cat) => (
          <OptionSection key={cat.id} category={cat} selections={selections} onChange={handleChange} />
        ))}

        {/* Realism */}
        <RealismSlider value={selections.realismLevel} onChange={(v) => handleChange('realismLevel', v)} />

        {/* Advanced View */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/30 transition-colors"
          >
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">🔍 Advanced View</span>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          </button>
          {showAdvanced && (
            <div className="px-5 pb-5 space-y-3">
              <div>
                <span className="text-xs font-medium text-muted-foreground block mb-1">Positive Prompt</span>
                <p className="text-xs text-foreground bg-secondary rounded-xl p-3 leading-relaxed break-words">{positivePrompt}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-muted-foreground block mb-1">Negative Prompt</span>
                <p className="text-xs text-foreground bg-secondary rounded-xl p-3 leading-relaxed break-words">{negativePrompt}</p>
              </div>
            </div>
          )}
        </div>

        {/* Generate */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <ImagePlus className="h-5 w-5 text-primary" />
            AI Avatar Generation
          </h3>
          <Button onClick={handleGenerate} disabled={isGenerating} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-base">
            {isGenerating ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating Images...</>
            ) : (
              <><Sparkles className="mr-2 h-5 w-5" /> Generate Character Images</>
            )}
          </Button>

          {generatedImages.length > 0 && (
            <div className="mt-5">
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
              <Button variant="outline" onClick={handleGenerate} disabled={isGenerating} className="w-full mt-4 border-border text-foreground">
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
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving Character...</>
          ) : (
            <><Sparkles className="mr-2 h-5 w-5" /> Save Character</>
          )}
        </Button>
      </div>
    </div>
  );
}
