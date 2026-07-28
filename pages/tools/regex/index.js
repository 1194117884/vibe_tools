import { useMemo, useState } from 'react';
import Head from 'next/head';
import { Button } from '../../../components/ui/button';

export function runRegex(pattern, flags, text) {
  if (!pattern) {
    return { matches: [], error: null };
  }

  let regex;
  try {
    regex = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g');
  } catch (e) {
    return { matches: [], error: e.message };
  }

  const matches = [];
  let match;
  // Cap iterations to avoid pathological ReDoS locking the UI
  let safety = 0;
  while ((match = regex.exec(text)) !== null && safety < 5000) {
    safety += 1;
    matches.push({
      value: match[0],
      index: match.index,
      groups: match.slice(1),
      named: match.groups || null,
    });
    if (match[0].length === 0) {
      regex.lastIndex += 1;
    }
  }

  return { matches, error: null };
}

export function highlightMatches(text, matches) {
  if (!matches.length) return [{ type: 'text', value: text }];

  const parts = [];
  let cursor = 0;
  const sorted = [...matches].sort((a, b) => a.index - b.index);

  for (const m of sorted) {
    if (m.index < cursor) continue;
    if (m.index > cursor) {
      parts.push({ type: 'text', value: text.slice(cursor, m.index) });
    }
    parts.push({ type: 'match', value: m.value });
    cursor = m.index + m.value.length;
  }
  if (cursor < text.length) {
    parts.push({ type: 'text', value: text.slice(cursor) });
  }
  return parts;
}

export default function RegexTool() {
  const [pattern, setPattern] = useState('\\b\\w+@\\w+\\.\\w+\\b');
  const [flags, setFlags] = useState('gi');
  const [text, setText] = useState(
    'Contact us at hello@example.com or support@vibe.tools for help.\nAlso try admin@test.org'
  );
  const [copied, setCopied] = useState(false);

  const { matches, error } = useMemo(
    () => runRegex(pattern, flags, text),
    [pattern, flags, text]
  );

  const parts = useMemo(() => highlightMatches(text, matches), [text, matches]);

  const toggleFlag = (flag) => {
    setFlags((prev) => (prev.includes(flag) ? prev.replace(flag, '') : prev + flag));
  };

  const handleCopyMatches = async () => {
    const body = matches.map((m) => m.value).join('\n');
    await navigator.clipboard.writeText(body);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>Regex Tester - Vibe Tools</title>
        <meta name="description" content="Test regular expressions with live matches" />
      </Head>
      <header className="border-b border-border py-10">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="font-display text-product text-text mb-1 tracking-tight">Regex Tester</h1>
          <p className="text-body text-textMuted">Test regular expressions and see matches live</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          <div>
            <label className="block text-control font-medium text-text mb-2">Pattern</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="Regular expression..."
                className="flex-1 p-3 border border-border rounded bg-input text-text font-mono focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent transition-colors duration-150"
              />
              <div className="flex gap-1 items-center">
                {['g', 'i', 'm', 's', 'u'].map((flag) => (
                  <button
                    key={flag}
                    type="button"
                    onClick={() => toggleFlag(flag)}
                    className={`px-3 py-2 rounded border text-control font-mono transition-colors ${
                      flags.includes(flag)
                        ? 'bg-primary text-primaryText border-primary'
                        : 'bg-input text-text border-border hover:bg-surfaceHover'
                    }`}
                    title={`Toggle ${flag} flag`}
                  >
                    {flag}
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-1 text-micro text-textMuted">Flags: {flags || '(none)'} — g is auto-applied for multi-match</p>
          </div>

          <div>
            <label className="block text-control font-medium text-text mb-2">Test text</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-40 p-4 border border-border rounded bg-input text-text placeholder:text-textDim focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent resize-y font-mono text-control transition-colors duration-150"
            />
          </div>

          {error && (
            <div className="text-error text-control p-3 bg-errorBg rounded">Invalid regex: {error}</div>
          )}

          {!error && (
            <>
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="bg-surface px-4 py-2.5 border-b border-border flex justify-between items-center">
                  <h3 className="text-body-emphasis text-text">
                    Highlighted ({matches.length} match{matches.length === 1 ? '' : 'es'})
                  </h3>
                  <Button variant="ghost" size="sm" onClick={handleCopyMatches} disabled={!matches.length}>
                    {copied ? 'Copied!' : 'Copy matches'}
                  </Button>
                </div>
                <pre className="p-4 text-control font-mono text-text whitespace-pre-wrap break-all max-h-60 overflow-y-auto bg-input">
                  {parts.map((part, i) =>
                    part.type === 'match' ? (
                      <mark key={i} className="bg-yellow-300/70 dark:bg-yellow-500/40 text-text rounded px-0.5">
                        {part.value}
                      </mark>
                    ) : (
                      <span key={i}>{part.value}</span>
                    )
                  )}
                </pre>
              </div>

              {matches.length > 0 && (
                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="bg-surface px-4 py-2.5 border-b border-border">
                    <h3 className="text-body-emphasis text-text">Match details</h3>
                  </div>
                  <div className="divide-y divide-border max-h-72 overflow-y-auto">
                    {matches.map((m, i) => (
                      <div key={i} className="p-3 text-control font-mono bg-input">
                        <div className="text-text">
                          <span className="text-textMuted">#{i + 1}</span> index {m.index}:{' '}
                          <span className="text-primary">{JSON.stringify(m.value)}</span>
                        </div>
                        {m.groups.length > 0 && (
                          <div className="text-textMuted mt-1">
                            groups: {m.groups.map((g, gi) => `$${gi + 1}=${JSON.stringify(g)}`).join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
