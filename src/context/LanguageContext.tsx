import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupportedLanguage } from '../types.js';
import { translations, TranslationDict } from '../translations.js';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: TranslationDict;
  localeCode: string;
}

const LOCALE_MAP: Record<SupportedLanguage, string> = {
  en: 'en-US',
  ta: 'ta-IN',
  hi: 'hi-IN',
  ml: 'ml-IN',
  te: 'te-IN',
  kn: 'kn-IN',
  ur: 'ur-PK',
  tanglish: 'en-IN',
};

export const LANGUAGE_OPTIONS: Array<{ code: SupportedLanguage; label: string; nativeName: string }> = [
  { code: 'en', label: 'English', nativeName: 'English' },
  { code: 'ta', label: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ml', label: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'te', label: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'kn', label: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ur', label: 'Urdu', nativeName: 'اردو' },
  { code: 'tanglish', label: 'Tanglish', nativeName: 'Tanglish' },
];

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem('mood_journal_lang') as SupportedLanguage;
    return saved && translations[saved] ? saved : 'en';
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('mood_journal_lang', lang);
  };

  const t = translations[language] || translations.en;
  const localeCode = LOCALE_MAP[language] || 'en-US';

  useEffect(() => {
    document.documentElement.lang = language === 'tanglish' ? 'en-IN' : localeCode;
    document.documentElement.dir = language === 'ur' ? 'rtl' : 'ltr';
  }, [language, localeCode]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, localeCode }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextType {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return ctx;
}
