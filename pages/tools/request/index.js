import { useMemo, useState } from 'react';
import Head from 'next/head';
import { Button } from '../../../components/ui/button';
import { buildBody, buildCurl, buildUrl, parseRequestInput } from '../../../utils/requestParser';

const emptyRequest = {
  method: 'GET',
  protocol: 'https',
  host: '',
  path: '/',
  query: [],
  headers: [],
  body: '',
  bodyParams: [],
};

function newRow() {
  return { key: '', value: '', enabled: true };
}

function EditableRows({ title, rows, onChange, onAdd }) {
  const updateRow = (index, patch) => {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const removeRow = (index) => {
    onChange(rows.filter((_, i) => i !== index));
  };

  return (
    <section className="border border-border rounded-lg overflow-hidden bg-background">
      <div className="px-4 py-3 border-b border-border bg-surface flex items-center justify-between">
        <h2 className="text-body-emphasis text-text">{title}</h2>
        <Button type="button" size="sm" variant="ghost" onClick={onAdd}>Add</Button>
      </div>
      <div className="divide-y divide-border">
        {rows.length === 0 && (
          <div className="px-4 py-4 text-control text-textMuted">No entries</div>
        )}
        {rows.map((row, index) => (
          <div key={`${title}-${index}`} className="grid grid-cols-[32px_1fr_1fr_40px] gap-2 px-3 py-2 items-center">
            <input
              type="checkbox"
              checked={row.enabled !== false}
              onChange={(e) => updateRow(index, { enabled: e.target.checked })}
              className="h-4 w-4"
              aria-label={`Enable ${row.key || title} row`}
            />
            <input
              value={row.key}
              onChange={(e) => updateRow(index, { key: e.target.value })}
              placeholder="key"
              className="min-w-0 px-3 py-2 rounded border border-border bg-input text-text font-mono text-control focus:outline-none focus:ring-2 focus:ring-focus-ring"
            />
            <input
              value={row.value}
              onChange={(e) => updateRow(index, { value: e.target.value })}
              placeholder="value"
              className="min-w-0 px-3 py-2 rounded border border-border bg-input text-text font-mono text-control focus:outline-none focus:ring-2 focus:ring-focus-ring"
            />
            <button
              type="button"
              onClick={() => removeRow(index)}
              className="h-9 w-9 rounded text-textDim hover:text-error hover:bg-surfaceHover transition-colors"
              aria-label={`Delete ${row.key || title} row`}
              title="Delete"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function RequestTool() {
  const [input, setInput] = useState('');
  const [request, setRequest] = useState(emptyRequest);
  const [original, setOriginal] = useState(emptyRequest);
  const [error, setError] = useState('');

  const rebuiltUrl = useMemo(() => {
    try {
      return request.host ? buildUrl(request) : '';
    } catch {
      return '';
    }
  }, [request]);

  const rebuiltBody = useMemo(() => buildBody(request), [request]);
  const rebuiltCurl = useMemo(() => {
    try {
      return request.host ? buildCurl(request) : '';
    } catch {
      return '';
    }
  }, [request]);

  const parseInput = () => {
    try {
      const parsed = parseRequestInput(input);
      setRequest(parsed);
      setOriginal(parsed);
      setError('');
    } catch (err) {
      setError(err.message || 'Parse failed');
    }
  };

  const resetChanges = () => {
    setRequest(original);
  };

  const clearAll = () => {
    setInput('');
    setRequest(emptyRequest);
    setOriginal(emptyRequest);
    setError('');
  };

  const copyText = async (text) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const updateRequest = (patch) => {
    setRequest((current) => ({ ...current, ...patch }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>Request Builder - Vibe Tools</title>
        <meta name="description" content="Parse curl requests and rebuild URLs" />
      </Head>

      <header className="border-b border-border py-10">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="font-display text-product text-text mb-1 tracking-tight">Request Builder</h1>
          <p className="text-body text-textMuted">Parse curl, edit request parts, and rebuild clean output</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_380px] gap-6 items-start">
          <div className="space-y-6">
            <section className="border border-border rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-surface flex items-center justify-between">
                <h2 className="text-body-emphasis text-text">Input</h2>
                <div className="flex gap-2">
                  <Button type="button" size="sm" onClick={parseInput}>Parse</Button>
                  <Button type="button" size="sm" variant="ghost" onClick={clearAll}>Clear</Button>
                </div>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste curl, URL, headers, or request body..."
                className="w-full h-56 p-4 bg-input text-text placeholder:text-textDim font-mono text-control resize-y focus:outline-none"
              />
            </section>

            {error && (
              <div className="text-error text-control p-3 bg-errorBg rounded">{error}</div>
            )}

            <section className="border border-border rounded-lg overflow-hidden bg-background">
              <div className="px-4 py-3 border-b border-border bg-surface flex items-center justify-between">
                <h2 className="text-body-emphasis text-text">URL</h2>
                <Button type="button" size="sm" variant="outline" onClick={resetChanges}>取消修改</Button>
              </div>
              <div className="grid md:grid-cols-[120px_1fr] gap-3 p-4">
                <label className="text-control text-textMuted">Method</label>
                <input
                  value={request.method}
                  onChange={(e) => updateRequest({ method: e.target.value.toUpperCase() })}
                  className="px-3 py-2 rounded border border-border bg-input text-text font-mono text-control focus:outline-none focus:ring-2 focus:ring-focus-ring"
                />
                <label className="text-control text-textMuted">Protocol</label>
                <input
                  value={request.protocol}
                  onChange={(e) => updateRequest({ protocol: e.target.value.replace(':', '') })}
                  className="px-3 py-2 rounded border border-border bg-input text-text font-mono text-control focus:outline-none focus:ring-2 focus:ring-focus-ring"
                />
                <label className="text-control text-textMuted">Host</label>
                <input
                  value={request.host}
                  onChange={(e) => updateRequest({ host: e.target.value })}
                  className="px-3 py-2 rounded border border-border bg-input text-text font-mono text-control focus:outline-none focus:ring-2 focus:ring-focus-ring"
                />
                <label className="text-control text-textMuted">Path</label>
                <input
                  value={request.path}
                  onChange={(e) => updateRequest({ path: e.target.value || '/' })}
                  className="px-3 py-2 rounded border border-border bg-input text-text font-mono text-control focus:outline-none focus:ring-2 focus:ring-focus-ring"
                />
              </div>
            </section>

            <EditableRows
              title="Query Parameters"
              rows={request.query}
              onChange={(query) => updateRequest({ query })}
              onAdd={() => updateRequest({ query: [...request.query, newRow()] })}
            />

            <EditableRows
              title="Headers"
              rows={request.headers}
              onChange={(headers) => updateRequest({ headers })}
              onAdd={() => updateRequest({ headers: [...request.headers, newRow()] })}
            />

            <EditableRows
              title="Data Parameters"
              rows={request.bodyParams}
              onChange={(bodyParams) => updateRequest({ bodyParams })}
              onAdd={() => updateRequest({ bodyParams: [...request.bodyParams, newRow()] })}
            />

            <section className="border border-border rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-surface">
                <h2 className="text-body-emphasis text-text">Raw Data</h2>
              </div>
              <textarea
                value={request.body}
                onChange={(e) => updateRequest({ body: e.target.value, bodyParams: [] })}
                placeholder="Raw request body"
                className="w-full h-32 p-4 bg-input text-text placeholder:text-textDim font-mono text-control resize-y focus:outline-none"
              />
            </section>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-6">
            <section className="border border-border rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-surface flex items-center justify-between">
                <h2 className="text-body-emphasis text-text">Rebuilt URL</h2>
                <Button type="button" size="sm" variant="ghost" onClick={() => copyText(rebuiltUrl)}>Copy</Button>
              </div>
              <pre className="p-4 min-h-24 max-h-64 overflow-auto bg-input text-text font-mono text-control whitespace-pre-wrap break-all">
                {rebuiltUrl}
              </pre>
            </section>

            {rebuiltBody && (
              <section className="border border-border rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-surface flex items-center justify-between">
                  <h2 className="text-body-emphasis text-text">Rebuilt Data</h2>
                  <Button type="button" size="sm" variant="ghost" onClick={() => copyText(rebuiltBody)}>Copy</Button>
                </div>
                <pre className="p-4 max-h-48 overflow-auto bg-input text-text font-mono text-control whitespace-pre-wrap break-all">
                  {rebuiltBody}
                </pre>
              </section>
            )}

            <section className="border border-border rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-surface flex items-center justify-between">
                <h2 className="text-body-emphasis text-text">Rebuilt curl</h2>
                <Button type="button" size="sm" variant="ghost" onClick={() => copyText(rebuiltCurl)}>Copy</Button>
              </div>
              <pre className="p-4 min-h-40 max-h-[520px] overflow-auto bg-input text-text font-mono text-control whitespace-pre-wrap break-all">
                {rebuiltCurl}
              </pre>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
