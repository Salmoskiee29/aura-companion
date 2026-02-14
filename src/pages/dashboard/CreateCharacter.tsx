import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const characterOptions = {
  hairColor: ['Black', 'Brown', 'Blonde', 'Red', 'Auburn', 'Platinum', 'Silver'],
  hairstyle: ['Long Straight', 'Long Wavy', 'Short Bob', 'Curly', 'Ponytail', 'Braids', 'Updo'],
  eyeColor: ['Brown', 'Blue', 'Green', 'Hazel', 'Gray', 'Amber'],
  ethnicity: ['Caucasian', 'Asian', 'Latina', 'African', 'Middle Eastern', 'Mixed'],
  ageRange: ['20-25', '25-30', '30-35', '35-40'],
  bodyType: ['Slim', 'Athletic', 'Curvy', 'Petite', 'Average'],
  clothing: ['Casual', 'Elegant', 'Business', 'Sporty', 'Bohemian', 'Streetwear'],
  mood: ['Smiling', 'Serious', 'Playful', 'Confident', 'Mysterious'],
  background: ['Indoor', 'Outdoor', 'Studio', 'Lifestyle', 'Urban', 'Nature'],
};

const optionLabels: Record<string, string> = {
  hairColor: 'Hair Color',
  hairstyle: 'Hairstyle',
  eyeColor: 'Eye Color',
  ethnicity: 'Ethnicity',
  ageRange: 'Age Range',
  bodyType: 'Body Type',
  clothing: 'Clothing Style',
  mood: 'Mood',
  background: 'Background',
};

export default function CreateCharacter() {
  const navigate = useNavigate();
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const selectOption = (category: string, value: string) => {
    setSelections(prev => ({ ...prev, [category]: value }));
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setGeneratedImage(null);
    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedImage('/placeholder.svg');
      toast.info('Connect Lovable Cloud to enable AI image generation.');
    }, 2000);
  };

  const handleAccept = () => {
    // Mock save — stores in localStorage for now
    const character = {
      id: crypto.randomUUID(),
      imageUrl: generatedImage,
      createdAt: new Date().toISOString(),
      isActive: true,
      selections,
    };
    localStorage.setItem('lumiere_active_character', JSON.stringify(character));
    toast.success('Character saved! Redirecting...');
    setTimeout(() => navigate('/dashboard/my-character'), 800);
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">
          Create Your <span className="text-gradient-primary">Character</span>
        </h1>
        <p className="text-muted-foreground">Customize and generate a realistic AI companion.</p>
      </motion.div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
        {Object.entries(characterOptions).map(([key, options]) => (
          <div key={key}>
            <label className="text-sm text-muted-foreground mb-2 block">{optionLabels[key]}</label>
            <div className="flex flex-wrap gap-2">
              {options.map(option => (
                <button
                  key={option}
                  onClick={() => selectOption(key, option)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selections[key] === option
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ))}

        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-base mt-4"
        >
          {isGenerating ? (
            <>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="mr-2">
                <Sparkles className="h-5 w-5" />
              </motion.div>
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Generate Character
            </>
          )}
        </Button>
      </div>

      {generatedImage && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 bg-card border border-border rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 font-sans">Generated Character</h3>
          <div className="aspect-[3/4] max-w-sm mx-auto rounded-xl overflow-hidden border border-border bg-secondary mb-6">
            <img src={generatedImage} alt="Generated character" className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleGenerate} className="flex-1 border-border text-foreground">
              Regenerate
            </Button>
            <Button onClick={handleAccept} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
              Accept & Save
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
