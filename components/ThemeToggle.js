// components/ThemeToggle.js
import { useTheme } from '../contexts/ThemeContext';
import { useState } from 'react';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themeOptions = [
    { id: 'light', name: 'Light', icon: <SunIcon className="h-5 w-5" /> },
    { id: 'dark', name: 'Dark', icon: <MoonIcon className="h-5 w-5" /> },
    { id: 'system', name: 'System', icon: <ComputerDesktopIcon className="h-5 w-5" /> },
  ];

  const currentThemeOption = themeOptions.find(option => option.id === theme);

  const selectTheme = (selectedTheme) => {
    setTheme(selectedTheme);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-surface border border-border hover:bg-surfaceHover transition-colors flex items-center"
        aria-label="Toggle theme"
        title={`Current theme: ${theme}`}
      >
        {currentThemeOption?.icon}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-surface border border-border ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            {themeOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => selectTheme(option.id)}
                className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 ${
                  theme === option.id
                    ? 'bg-primary text-primaryText'
                    : 'text-text hover:bg-surfaceHover'
                }`}
              >
                <span>{option.icon}</span>
                <span>{option.name}</span>
                {theme === option.id && (
                  <span className="ml-auto">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default ThemeToggle;