import { useMemo, useState } from 'react';
import Head from 'next/head';
import { Button } from '../../../components/ui/button';

/**
 * Line-based LCS diff. Returns array of { type: 'equal'|'add'|'remove', text, leftLine?, rightLine? }
 */
export function diffLines(leftText, rightText) {
  const left = leftText.split('\n');
  const right = rightText.split('\n');
  const n = left.length;
  const m = right.length;

  // LCS DP table
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i -= 1) {
    for (let j = m - 1; j >= 0; j -= 1) {
      if (left[i] === right[j]) dp[i][j] = dp[i + 1][j + 1] + 1;
      else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const rows = [];
  let i = 0;
  let j = 0;
  let leftLine = 1;
  let rightLine = 1;

  while (i < n && j < m) {
    if (left[i] === right[j]) {
      rows.push({ type: 'equal', text: left[i], leftLine, rightLine });
      i += 1;
      j += 1;
      leftLine += 1;
      rightLine += 1;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      rows.push({ type: 'remove', text: left[i], leftLine });
      i += 1;
      leftLine += 1;
    } else {
      rows.push({ type: 'add', text: right[j], rightLine });
      j += 1;
      rightLine += 1;
    }
  }
  while (i < n) {
    rows.push({ type: 'remove', text: left[i], leftLine });
    i += 1;
    leftLine += 1;
  }
  while (j < m) {
    rows.push({ type: 'add', text: right[j], rightLine });
    j += 1;
    rightLine += 1;
  }

  return rows;
}

export function summarizeDiff(rows) {
  return rows.reduce(
    (acc, r) => {
      if (r.type === 'add') acc.added += 1;
      else if (r.type === 'remove') acc.removed += 1;
      else acc.equal += 1;
      return acc;
    },
    { added: 0, removed: 0, equal: 0 }
  );
}

const SAMPLE_LEFT = `function greet(name) {
  return 'Hello, ' + name;
}

console.log(greet('world'));`;

const SAMPLE_RIGHT = `function greet(name) {
  return \`Hello, \${name}!\`;
}

// Log greeting
console.log(greet('vibe'));`;

const rowClass = {
  equal: 'bg-input text-text',
  add: 'bg-green-500/15 text-green-700 dark:text-green-300',
  remove: 'bg-red-500/15 text-red-700 dark:text-red-300',
};

const prefix = { equal: ' ', add: '+', remove: '-' };

export default function TextDiffTool() {
  const [left, setLeft] = useState(SAMPLE_LEFT);
  const [right, setRight] = useState(SAMPLE_RIGHT);

  const rows = useMemo(() => diffLines(left, right), [left, right]);
  const summary = useMemo(() => summarizeDiff(rows), [rows]);

  const handleSwap = () => {
    setLeft(right);
    setRight(left);
  };

  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>Text Diff - Vibe Tools</title>
        <meta name="description" content="Compare two texts line by line" />
      </Head>
      <header className="border-b border-border py-10">
        <div className="max-w-5xl mx-auto px-6">
          <h1 className="font-display text-product text-text mb-1 tracking-tight">Text Diff</h1>
          <p className="text-body text-textMuted">Compare two texts and highlight line changes</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-control font-medium text-text mb-2">Original</label>
              <textarea
                value={left}
                onChange={(e) => setLeft(e.target.value)}
                className="w-full h-52 p-4 border border-border rounded bg-input text-text font-mono text-control focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent resize-y"
              />
            </div>
            <div>
              <label className="block text-control font-medium text-text mb-2">Modified</label>
              <textarea
                value={right}
                onChange={(e) => setRight(e.target.value)}
                className="w-full h-52 p-4 border border-border rounded bg-input text-text font-mono text-control focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent resize-y"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={handleSwap} variant="outline" size="sm">
              Swap left ↔ right
            </Button>
            <span className="text-control text-textMuted">
              <span className="text-green-600 dark:text-green-400">+{summary.added}</span>
              {' / '}
              <span className="text-red-600 dark:text-red-400">−{summary.removed}</span>
              {' / '}
              {summary.equal} unchanged
            </span>
          </div>

          <div className="border border-border rounded-lg overflow-hidden">
            <div className="bg-surface px-4 py-2.5 border-b border-border">
              <h3 className="text-body-emphasis text-text">Diff</h3>
            </div>
            <pre className="text-control font-mono max-h-[28rem] overflow-auto">
              {rows.map((row, idx) => (
                <div key={idx} className={`px-3 py-0.5 whitespace-pre-wrap break-all ${rowClass[row.type]}`}>
                  <span className="inline-block w-5 select-none opacity-70">{prefix[row.type]}</span>
                  <span className="inline-block w-10 text-textMuted select-none text-right mr-2">
                    {row.leftLine ?? ''}
                  </span>
                  <span className="inline-block w-10 text-textMuted select-none text-right mr-3">
                    {row.rightLine ?? ''}
                  </span>
                  {row.text || ' '}
                </div>
              ))}
            </pre>
          </div>
        </div>
      </main>
    </div>
  );
}
