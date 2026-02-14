import { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'es' | 'fil';

const translations: Record<Language, Record<string, string>> = {
  en: {
    'nav.models': 'Models',
    'nav.pricing': 'Pricing',
    'nav.about': 'About',
    'nav.settings': 'Settings',
    'nav.login': 'Log in',
    'nav.getStarted': 'Get Started',
    'settings.title': 'Settings',
    'settings.profile': 'Profile',
    'settings.profileDesc': 'Manage your account details and preferences',
    'settings.character': 'Character Generator',
    'settings.characterDesc': 'Create your custom AI companion character',
    'settings.appearance': 'Appearance',
    'settings.appearanceDesc': 'Customize your visual experience',
    'settings.language': 'Language',
    'settings.languageDesc': 'Choose your preferred language',
    'settings.subscription': 'Subscription',
    'settings.subscriptionDesc': 'Manage your plan and billing',
    'profile.displayName': 'Display Name',
    'profile.email': 'Email',
    'profile.password': 'Password',
    'profile.changePassword': 'Change Password',
    'profile.save': 'Save Changes',
    'profile.photo': 'Profile Photo',
    'profile.uploadPhoto': 'Upload Photo',
    'profile.joined': 'Joined',
    'profile.status': 'Subscription Status',
    'theme.dark': 'Dark Mode',
    'theme.light': 'Light Mode',
    'theme.system': 'Follow System',
    'character.title': 'Create Your Character',
    'character.hairColor': 'Hair Color',
    'character.hairstyle': 'Hairstyle',
    'character.eyeColor': 'Eye Color',
    'character.ethnicity': 'Ethnicity',
    'character.ageRange': 'Age Range',
    'character.bodyType': 'Body Type',
    'character.clothing': 'Clothing Style',
    'character.mood': 'Mood',
    'character.background': 'Background',
    'character.generate': 'Generate Character',
    'character.regenerate': 'Regenerate',
    'character.accept': 'Accept Character',
    'character.generating': 'Generating...',
  },
  es: {
    'nav.models': 'Modelos',
    'nav.pricing': 'Precios',
    'nav.about': 'Acerca de',
    'nav.settings': 'Configuración',
    'nav.login': 'Iniciar sesión',
    'nav.getStarted': 'Comenzar',
    'settings.title': 'Configuración',
    'settings.profile': 'Perfil',
    'settings.profileDesc': 'Administra los detalles de tu cuenta',
    'settings.character': 'Generador de Personaje',
    'settings.characterDesc': 'Crea tu personaje de IA personalizado',
    'settings.appearance': 'Apariencia',
    'settings.appearanceDesc': 'Personaliza tu experiencia visual',
    'settings.language': 'Idioma',
    'settings.languageDesc': 'Elige tu idioma preferido',
    'settings.subscription': 'Suscripción',
    'settings.subscriptionDesc': 'Administra tu plan y facturación',
    'profile.displayName': 'Nombre',
    'profile.email': 'Correo',
    'profile.password': 'Contraseña',
    'profile.changePassword': 'Cambiar Contraseña',
    'profile.save': 'Guardar Cambios',
    'profile.photo': 'Foto de Perfil',
    'profile.uploadPhoto': 'Subir Foto',
    'profile.joined': 'Se unió',
    'profile.status': 'Estado de Suscripción',
    'theme.dark': 'Modo Oscuro',
    'theme.light': 'Modo Claro',
    'theme.system': 'Seguir Sistema',
    'character.title': 'Crea Tu Personaje',
    'character.hairColor': 'Color de Cabello',
    'character.hairstyle': 'Peinado',
    'character.eyeColor': 'Color de Ojos',
    'character.ethnicity': 'Etnicidad',
    'character.ageRange': 'Rango de Edad',
    'character.bodyType': 'Tipo de Cuerpo',
    'character.clothing': 'Estilo de Ropa',
    'character.mood': 'Estado de Ánimo',
    'character.background': 'Fondo',
    'character.generate': 'Generar Personaje',
    'character.regenerate': 'Regenerar',
    'character.accept': 'Aceptar Personaje',
    'character.generating': 'Generando...',
  },
  fil: {
    'nav.models': 'Mga Modelo',
    'nav.pricing': 'Presyo',
    'nav.about': 'Tungkol',
    'nav.settings': 'Settings',
    'nav.login': 'Mag-login',
    'nav.getStarted': 'Magsimula',
    'settings.title': 'Settings',
    'settings.profile': 'Profile',
    'settings.profileDesc': 'Pamahalaan ang mga detalye ng iyong account',
    'settings.character': 'Character Generator',
    'settings.characterDesc': 'Gumawa ng custom na AI companion character',
    'settings.appearance': 'Hitsura',
    'settings.appearanceDesc': 'I-customize ang visual experience mo',
    'settings.language': 'Wika',
    'settings.languageDesc': 'Piliin ang gusto mong wika',
    'settings.subscription': 'Subscription',
    'settings.subscriptionDesc': 'Pamahalaan ang iyong plan at billing',
    'profile.displayName': 'Pangalan',
    'profile.email': 'Email',
    'profile.password': 'Password',
    'profile.changePassword': 'Palitan ang Password',
    'profile.save': 'I-save',
    'profile.photo': 'Profile Photo',
    'profile.uploadPhoto': 'Mag-upload ng Photo',
    'profile.joined': 'Sumali noong',
    'profile.status': 'Status ng Subscription',
    'theme.dark': 'Dark Mode',
    'theme.light': 'Light Mode',
    'theme.system': 'Sundin ang System',
    'character.title': 'Gumawa ng Character',
    'character.hairColor': 'Kulay ng Buhok',
    'character.hairstyle': 'Hairstyle',
    'character.eyeColor': 'Kulay ng Mata',
    'character.ethnicity': 'Lahi',
    'character.ageRange': 'Edad',
    'character.bodyType': 'Uri ng Katawan',
    'character.clothing': 'Estilo ng Damit',
    'character.mood': 'Mood',
    'character.background': 'Background',
    'character.generate': 'I-generate ang Character',
    'character.regenerate': 'I-regenerate',
    'character.accept': 'Tanggapin ang Character',
    'character.generating': 'Ginagawa...',
  },
};

const languageNames: Record<Language, string> = {
  en: 'English',
  es: 'Español',
  fil: 'Filipino',
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  languageNames: Record<Language, string>;
  availableLanguages: Language[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('lumiere-language');
    return (saved === 'en' || saved === 'es' || saved === 'fil') ? saved : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('lumiere-language', lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] ?? translations['en']?.[key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languageNames, availableLanguages: ['en', 'es', 'fil'] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
