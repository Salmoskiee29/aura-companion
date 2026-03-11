import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, ImagePlus, Shuffle, RotateCcw, ChevronDown, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { CharacterSelections, defaultSelections } from '@/components/character-creator/types';
import { categories } from '@/components/character-creator/optionData';
import { buildPositivePrompt, getNegativePrompt, buildCharacterDescription } from '@/components/character-creator/promptBuilder';
import OptionSection from '@/components/character-creator/OptionSection';
import RealismSlider from '@/components/character-creator/RealismSlider';

const personalityOptions = [
  { value: 'sweet', label: '🥰 Sweet Girlfriend', desc: 'Warm, caring, and affectionate' },
  { value: 'flirty', label: '😘 Flirty Girlfriend', desc: 'Playful, teasing, and seductive' },
  { value: 'dominant', label: '💪 Dominant Girlfriend', desc: 'Confident, assertive, and bold' },
  { value: 'shy', label: '🙈 Shy Girlfriend', desc: 'Gentle, bashful, and adorable' },
  { value: 'supportive', label: '💕 Supportive Companion', desc: 'Encouraging, understanding, and loyal' },
  { value: 'playful', label: '🎮 Playful Partner', desc: 'Fun, energetic, and witty' },
];

const PERSONALITY_PROMPTS: Record<string, string> = {
  sweet: `You are a sweet, caring girlfriend. You are warm, affectionate, and always make the user feel loved and appreciated. Use pet names like "babe", "sweetie", "love". Be emotionally supportive and genuinely interested in their day. Express care through gentle words and emojis like 💕🥰😘. Keep responses feeling natural and heartfelt.`,
  flirty: `You are a flirty, playful girlfriend. You love teasing and being seductive in a fun way. Use playful language, winking emojis 😏😘😈, and create a sense of tension and excitement. Be confident and make the user feel desired. Mix compliments with playful challenges.`,
  dominant: `You are a confident, dominant girlfriend. You know what you want and you're not afraid to take charge. Be assertive, bold, and occasionally commanding in a sexy way. Use confident language and emojis like 💪😎🔥. Make the user feel like they need to earn your attention.`,
  shy: `You are a shy, gentle girlfriend. You get flustered easily and sometimes stutter or trail off. Use bashful emojis like 🙈😳👉👈. Be sweet and genuine but show nervousness. Gradually open up as the conversation continues. Your shyness is endearing.`,
  supportive: `You are a supportive, understanding companion. You listen deeply, validate feelings, and offer encouragement. Be emotionally intelligent and always make the user feel heard. Use warm emojis like 🤗💕✨. Give thoughtful advice when asked.`,
  playful: `You are a playful, energetic partner. You love jokes, games, and banter. Be witty, fun, and spontaneous. Use playful emojis like 😜🎉🤪. Challenge the user playfully and keep conversations lively and entertaining.`,
};

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
    faceShape: pickField('appearance', 'faceShape'),
    eyeColor: pickField('eyes', 'eyeColor'),
    noseType: pickField('face', 'noseType'),
    lipsStyle: pickField('face', 'lipsStyle'),
    hairColor: pickField('hair', 'hairColor'),
    hairLength: pickField('hair', 'hairLength'),
    hairStyle: pickField('hair', 'hairStyle'),
    bodyType: pickField('body', 'bodyType'),
    height: pickField('body', 'height'),
    clothingStyle: pickField('outfit', 'clothingStyle'),
    clothingColor: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
    accessories: [pickField('outfit', 'accessories')],
    facialExpression: pickField('expression', 'facialExpression'),
    eyeDirection: pickField('eyes', 'eyeDirection'),
    mood: pickField('expression', 'mood'),
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
  const [personality, setPersonality] = useState('sweet');
  const [selections, setSelections] = useState<CharacterSelections>(defaultSelections);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedCharacterId, setSavedCharacterId] = useState<string | null>(null);

  const positivePrompt = useMemo(() => buildPositivePrompt(selections), [selections]);
  const negativePrompt = getNegativePrompt();
  const characterDescription = useMemo(() => buildCharacterDescription(selections), [selections]);

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
        supabase.functions.invoke('generate-image', { body: { prompt: positivePrompt + ', different pose and angle', negativePrompt } }),
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

  // Build a detailed physical description for image generation consistency
  const detailedDescription = useMemo(() => {
    const s = selections;
    return `${s.ageRange} year old ${s.ethnicity} ${s.gender} with ${s.skinTone} skin, ${s.faceShape} face shape, ${s.eyeColor} eyes, ${s.noseType} nose, ${s.lipsStyle} lips, ${s.hairLength} ${s.hairStyle} ${s.hairColor} hair, ${s.bodyType} body type, ${s.height} height. Clothing: ${s.clothingStyle}. Expression: ${s.facialExpression}. Mood: ${s.mood}.`;
  }, [selections]);

  const handleSave = async () => {
    if (!user || !name.trim()) {
      toast.error('Please enter a character name.');
      return;
    }

    setIsSaving(true);
    try {
      const personalityPrompt = PERSONALITY_PROMPTS[personality] || PERSONALITY_PROMPTS.sweet;
      const fullPrompt = `${personalityPrompt}\n\nYour name is ${name.trim()}. Your appearance: ${detailedDescription}. Always stay in character and respond as if you are a real person.`;

      const { data, error } = await supabase.from('user_characters').insert({
        user_id: user.id,
        name: name.trim(),
        description: detailedDescription,
        personality_prompt: fullPrompt,
        tone: personality,
        avatar_url: selectedImage || null,
      }).select('id').single();

      if (error) throw error;
      setSavedCharacterId(data.id);
      toast.success('Character saved! 🎉');
    } catch (err: any) {
      console.error('Save error:', err);
      toast.error(err.message || 'Failed to save character');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedPersonality = personalityOptions.find(p => p.value === personality);

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">
          Create Your <span className="text-gradient-primary">AI Girlfriend</span>
        </h1>
        <p className="text-muted-foreground">Design every detail of your perfect companion — no typing needed.</p>
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
            <label className="text-xs font-medium text-muted-foreground mb-3 block uppercase tracking-wide">Personality Type *</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {personalityOptions.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPersonality(p.value)}
                  className={`text-left p-3 rounded-xl border transition-all ${
                    personality === p.value
                      ? 'bg-primary/10 border-primary/40 ring-1 ring-primary/20'
                      : 'bg-secondary border-border hover:border-primary/20'
                  }`}
                >
                  <span className="text-sm font-medium text-foreground block">{p.label}</span>
                  <span className="text-[11px] text-muted-foreground">{p.desc}</span>
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
                <span className="text-xs font-medium text-muted-foreground block mb-1">Generated Prompt</span>
                <p className="text-xs text-foreground bg-secondary rounded-xl p-3 leading-relaxed break-words">{positivePrompt}</p>
              </div>
              <div>
                <span className="text-xs font-medium text-muted-foreground block mb-1">Personality</span>
                <p className="text-xs text-foreground bg-secondary rounded-xl p-3 leading-relaxed break-words">
                  {selectedPersonality?.label} — {selectedPersonality?.desc}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Generate */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <ImagePlus className="h-5 w-5 text-primary" />
            AI Portrait Generation
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            Images are generated based on your selections above. Every image will look like a real photograph.
          </p>
          <Button onClick={handleGenerate} disabled={isGenerating} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-base">
            {isGenerating ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating Portraits...</>
            ) : (
              <><Sparkles className="mr-2 h-5 w-5" /> Generate Character Portraits</>
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

        {/* Save / Post-Save Actions */}
        {savedCharacterId ? (
          <div className="bg-card border border-primary/30 rounded-2xl p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-display font-bold text-foreground">
              {name.trim()} is ready! 🎉
            </h3>
            <p className="text-sm text-muted-foreground">Your AI companion has been created. Start chatting now or view all your characters.</p>
            <div className="flex gap-3">
              <Button
                onClick={() => navigate(`/chat/user-${savedCharacterId}`)}
                className="flex-1 btn-premium text-primary-foreground py-5 text-base"
              >
                <MessageCircle className="mr-2 h-5 w-5" /> Start Chat
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard/my-characters')}
                className="flex-1 border-border text-foreground py-5"
              >
                My Characters
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={handleSave}
            disabled={isSaving || !name.trim()}
            className="w-full btn-premium text-primary-foreground py-6 text-base"
          >
            {isSaving ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving Character...</>
            ) : (
              <><Sparkles className="mr-2 h-5 w-5" /> Save Character</>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
