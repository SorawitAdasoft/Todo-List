import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

/**
 * Hook for managing dark/light theme
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('system');
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');
  
  // Load theme from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as Theme;
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setThemeState(savedTheme);
      }
    }
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = window.document.documentElement;
    const effectiveTheme = theme === 'system' ? systemTheme : theme;
    
    root.classList.remove('light', 'dark');
    root.classList.add(effectiveTheme);
    
    // Update meta theme-color
    const themeColorMeta = document.querySelector('meta[name=\"theme-color\"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute(
        'content', 
        effectiveTheme === 'dark' ? '#1f2937' : '#ffffff'
      );
    }
  }, [theme, systemTheme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [theme, setTheme]);

  const effectiveTheme = theme === 'system' ? systemTheme : theme;

  return {
    theme,
    effectiveTheme,
    systemTheme,
    setTheme,
    toggleTheme,
  };
}

/**
 * Hook for managing user preferences
 */
export function usePreferences() {
  const [preferences, setPreferencesState] = useState({
    sidebarCollapsed: false,
    showCompletedTodos: true,
    defaultPriority: 'normal' as const,
    autoSave: true,
    notifications: false,
  });

  // Load preferences from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('preferences');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setPreferencesState(prev => ({ ...prev, ...parsed }));
        } catch (error) {
          console.error('Failed to parse preferences:', error);
        }
      }
    }
  }, []);

  // Save preferences to localStorage
  const setPreferences = useCallback((updates: Partial<typeof preferences>) => {
    setPreferencesState(prev => {
      const newPreferences = { ...prev, ...updates };
      if (typeof window !== 'undefined') {
        localStorage.setItem('preferences', JSON.stringify(newPreferences));
      }
      return newPreferences;
    });
  }, []);

  const toggleSidebar = useCallback(() => {
    setPreferences({ sidebarCollapsed: !preferences.sidebarCollapsed });
  }, [preferences.sidebarCollapsed, setPreferences]);

  const toggleShowCompleted = useCallback(() => {
    setPreferences({ showCompletedTodos: !preferences.showCompletedTodos });
  }, [preferences.showCompletedTodos, setPreferences]);

  return {
    preferences,
    setPreferences,
    toggleSidebar,
    toggleShowCompleted,
  };
}

/**
 * Hook for managing local storage with type safety
 */
export function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const item = localStorage.getItem(key);
        if (item !== null) {
          setValue(JSON.parse(item));
        }
      } catch (error) {
        console.error(`Error loading localStorage key \"${key}\":`, error);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [key]);

  // Save to localStorage when value changes
  const setStoredValue = useCallback((newValue: T | ((prev: T) => T)) => {
    try {
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
      setValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key \"${key}\":`, error);
    }
  }, [key, value]);

  const removeValue = useCallback(() => {
    setValue(defaultValue);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  }, [key, defaultValue]);

  return {
    value,
    setValue: setStoredValue,
    removeValue,
    loading,
  };
}"