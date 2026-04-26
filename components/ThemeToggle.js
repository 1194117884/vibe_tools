import { useTheme } from '../contexts/ThemeContext';
import { useState } from 'react';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themeOptions = [
    { id: 'light', name: 'Light', icon: <SunIcon className="h-4 w-4" /> },
    { id: 'dark', name: 'Dark', icon: <MoonIcon className="h-4 w-4" /> },
    { id: 'system', name: 'System', icon: <ComputerDesktopIcon className="h-4 w-4" /> },
  ];

  const currentThemeOption = themeOptions.find((option) => option.id === theme);

  const selectTheme = (selectedTheme) => {
    setTheme(selectedTheme);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 w-9 flex items-center justify-center rounded bg-surface border border-border hover:bg-surfaceHover transition-colors duration-150 text-textDim hover:text-text active:scale-[0.97]"
        aria-label="Toggle theme"
        title={`Current theme: ${theme}`}
      >
        {currentThemeOption?.icon}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 rounded-lg bg-surface border border-border shadow-[0_4px_16px_rgba(0,0,0,0.12)] z-50 py-1">
          {themeOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => selectTheme(option.id)}
              className={`w-full text-left px-3 py-2 text-control flex items-center gap-2 rounded-md mx-1 transition-colors duration-100 ${
                theme === option.id
                  ? 'bg-primary text-primaryText'
                  : 'text-text hover:bg-surfaceHover'
              }`}
            >
              <span className="flex-shrink-0">{option.icon}</span>
              <span>{option.name}</span>
            </button>
          ))}
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ThemeToggle;
