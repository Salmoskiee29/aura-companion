import { useState } from 'react';
import { Link } from 'react-router-dom';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { motion } from 'framer-motion';
import {
  Heart, User, Palette, Globe, CreditCard, Sparkles, Camera,
  Mail, Lock, Eye, EyeOff, Sun, Moon, ArrowLeft, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

type SettingsTab = 'profile' | 'character' | 'appearance' | 'language' | 'subscription';

const tabs: { id: SettingsTab; icon: typeof User; labelKey: string; descKey: string }[] = [
  { id: 'profile', icon: User, labelKey: 'settings.profile', descKey: 'settings.profileDesc' },
  { id: 'character', icon: Sparkles, labelKey: 'settings.character', descKey: 'settings.characterDesc' },
  { id: 'appearance', icon: Palette, labelKey: 'settings.appearance', descKey: 'settings.appearanceDesc' },
  { id: 'language', icon: Globe, labelKey: 'settings.language', descKey: 'settings.languageDesc' },
  { id: 'subscription', icon: CreditCard, labelKey: 'settings.subscription', descKey: 'settings.subscriptionDesc' },
];

const Settings = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const { theme, setTheme } = useTheme();
  const { t, language, setLanguage, languageNames, availableLanguages } = useLanguage();

  // Profile state
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
        <h1 className="text-3xl font-display font-bold text-foreground mb-8">{t('settings.title')}</h1>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <aside className="md:w-64 shrink-0">
            <div className="bg-card border border-border rounded-2xl p-2 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {t(tab.labelKey)}
                </button>
              ))}
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">
            {/* Profile */}
            {activeTab === 'profile' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-6">{t('settings.profile')}</h2>

                  {/* Avatar */}
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <User className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <Button variant="outline" size="sm" className="border-border text-foreground">
                        <Camera className="mr-2 h-4 w-4" /> {t('profile.uploadPhoto')}
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">JPG, PNG. Max 5MB.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">{t('profile.displayName')}</label>
                      <input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Your name"
                        className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">{t('profile.email')}</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full bg-secondary border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">{t('profile.password')}</label>
                      <Button variant="outline" size="sm" className="border-border text-foreground">
                        <Lock className="mr-2 h-4 w-4" /> {t('profile.changePassword')}
                      </Button>
                    </div>
                  </div>

                  {/* Meta info */}
                  <div className="mt-6 pt-6 border-t border-border flex flex-wrap gap-6">
                    <div>
                      <p className="text-xs text-muted-foreground">{t('profile.joined')}</p>
                      <p className="text-sm text-foreground font-medium">February 14, 2026</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t('profile.status')}</p>
                      <span className="text-sm font-medium text-primary">Free Trial</span>
                    </div>
                  </div>

                  <Button
                    className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => toast.info('Connect Lovable Cloud to save profile changes.')}
                  >
                    {t('profile.save')}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Character Generator */}
            {activeTab === 'character' && (
              <CharacterGenerator />
            )}

            {/* Appearance */}
            {activeTab === 'appearance' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-6">{t('settings.appearance')}</h2>
                  <div className="grid gap-4">
                    {([
                      { value: 'dark' as const, label: t('theme.dark'), icon: Moon },
                      { value: 'light' as const, label: t('theme.light'), icon: Sun },
                    ]).map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setTheme(opt.value)}
                        className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                          theme === opt.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-muted-foreground/30 bg-secondary'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          theme === opt.value ? 'bg-primary/10' : 'bg-muted'
                        }`}>
                          <opt.icon className={`h-5 w-5 ${theme === opt.value ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <span className={`text-sm font-medium ${theme === opt.value ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {opt.label}
                        </span>
                        {theme === opt.value && <Check className="ml-auto h-4 w-4 text-primary" />}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Language */}
            {activeTab === 'language' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-6">{t('settings.language')}</h2>
                  <div className="grid gap-3">
                    {availableLanguages.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setLanguage(lang);
                          toast.success(`Language changed to ${languageNames[lang]}`);
                        }}
                        className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                          language === lang
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-muted-foreground/30 bg-secondary'
                        }`}
                      >
                        <span className="text-lg">
                          {lang === 'en' ? '🇺🇸' : lang === 'es' ? '🇪🇸' : '🇵🇭'}
                        </span>
                        <span className={`text-sm font-medium ${language === lang ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {languageNames[lang]}
                        </span>
                        {language === lang && <Check className="ml-auto h-4 w-4 text-primary" />}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Subscription */}
            {activeTab === 'subscription' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">{t('settings.subscription')}</h2>
                  <div className="bg-secondary rounded-xl p-5 mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Current Plan</span>
                      <span className="text-sm font-semibold text-primary">Free Trial</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Messages Used</span>
                      <span className="text-sm font-semibold text-foreground">2 / 5</span>
                    </div>
                  </div>
                  <Link to="/billing">
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Sparkles className="mr-2 h-4 w-4" /> Upgrade Plan
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}
          </main>
      </div>
    </div>
  );
};

// Character Generator Component
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

const CharacterGenerator = () => {
  const { t } = useLanguage();
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const selectOption = (category: string, value: string) => {
    setSelections(prev => ({ ...prev, [category]: value }));
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setGeneratedImage(null);
    // Simulate generation - will be replaced with Lovable AI
    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedImage('/placeholder.svg');
      toast.info('Connect Lovable Cloud to enable AI image generation.');
    }, 2000);
  };

  const handleAccept = () => {
    toast.info('Connect Lovable Cloud to save your character.');
  };

  const optionKeys: { key: keyof typeof characterOptions; labelKey: string }[] = [
    { key: 'hairColor', labelKey: 'character.hairColor' },
    { key: 'hairstyle', labelKey: 'character.hairstyle' },
    { key: 'eyeColor', labelKey: 'character.eyeColor' },
    { key: 'ethnicity', labelKey: 'character.ethnicity' },
    { key: 'ageRange', labelKey: 'character.ageRange' },
    { key: 'bodyType', labelKey: 'character.bodyType' },
    { key: 'clothing', labelKey: 'character.clothing' },
    { key: 'mood', labelKey: 'character.mood' },
    { key: 'background', labelKey: 'character.background' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">{t('character.title')}</h2>

        <div className="grid gap-5">
          {optionKeys.map(({ key, labelKey }) => (
            <div key={key}>
              <label className="text-sm text-muted-foreground mb-2 block">{t(labelKey)}</label>
              <div className="flex flex-wrap gap-2">
                {characterOptions[key].map((option) => (
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
        </div>

        <div className="mt-8">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-base"
          >
            {isGenerating ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="mr-2"
                >
                  <Sparkles className="h-5 w-5" />
                </motion.div>
                {t('character.generating')}
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                {t('character.generate')}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Generated preview */}
      {generatedImage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Generated Character</h3>
          <div className="aspect-[3/4] max-w-sm mx-auto rounded-xl overflow-hidden border border-border bg-secondary mb-6">
            <img src={generatedImage} alt="Generated character" className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleGenerate}
              className="flex-1 border-border text-foreground"
            >
              {t('character.regenerate')}
            </Button>
            <Button
              onClick={handleAccept}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {t('character.accept')}
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Settings;
