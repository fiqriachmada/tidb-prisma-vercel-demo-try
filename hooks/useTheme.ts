import { useEffect } from 'react';
import { useThemeStore } from 'store';

/**
 * Applies the stored theme on first mount (SSR-safe).
 * Must be called once in the app root.
 */
export function useThemeInit() {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
}

/**
 * Returns the current theme and a toggle function.
 */
export function useTheme() {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const setTheme = useThemeStore((s) => s.setTheme);

  return { theme, toggleTheme, setTheme };
}
