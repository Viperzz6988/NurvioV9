import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations as fallbackTranslations, TranslationKeys } from '@/i18n/translations';

type Language = 'de' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof TranslationKeys) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [isRTL, setIsRTL] = useState(false);
  const [dictionary, setDictionary] = useState<Record<string, string>>(fallbackTranslations['en']);

  const loadTranslations = async (lang: Language) => {
    try {
      const response = await fetch(`/locales/${lang}.json`, { cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to load translations');
      const data = await response.json();
      setDictionary(data);
    } catch (error) {
      console.warn(`Falling back to bundled translations for language "${lang}"`, error);
      setDictionary(fallbackTranslations[lang]);
    }
  };

  // Load language preference from localStorage on mount; if absent, detect browser language
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language | null;
    let initialLang: Language | null = null;
    if (savedLanguage === 'de' || savedLanguage === 'en') {
      initialLang = savedLanguage;
    } else {
      const browserLang = (navigator.language || navigator.languages?.[0] || 'en').toLowerCase();
      initialLang = browserLang.startsWith('de') ? 'de' : 'en';
    }
    setLanguage(initialLang);
    localStorage.setItem('language', initialLang);
    loadTranslations(initialLang);
  }, []);

  // Update document direction and lang attribute when language changes
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [language, isRTL]);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    loadTranslations(lang);
    // Notify listeners
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
  };

  const t = (key: keyof TranslationKeys): string => {
    const value = dictionary[key as string];
    if (!value) {
      console.warn(`Translation key "${key}" not found for language "${language}"`);
      return key as string;
    }
    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
