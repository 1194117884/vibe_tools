import { useMemo, useState } from 'react';
import Head from 'next/head';
import { Button } from '../../../components/ui/button';

/** Split any common identifier style into lowercase words. */
export function splitWords(input) {
  if (!input || !input.trim()) return [];
  return input
    .replace(/['"]/g, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/[_\-./\s]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.toLowerCase());
}

export function toCamelCase(words) {
  if (!words.length) return '';
  return words[0] + words.slice(1).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
}

export function toPascalCase(words) {
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
}

export function toSnakeCase(words) {
  return words.join('_');
}

export function toKebabCase(words) {
  return words.join('-');
}

export function toConstantCase(words) {
  return words.map((w) => w.toUpperCase()).join('_');
}

export function toTrainCase(words) {
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('-');
}

export function toDotCase(words) {
  return words.join('.');
}

export function toPathCase(words) {
  return words.join('/');
}

export function toTitleCase(words) {
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export function toSentenceCase(words) {
  if (!words.length) return '';
  return words[0].charAt(0).toUpperCase() + words[0].slice(1) + (words.length > 1 ? ' ' + words.slice(1).join(' ') : '');
}

export function convertAll(input) {
  const words = splitWords(input);
  return {
    camel: toCamelCase(words),
    pascal: toPascalCase(words),
    snake: toSnakeCase(words),
    kebab: toKebabCase(words),
    constant: toConstantCase(words),
    train: toTrainCase(words),
    dot: toDotCase(words),
    path: toPathCase(words),
    title: toTitleCase(words),
    sentence: toSentenceCase(words),
    lower: words.join(' '),
    upper: words.map((w) => w.toUpperCase()).join(' '),
  };
}

const LABELS = [
  ['camel', 'camelCase'],
  ['pascal', 'PascalCase'],
  ['snake', 'snake_case'],
  ['kebab', 'kebab-case'],
  ['constant', 'CONSTANT_CASE'],
  ['train', 'Train-Case'],
  ['dot', 'dot.case'],
  ['path', 'path/case'],
  ['title', 'Title Case'],
  ['sentence', 'Sentence case'],
  ['lower', 'lower case'],
  ['upper', 'UPPER CASE'],
];

export default function CaseTool() {
  const [input, setInput] = useState('hello_worldExample-name');
  const [copiedKey, setCopiedKey] = useState('');

  const results = useMemo(() => convertAll(input), [input]);

  const handleCopy = async (key, value) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 1200);
  };

  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>Case Converter - Vibe Tools</title>
        <meta name="description" content="Convert text between camelCase, snake_case, kebab-case and more" />
      </Head>
      <header className="border-b border-border py-10">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="font-display text-product text-text mb-1 tracking-tight">Case Converter</h1>
          <p className="text-body text-textMuted">Convert identifiers between common casing styles</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          <div>
            <label className="block text-control font-medium text-text mb-2">Input</label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. user_profile_id or getUserName"
              className="w-full p-3 border border-border rounded bg-input text-text font-mono focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent transition-colors duration-150"
            />
          </div>

          <div className="border border-border rounded-lg overflow-hidden divide-y divide-border">
            {LABELS.map(([key, label]) => (
              <div key={key} className="flex items-center gap-3 px-4 py-3 bg-input">
                <div className="w-36 shrink-0 text-micro text-textMuted font-medium">{label}</div>
                <code className="flex-1 font-mono text-control text-text break-all">
                  {results[key] || '—'}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(key, results[key])}
                  disabled={!results[key]}
                >
                  {copiedKey === key ? 'Copied' : 'Copy'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
