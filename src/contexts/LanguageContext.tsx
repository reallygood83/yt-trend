'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { translations, Language } from '@/i18n/translations';

type TFunction = (key: string) => string;

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TFunction;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ko');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('language') as Language | null;
      if (saved === 'ko' || saved === 'en') {
        setLanguageState(saved);
        return;
      }
    } catch {}

    const browserLang = typeof navigator !== 'undefined' ? navigator.language : 'ko';
    setLanguageState(browserLang.toLowerCase().startsWith('en') ? 'en' : 'ko');
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('language', lang);
    } catch {}
  };

  const t: TFunction = useMemo(() => {
    return (key: string) => {
      const table = translations[language] || {};
      return table[key] ?? translations.ko[key] ?? key;
    };
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage, t }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}