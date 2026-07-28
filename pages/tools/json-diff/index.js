import { useMemo, useState } from 'react';
import Head from 'next/head';
import { Button } from '../../../components/ui/button';

export function parseJson(text) {
  return JSON.parse(text);
}

/**
 * Deep-diff two JSON values. Returns a flat list of change records.
 * path uses JSONPath-like notation: $.a.b[0]
 */
export function diffJson(left, right, path = '$') {
  const changes = [];

  if (Object.is(left, right)) return changes;

  const leftType = left === null ? 'null' : Array.isArray(left) ? 'array' : typeof left;
  const rightType = right === null ? 'null' : Array.isArray(right) ? 'array' : typeof right;

  if (leftType !== rightType) {
    changes.push({ type: 'changed', path, left, right });
    return changes;
  }

  if (leftType !== 'object' && leftType !== 'array') {
    changes.push({ type: 'changed', path, left, right });
    return changes;
  }

  if (leftType === 'array') {
    const max = Math.max(left.length, right.length);
    for (let i = 0; i < max; i += 1) {
      const p = `${path}[${i}]`;
      if (i >= left.length) {
        changes.push({ type: 'added', path: p, right: right[i] });
      } else if (i >= right.length) {
        changes.push({ type: 'removed', path: p, left: left[i] });
      } else {
        changes.push(...diffJson(left[i], right[i], p));
      }
    }
    return changes;
  }

  const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
  for (const key of [...keys].sort()) {
    const p = path === '$' ? `$.${key}` : `${path}.${key}`;
    if (!(key in left)) {
      changes.push({ type: 'added', path: p, right: right[key] });
    } else if (!(key in right)) {
      changes.push({ type: 'removed', path: p, left: left[key] });
    } else {
      changes.push(...diffJson(left[key], right[key], p));
    }
  }
  return changes;
}

const SAMPLE_LEFT = `{
  "name": "vibe-tools",
  "version": "1.0.0",
  "features": ["json", "base64"],
  "active": true
}`;

const SAMPLE_RIGHT = `{
  "name": "vibe-tools",
  "version": "1.1.0",
  "features": ["json", "base64", "regex"],
  "active": true,
  "author": "you"
}`;

export default function JsonDiffTool() {
  const [leftText, setLeftText] = useState(SAMPLE_LEFT);
  const [rightText, setRightText] = useState(SAMPLE_RIGHT);

  const result = useMemo(() => {
    try {
      const left = parseJson(leftText);
      const right = parseJson(rightText);
      const changes = diffJson(left, right);
      return { changes, error: null };
    } catch (e) {
      return { changes: [], error: e.message };
    }
  }, [leftText, rightText]);

  const typeStyles = {
    added: 'text-green-600 dark:text-green-400',
    removed: 'text-red-600 dark:text-red-400',
    changed: 'text-amber-600 dark:text-amber-400',
  };

  const handleSwap = () => {
    setLeftText(rightText);
    setRightText(leftText);
  };

  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>JSON Diff - Vibe Tools</title>
        <meta name="description" content="Compare two JSON objects and list differences" />
      </Head>
      <header className="border-b border-border py-10">
        <div className="max-w-5xl mx-auto px-6">
          <h1 className="font-display text-product text-text mb-1 tracking-tight">JSON Diff</h1>
          <p className="text-body text-textMuted">Compare two JSON documents and see what changed</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-control font-medium text-text mb-2">Original (left)</label>
              <textarea
                value={leftText}
                onChange={(e) => setLeftText(e.target.value)}
                className="w-full h-64 p-4 border border-border rounded bg-input text-text font-mono text-control focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent resize-y"
              />
            </div>
            <div>
              <label className="block text-control font-medium text-text mb-2">Modified (right)</label>
              <textarea
                value={rightText}
                onChange={(e) => setRightText(e.target.value)}
                className="w-full h-64 p-4 border border-border rounded bg-input text-text font-mono text-control focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent resize-y"
              />
            </div>
          </div>

          <Button onClick={handleSwap} variant="outline" size="sm">
            Swap left ↔ right
          </Button>

          {result.error && (
            <div className="text-error text-control p-3 bg-errorBg rounded">Parse error: {result.error}</div>
          )}

          {!result.error && (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-surface px-4 py-2.5 border-b border-border">
                <h3 className="text-body-emphasis text-text">
                  {result.changes.length === 0
                    ? 'No differences'
                    : `${result.changes.length} difference${result.changes.length === 1 ? '' : 's'}`}
                </h3>
              </div>
              {result.changes.length === 0 ? (
                <p className="p-4 text-control text-textMuted bg-input">Both sides are equal.</p>
              ) : (
                <ul className="divide-y divide-border max-h-96 overflow-y-auto bg-input">
                  {result.changes.map((c, i) => (
                    <li key={i} className="p-3 text-control font-mono">
                      <span className={`font-semibold uppercase text-micro mr-2 ${typeStyles[c.type]}`}>
                        {c.type}
                      </span>
                      <span className="text-text">{c.path}</span>
                      {c.type === 'changed' && (
                        <div className="mt-1 text-textMuted pl-4">
                          <div className="text-red-600 dark:text-red-400">− {JSON.stringify(c.left)}</div>
                          <div className="text-green-600 dark:text-green-400">+ {JSON.stringify(c.right)}</div>
                        </div>
                      )}
                      {c.type === 'added' && (
                        <div className="mt-1 text-green-600 dark:text-green-400 pl-4">
                          + {JSON.stringify(c.right)}
                        </div>
                      )}
                      {c.type === 'removed' && (
                        <div className="mt-1 text-red-600 dark:text-red-400 pl-4">
                          − {JSON.stringify(c.left)}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
