import { Link } from 'react-router-dom';
import { Sun, Moon, Globe, Menu, X, Heart } from 'lucide-react';
import { useState } from 'react';
import logoImg from '@/assets/yourmatch-logo.png';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function LandingNav() {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, languageNames, availableLanguages, t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/20">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logoImg} alt="YourMatch" className="h-7 w-7 rounded" />
          <span className="text-lg font-bold text-foreground tracking-tight" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            YourMatch
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-sm text-muted-foreground hover:text-primary transition-colors">Features</a>
          <a href="#pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors">Pricing</a>
          <Link to="/auth?mode=login" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t('nav.login')}</Link>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary">
                <Globe className="h-4 w-4" />
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

          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <Link to="/auth?mode=signup" className="hidden sm:block">
            <button className="px-5 py-2 rounded-full btn-premium text-primary-foreground text-sm font-semibold">
              {t('nav.getStarted')}
            </button>
          </Link>

          <button className="md:hidden text-muted-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/20 glass-card-strong px-4 py-4 space-y-3">
          <a href="#features" onClick={() => setMobileOpen(false)} className="block text-sm text-muted-foreground hover:text-primary">Features</a>
          <a href="#pricing" onClick={() => setMobileOpen(false)} className="block text-sm text-muted-foreground hover:text-primary">Pricing</a>
          <Link to="/auth?mode=login" onClick={() => setMobileOpen(false)} className="block text-sm text-muted-foreground hover:text-primary">{t('nav.login')}</Link>
          <Link to="/auth?mode=signup" onClick={() => setMobileOpen(false)}>
            <button className="w-full px-5 py-2.5 rounded-full btn-premium text-primary-foreground text-sm font-semibold mt-2">
              {t('nav.getStarted')}
            </button>
          </Link>
        </div>
      )}
    </nav>
  );
}
