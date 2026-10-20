export const THEME_STORAGE_KEY = 'konek-theme';

export const THEME_OPTIONS = ['light', 'dark', 'system'];

export function getStoredTheme() {
  if (typeof window === 'undefined') return 'system';

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (THEME_OPTIONS.includes(storedTheme)) return storedTheme;

  const legacyTheme = window.localStorage.getItem('theme');
  if (legacyTheme === 'light' || legacyTheme === 'dark') {
    window.localStorage.removeItem('theme');
    window.localStorage.setItem(THEME_STORAGE_KEY, legacyTheme);
    return legacyTheme;
  }

  return 'system';
}

export function resolveTheme(theme) {
  if (theme === 'system' && typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  return theme === 'dark' ? 'dark' : 'light';
}

export function applyTheme(theme) {
  if (typeof document === 'undefined') return;

  const resolvedTheme = resolveTheme(theme);
  const root = document.documentElement;

  root.dataset.theme = resolvedTheme;
  root.dataset.themePreference = theme;
  root.classList.toggle('dark', resolvedTheme === 'dark');
  root.style.colorScheme = resolvedTheme;
}
