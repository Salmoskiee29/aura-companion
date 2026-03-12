import { Globe, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import logoImg from '@/assets/yourmatch-logo.png';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function LandingFooter() {
  const { language, setLanguage, languageNames, availableLanguages, t } = useLanguage();

  return (
    <footer className="py-12 border-t border-border/20 glass-card">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoImg} alt="YourMatch" className="h-5 w-5 rounded" />
            <span className="font-bold text-foreground" style={{ fontFamily: "'Orbitron', sans-serif" }}>YourMatch</span>
          </Link>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-primary" fill="currentColor" /> — {t('footer.rights')}
          </p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                <Globe className="h-4 w-4 mr-1" />
                {languageNames[language]}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-72 overflow-y-auto glass-card-strong">
              {availableLanguages.map((lang) => (
                <DropdownMenuItem key={lang} onClick={() => setLanguage(lang)} className={language === lang ? 'bg-primary/10 text-primary' : ''}>
                  {languageNames[lang]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </footer>
  );
}
