import { useState } from 'react';
import Head from 'next/head';
import { Button } from '../../../components/ui/button';

/**
 * Escape a CSV field (RFC 4180 style).
 */
export function escapeCsvField(value) {
  if (value == null) return '';
  const str =
    typeof value === 'object' ? JSON.stringify(value) : String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Convert JSON (array of objects, or single object) to CSV string.
 */
export function jsonToCsv(jsonText, { delimiter = ',', includeHeader = true } = {}) {
  if (!jsonText || !String(jsonText).trim()) {
    throw new Error('Enter JSON to convert.');
  }

  let data = JSON.parse(jsonText);

  if (data == null) throw new Error('JSON is null.');

  if (!Array.isArray(data)) {
    if (typeof data === 'object') data = [data];
    else throw new Error('JSON must be an array or an object.');
  }

  if (data.length === 0) {
    return includeHeader ? '' : '';
  }

  // Collect union of keys (stable order: first-seen)
  const keys = [];
  const seen = new Set();
  for (const row of data) {
    if (row == null || typeof row !== 'object' || Array.isArray(row)) {
      throw new Error('Each array item must be a plain object.');
    }
    for (const k of Object.keys(row)) {
      if (!seen.has(k)) {
        seen.add(k);
        keys.push(k);
      }
    }
  }

  if (keys.length === 0) {
    throw new Error('No object keys found to use as columns.');
  }

  const lines = [];
  if (includeHeader) {
    lines.push(keys.map(escapeCsvField).join(delimiter));
  }

  for (const row of data) {
    lines.push(keys.map((k) => escapeCsvField(row[k])).join(delimiter));
  }

  return lines.join('\n');
}

const SAMPLE = `[
  { "id": 1, "name": "Ada", "role": "Engineer", "active": true },
  { "id": 2, "name": "Grace", "role": "Admiral", "active": false },
  { "id": 3, "name": "Lin, Torvalds", "role": "Kernel", "note": "quoted, comma" }
]`;

export default function JsonCsvTool() {
  const [input, setInput] = useState(SAMPLE);
  const [output, setOutput] = useState('');
  const [delimiter, setDelimiter] = useState(',');
  const [includeHeader, setIncludeHeader] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleConvert = () => {
    try {
      const csv = jsonToCsv(input, { delimiter, includeHeader });
      setOutput(csv);
      setError('');
      setCopied(false);
    } catch (e) {
      setError(e.message || 'Conversion failed');
      setOutput('');
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>JSON → CSV - Vibe Tools</title>
        <meta name="description" content="Convert JSON arrays to CSV" />
      </Head>
      <header className="border-b border-border py-10">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="font-display text-product text-text mb-1 tracking-tight">JSON → CSV</h1>
          <p className="text-body text-textMuted">Convert an array of objects into CSV</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          <div>
            <label className="block text-control font-medium text-text mb-2">JSON</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-52 p-4 border border-border rounded bg-input text-text font-mono text-control focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent resize-y"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-micro font-medium text-textMuted mb-1">Delimiter</label>
              <select
                value={delimiter}
                onChange={(e) => setDelimiter(e.target.value)}
                className="p-2 border border-border rounded bg-input text-text text-control focus:outline-none focus:ring-2 focus:ring-focus-ring"
              >
                <option value=",">Comma (,)</option>
                <option value=";">Semicolon (;)</option>
                <option value={'\t'}>Tab</option>
              </select>
            </div>
            <label className="inline-flex items-center gap-2 text-control text-text cursor-pointer mt-5">
              <input
                type="checkbox"
                checked={includeHeader}
                onChange={(e) => setIncludeHeader(e.target.checked)}
                className="h-4 w-4 accent-[var(--primary)]"
              />
              Include header row
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleConvert}>Convert</Button>
            <Button onClick={handleCopy} variant="outline" disabled={!output}>
              {copied ? 'Copied!' : 'Copy CSV'}
            </Button>
            <Button onClick={handleDownload} variant="ghost" disabled={!output}>
              Download .csv
            </Button>
          </div>

          {error && <div className="text-error text-control p-3 bg-errorBg rounded">{error}</div>}

          {output !== '' && (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-surface px-4 py-2.5 border-b border-border">
                <h3 className="text-body-emphasis text-text">CSV</h3>
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
