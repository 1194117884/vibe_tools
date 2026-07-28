import { useMemo, useState } from 'react';
import Head from 'next/head';
import { Button } from '../../../components/ui/button';

/**
 * Convert text to a URL/filename-safe slug.
 */
export function slugify(input, options = {}) {
  const {
    separator = '-',
    lowercase = true,
    maxLength = 0,
    trimSeparators = true,
  } = options;

  if (input == null) return '';

  let text = String(input).normalize('NFKD').replace(/[\u0300-\u036f]/g, '');

  if (lowercase) text = text.toLowerCase();

  // Replace common separators / punctuation with space, keep alphanumerics
  text = text
    .replace(/['’]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, separator);

  if (trimSeparators && separator) {
    const esc = separator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    text = text.replace(new RegExp(`^${esc}+|${esc}+$`, 'g'), '');
    text = text.replace(new RegExp(`${esc}{2,}`, 'g'), separator);
  }

  if (maxLength > 0 && text.length > maxLength) {
    text = text.slice(0, maxLength);
    if (trimSeparators && separator) {
      const esc = separator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      text = text.replace(new RegExp(`${esc}+$`), '');
    }
  }

  return text;
}

export default function SlugifyTool() {
  const [input, setInput] = useState('Hello, World! Vibe Tools 2026 — 你好');
  const [separator, setSeparator] = useState('-');
  const [lowercase, setLowercase] = useState(true);
  const [maxLength, setMaxLength] = useState(0);
  const [copied, setCopied] = useState(false);

  const output = useMemo(
    () =>
      slugify(input, {
        separator,
        lowercase,
        maxLength: Number(maxLength) || 0,
      }),
    [input, separator, lowercase, maxLength]
  );

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>Slugify - Vibe Tools</title>
        <meta name="description" content="Make URL and filename-safe slugs from text" />
      </Head>
      <header className="border-b border-border py-10">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="font-display text-product text-text mb-1 tracking-tight">Slugify</h1>
          <p className="text-body text-textMuted">Turn titles into URL and filename-safe slugs</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          <div>
            <label className="block text-control font-medium text-text mb-2">Text</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-28 p-4 border border-border rounded bg-input text-text focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent resize-y text-control"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-control font-medium text-text mb-2">Separator</label>
              <select
                value={separator}
                onChange={(e) => setSeparator(e.target.value)}
                className="w-full p-3 border border-border rounded bg-input text-text focus:outline-none focus:ring-2 focus:ring-focus-ring"
              >
                <option value="-">Hyphen (-)</option>
                <option value="_">Underscore (_)</option>
                <option value="">None</option>
              </select>
            </div>
            <div>
              <label className="block text-control font-medium text-text mb-2">Max length (0 = none)</label>
              <input
                type="number"
                min={0}
                max={500}
                value={maxLength}
                onChange={(e) => setMaxLength(e.target.value)}
                className="w-full p-3 border border-border rounded bg-input text-text focus:outline-none focus:ring-2 focus:ring-focus-ring"
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="inline-flex items-center gap-2 text-control text-text cursor-pointer">
                <input
                  type="checkbox"
                  checked={lowercase}
                  onChange={(e) => setLowercase(e.target.checked)}
                  className="h-4 w-4 accent-[var(--primary)]"
                />
                Lowercase
              </label>
            </div>
          </div>

          <div className="border border-border rounded-lg overflow-hidden">
            <div className="bg-surface px-4 py-2.5 border-b border-border flex justify-between items-center">
              <h3 className="text-body-emphasis text-text">Slug</h3>
              <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!output}>
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <pre className="p-4 text-control font-mono text-text whitespace-pre-wrap break-all bg-input min-h-[3rem]">
              {output || '—'}
            </pre>
          </div>
        </div>
      </main>
    </div>
  );
}
