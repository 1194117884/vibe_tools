import { useState } from 'react';
import Head from 'next/head';
import { format as formatSql } from 'sql-formatter';
import { Button } from '../../../components/ui/button';

export const DIALECTS = [
  { id: 'sql', label: 'Standard SQL' },
  { id: 'mysql', label: 'MySQL' },
  { id: 'postgresql', label: 'PostgreSQL' },
  { id: 'sqlite', label: 'SQLite' },
  { id: 'mariadb', label: 'MariaDB' },
  { id: 'tsql', label: 'Transact-SQL' },
  { id: 'bigquery', label: 'BigQuery' },
  { id: 'plsql', label: 'PL/SQL' },
];

/**
 * Format SQL with sql-formatter. Pure export for tests.
 */
export function formatSqlQuery(sql, language = 'sql', tabWidth = 2) {
  if (!sql || !sql.trim()) {
    throw new Error('Enter a SQL query to format.');
  }
  return formatSql(sql, {
    language,
    tabWidth,
    keywordCase: 'upper',
    linesBetweenQueries: 2,
  });
}

/** Collapse whitespace for a rough minify. */
export function minifySql(sql) {
  if (!sql || !sql.trim()) {
    throw new Error('Enter a SQL query to minify.');
  }
  return sql
    .replace(/--[^\n]*/g, ' ')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const SAMPLE = `select u.id, u.name, count(o.id) as order_count from users u left join orders o on o.user_id = u.id where u.active = 1 and o.created_at > '2024-01-01' group by u.id, u.name having count(o.id) > 0 order by order_count desc limit 20;`;

export default function SqlTool() {
  const [input, setInput] = useState(SAMPLE);
  const [output, setOutput] = useState('');
  const [dialect, setDialect] = useState('sql');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const run = (mode) => {
    try {
      const result = mode === 'minify' ? minifySql(input) : formatSqlQuery(input, dialect);
      setOutput(result);
      setError('');
      setCopied(false);
    } catch (e) {
      setError(e.message || 'Formatting failed');
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
        <title>SQL Formatter - Vibe Tools</title>
        <meta name="description" content="Format and prettify SQL queries" />
      </Head>
      <header className="border-b border-border py-10">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="font-display text-product text-text mb-1 tracking-tight">SQL Formatter</h1>
          <p className="text-body text-textMuted">Format and minify SQL across popular dialects</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          <div>
            <label className="block text-control font-medium text-text mb-2">Dialect</label>
            <select
              value={dialect}
              onChange={(e) => setDialect(e.target.value)}
              className="w-full sm:w-64 p-3 border border-border rounded bg-input text-text focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent transition-colors duration-150"
            >
              {DIALECTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-control font-medium text-text mb-2">SQL</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste SQL here..."
              className="w-full h-48 p-4 border border-border rounded bg-input text-text font-mono text-control focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent resize-y"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => run('format')}>Format</Button>
            <Button onClick={() => run('minify')} variant="outline">
              Minify
            </Button>
            <Button
              onClick={() => {
                setInput('');
                setOutput('');
                setError('');
              }}
              variant="ghost"
            >
              Clear
            </Button>
          </div>

          {error && <div className="text-error text-control p-3 bg-errorBg rounded">{error}</div>}

          {output && (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-surface px-4 py-2.5 border-b border-border flex justify-between items-center">
                <h3 className="text-body-emphasis text-text">Result</h3>
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <pre className="p-4 text-control font-mono text-text whitespace-pre overflow-x-auto max-h-96 overflow-y-auto bg-input">
                {output}
              </pre>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
