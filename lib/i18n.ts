import { useState, useEffect, createContext, useContext } from 'react';
import enTranslations from '@/locales/en.json';
import thTranslations from '@/locales/th.json';

export type SupportedLocale = 'en' | 'th';

type Translations = typeof enTranslations;

const translations = {
  en: enTranslations,
  th: thTranslations,
} as const;

// I18n Context
interface I18nContextType {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Helper function to get nested translation value
function getNestedTranslation(obj: any, path: string): string {
  return path.split('.').reduce((current, key) => current?.[key], obj) || path;
}

// I18n Provider Component
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>('th'); // Default to Thai

  // Load locale from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem('locale') as SupportedLocale;
      if (savedLocale && (savedLocale === 'en' || savedLocale === 'th')) {
        setLocaleState(savedLocale);
      }
    }
  }, []);

  // Save locale to localStorage when changed
  const setLocale = (newLocale: SupportedLocale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', newLocale);
    }
  };

  // Translation function
  const t = (key: string): string => {
    try {
      return getNestedTranslation(translations[locale], key);
    } catch (error) {
      console.warn(`Translation key \"${key}\" not found for locale \"${locale}\"`);
      return key;
    }
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

// Hook to use I18n
export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

// Hook for translations only (convenience)
export function useTranslation() {
  const { t } = useI18n();
  return { t };
}

// Standalone translation function (for use outside components)
export function createTranslator(locale: SupportedLocale) {
  return (key: string): string => {
    try {
      return getNestedTranslation(translations[locale], key);
    } catch (error) {
      console.warn(`Translation key \"${key}\" not found for locale \"${locale}\"`);
      return key;
    }
  };
}

// Get available locales
export function getAvailableLocales(): SupportedLocale[] {
  return Object.keys(translations) as SupportedLocale[];
}

// Get locale display name
export function getLocaleDisplayName(locale: SupportedLocale): string {
  const displayNames: Record<SupportedLocale, string> = {
    en: 'English',
    th: 'ไทย',
  };
  return displayNames[locale];
}

// Format number with locale
export function formatNumber(number: number, locale: SupportedLocale): string {
  return new Intl.NumberFormat(locale === 'th' ? 'th-TH' : 'en-US').format(number);
}

// Type-safe translation keys (for development)
export type TranslationKey = 
  | 'common.add'
  | 'common.edit'
  | 'common.delete'
  | 'common.save'
  | 'common.cancel'
  | 'nav.inbox'
  | 'nav.today'
  | 'nav.completed'
  | 'todo.title'
  | 'todo.addTodo'
  | 'todo.noTodos'
  | 'priority.low'
  | 'priority.normal'
  | 'priority.high'
  | 'messages.todoAdded'
  | 'messages.todoUpdated'
  | 'messages.todoDeleted'
  | 'offline.title'
  | 'offline.description';