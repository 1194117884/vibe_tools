import { useState } from 'react';
import Head from 'next/head';
import { Button } from '../../../components/ui/button';

const NAMED = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/**
 * Escape special HTML characters. When named=false, uses numeric entities only.
 */
export function escapeHtml(text, { named = true } = {}) {
  if (text == null) return '';
  return String(text).replace(/[&<>"']/g, (ch) => {
    if (named && NAMED[ch]) return NAMED[ch];
    return `&#${ch.charCodeAt(0)};`;
  });
}

/**
 * Unescape HTML entities (named common ones + numeric decimal/hex).
 */
export function unescapeHtml(text) {
  if (text == null) return '';
  const namedMap = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
    nbsp: ' ',
  };

  return String(text)
    .replace(/&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z]+);/g, (match, entity) => {
      if (entity[0] === '#') {
        const code =
          entity[1] === 'x' || entity[1] === 'X'
            ? parseInt(entity.slice(2), 16)
            : parseInt(entity.slice(1), 10);
        if (Number.isNaN(code)) return match;
        try {
          return String.fromCodePoint(code);
        } catch {
          return match;
        }
      }
      const lower = entity.toLowerCase();
      if (namedMap[lower] != null) return namedMap[lower];
      return match;
    });
}

const SAMPLE = `<div class="card" data-title="Hello & welcome">
  It's <strong>safe</strong> & "quoted"
</div>`;

export default function HtmlEntitiesTool() {
  const [input, setInput] = useState(SAMPLE);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const run = (mode) => {
    try {
      const result = mode === 'escape' ? escapeHtml(input) : unescapeHtml(input);
      setOutput(result);
      setError('');
      setCopied(false);
    } catch (e) {
      setError(e.message);
      setOutput('');
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>HTML Entities - Vibe Tools</title>
        <meta name="description" content="Escape and unescape HTML entities" />
      </Head>
      <header className="border-b border-border py-10">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="font-display text-product text-text mb-1 tracking-tight">HTML Entities</h1>
          <p className="text-body text-textMuted">Escape special characters or decode HTML entities</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          <div>
            <label className="block text-control font-medium text-text mb-2">Input</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-44 p-4 border border-border rounded bg-input text-text font-mono text-control focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent resize-y"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => run('escape')}>Escape</Button>
            <Button onClick={() => run('unescape')} variant="outline">
              Unescape
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                if (output) {
                  setInput(output);
                  setOutput('');
                }
              }}
              disabled={!output}
            >
              Use result as input
            </Button>
          </div>

          {error && <div className="text-error text-control p-3 bg-errorBg rounded">{error}</div>}

          {output !== '' && (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-surface px-4 py-2.5 border-b border-border flex justify-between items-center">
                <h3 className="text-body-emphasis text-text">Result</h3>
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <pre className="p-4 text-control font-mono text-text whitespace-pre-wrap break-all max-h-96 overflow-y-auto bg-input">
                {output}
              </pre>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
