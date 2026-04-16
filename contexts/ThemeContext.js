// contexts/ThemeContext.js
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('system');
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage on mount (client-side only)
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
    }
    setMounted(true);
  }, []);

  // Apply theme changes to document
  useEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;

    // Remove existing theme classes
    root.classList.remove('light', 'dark');

    let appliedTheme = theme;
    if (theme === 'system') {
      // Detect system preference
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      appliedTheme = isDark ? 'dark' : 'light';
    }

    root.classList.add(appliedTheme);

    // Save theme preference
    localStorage.setItem('theme', theme);
  }, [theme, mounted]);

  // Listen for system theme changes when in system mode
  useEffect(() => {
    if (!mounted) return;

    const handleSystemThemeChange = () => {
      if (theme === 'system') {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');

        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.add(isDark ? 'dark' : 'light');
      }
    };

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [theme, mounted]);

  // Prevent hydration mismatch by not rendering until mounted
  const value = { theme, setTheme, mounted };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};