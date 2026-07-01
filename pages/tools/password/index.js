import { useState } from 'react';
import Head from 'next/head';
import { Button } from '../../../components/ui/button';

export const PASSWORD_TYPES = {
  lowercase: {
    label: 'Lowercase (a-z)',
    chars: 'abcdefghijklmnopqrstuvwxyz',
  },
  uppercase: {
    label: 'Uppercase (A-Z)',
    chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  },
  numbers: {
    label: 'Numbers (0-9)',
    chars: '0123456789',
  },
  symbols: {
    label: 'Symbols (!@#$)',
    chars: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  },
};

const DEFAULT_OPTIONS = {
  lowercase: true,
  uppercase: true,
  numbers: true,
  symbols: true,
};

const MAX_PASSWORD_LENGTH = 64;

export const STRENGTH_LEVELS = [
  { label: 'Very weak', colorClass: 'bg-error' },
  { label: 'Weak', colorClass: 'bg-orange-500' },
  { label: 'Fair', colorClass: 'bg-yellow-500' },
  { label: 'Good', colorClass: 'bg-blue-500' },
  { label: 'Strong', colorClass: 'bg-success' },
];

const randomInt = (max, cryptoSource) => {
  const cryptoApi = cryptoSource || globalThis.crypto;
  const limit = Math.floor(256 / max) * max;
  const bytes = new Uint8Array(1);

  do {
    cryptoApi.getRandomValues(bytes);
  } while (bytes[0] >= limit);

  return bytes[0] % max;
};

const pickChar = (chars, cryptoSource) => chars[randomInt(chars.length, cryptoSource)];

export function generateStrongPassword(length, options, cryptoSource) {
  const selectedSets = Object.entries(PASSWORD_TYPES)
    .filter(([key]) => options[key])
    .map(([, config]) => config.chars);

  if (selectedSets.length === 0) {
    throw new Error('Select at least one character type.');
  }

  if (length < selectedSets.length) {
    throw new Error('Length must be at least the number of selected character types.');
  }

  const allChars = selectedSets.join('');
  const chars = selectedSets.map((set) => pickChar(set, cryptoSource));

  while (chars.length < length) {
    chars.push(pickChar(allChars, cryptoSource));
  }

  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1, cryptoSource);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join('');
}

export function getPasswordStrength(value) {
  const length = value.length;
  const typeCount = [
    /[a-z]/.test(value),
    /[A-Z]/.test(value),
    /[0-9]/.test(value),
    /[^a-zA-Z0-9]/.test(value),
  ].filter(Boolean).length;

  let level = 0;

  if (length >= 8) level = 1;
  if (length >= 12) level = 2;
  if (length >= 16 && typeCount >= 2) level = 3;
  if (length >= 16 && typeCount >= 4) level = 4;

  return {
    ...STRENGTH_LEVELS[level],
    level,
    typeCount,
  };
}

export default function PasswordTool() {
  const [length, setLength] = useState(20);
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const selectedCount = Object.values(options).filter(Boolean).length;
  const strength = password ? getPasswordStrength(password) : null;

  const handleLengthChange = (value) => {
    const nextLength = Number(value);
    setLength(nextLength);
  };

  const toggleOption = (key) => {
    setOptions((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const handleGenerate = () => {
    try {
      const nextPassword = generateStrongPassword(length, options);
      setPassword(nextPassword);
      setError('');
    } catch (e) {
      setPassword('');
      setError(e.message);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(password);
    alert('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>Password Generator - Vibe Tools</title>
        <meta name="description" content="Generate strong passwords with length and character type options" />
      </Head>

      <header className="border-b border-border py-10">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="font-display text-product text-text mb-1 tracking-tight">Password Generator</h1>
          <p className="text-body text-textMuted">Generate strong passwords with custom length and character types</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          <section className="border border-border rounded-lg overflow-hidden">
            <div className="bg-surface px-4 py-2.5 border-b border-border">
              <h2 className="text-body-emphasis text-text">Options</h2>
            </div>

            <div className="p-4 space-y-5 bg-background">
              <div>
                <div className="flex items-center justify-between gap-4 mb-2">
                  <label htmlFor="password-length" className="text-control font-medium text-text">
                    Length
                  </label>
                  <input
                    type="number"
                    min={selectedCount || 1}
                    max={MAX_PASSWORD_LENGTH}
                    value={length}
                    onChange={(e) => handleLengthChange(e.target.value)}
                    className="w-24 p-2 border border-border rounded bg-input text-text focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent transition-colors duration-150"
                  />
                </div>
                <input
                  id="password-length"
                  type="range"
                  min={selectedCount || 1}
                  max={MAX_PASSWORD_LENGTH}
                  value={length}
                  onChange={(e) => handleLengthChange(e.target.value)}
                  className="w-full accent-[var(--primary)]"
                />
              </div>

              <fieldset>
                <legend className="text-control font-medium text-text mb-3">Character Types</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(PASSWORD_TYPES).map(([key, config]) => (
                    <label
                      key={key}
                      className="flex items-center gap-3 p-3 border border-border rounded bg-input text-text hover:bg-surfaceHover transition-colors duration-150"
                    >
                      <input
                        type="checkbox"
                        checked={options[key]}
                        onChange={() => toggleOption(key)}
                        className="h-4 w-4 accent-[var(--primary)]"
                      />
                      <span className="text-control">{config.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <Button onClick={handleGenerate}>Generate Password</Button>
            </div>
          </section>

          {error && (
            <div className="text-error text-control p-3 bg-errorBg rounded">{error}</div>
          )}

          {password && (
            <section className="border border-border rounded-lg overflow-hidden">
              <div className="bg-surface px-4 py-2.5 border-b border-border flex justify-between items-center">
                <h2 className="text-body-emphasis text-text">Result</h2>
                <Button variant="ghost" size="sm" onClick={handleCopy}>Copy</Button>
              </div>
              <div className="px-4 pt-4 bg-input">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <span className="text-control font-medium text-text">Strength</span>
                  <span className="text-control text-text">{strength.label}</span>
                </div>
                <div className="grid grid-cols-5 gap-1" aria-label={`Password strength: ${strength.label}`}>
                  {STRENGTH_LEVELS.map((level, index) => (
                    <span
                      key={level.label}
                      className={`h-2 rounded-sm ${
                        index <= strength.level ? strength.colorClass : 'bg-border'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <pre className="p-4 text-body font-mono text-text whitespace-pre-wrap break-all bg-input">
                {password}
              </pre>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
