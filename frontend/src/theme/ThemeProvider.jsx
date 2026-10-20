import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { applyTheme, getStoredTheme, THEME_OPTIONS, THEME_STORAGE_KEY } from './theme';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getStoredTheme);

  useEffect(() => {
    applyTheme(theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);

    if (theme !== 'system') return undefined;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => applyTheme('system');
    media.addEventListener('change', handleSystemThemeChange);

    return () => media.removeEventListener('change', handleSystemThemeChange);
  }, [theme]);

  const value = useMemo(() => ({
    theme,
    setTheme: (nextTheme) => {
      if (THEME_OPTIONS.includes(nextTheme)) setThemeState(nextTheme);
    },
    cycleTheme: () => {
      setThemeState((currentTheme) => {
        const currentIndex = THEME_OPTIONS.indexOf(currentTheme);
        return THEME_OPTIONS[(currentIndex + 1) % THEME_OPTIONS.length];
      });
    },
  }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside ThemeProvider');
  return context;
}
