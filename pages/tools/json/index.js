import { useState, useRef, useCallback, useEffect } from 'react';
import Head from 'next/head';
import { Button } from '../../../components/ui/button';

const DEPTH_OPTIONS = [1, 2, 3, 4];

let jqPromise = null;
function getJq() {
  if (!jqPromise) {
    jqPromise = import('jq-web').then((m) => m.default || m);
  }
  return jqPromise;
}

function JsonNode({ name, value, depth, maxDepth, isLast }) {
  const autoExpand = maxDepth == null || depth < maxDepth;
  const [expanded, setExpanded] = useState(autoExpand);

  const isObject = value !== null && typeof value === 'object' && !Array.isArray(value);
  const isArray = Array.isArray(value);
  const isContainer = isObject || isArray;
  const entries = isObject
    ? Object.entries(value)
    : isArray
      ? value.map((v, i) => [String(i), v])
      : null;
  const count = entries ? entries.length : 0;

  const toggle = useCallback(() => setExpanded((v) => !v), []);

  const bracket = isObject ? ['{', '}'] : isArray ? ['[', ']'] : null;

  const valueClass = (v) => {
    if (v === null) return 'text-textDim';
    if (typeof v === 'string') return 'text-[#34c759]';
    if (typeof v === 'number') return 'text-[#2997ff]';
    if (typeof v === 'boolean') return 'text-[#ff9f0a]';
    return '';
  };

  if (!isContainer) {
    const displayValue = value === null ? 'null' : typeof value === 'string' ? `"${value}"` : String(value);
    return (
      <div className="flex font-mono text-control leading-relaxed">
        {name !== undefined && (
          <span className="text-text mr-1">"{name}":</span>
        )}
        <span className={valueClass(value)}>{displayValue}</span>
        {!isLast && <span className="text-textMuted">,</span>}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center font-mono text-control leading-relaxed">
        <button
          onClick={toggle}
          className="w-4 h-4 flex items-center justify-center text-textDim hover:text-text transition-colors mr-0.5 select-none flex-shrink-0"
        >
          {expanded ? '▼' : '▶'}
        </button>
        {name !== undefined && (
          <span className="text-text mr-1">"{name}":</span>
        )}
        {expanded ? (
          <span className="text-textMuted">{bracket[0]}</span>
        ) : (
          <span className="text-textMuted cursor-pointer hover:text-text transition-colors" onClick={toggle}>
            {bracket[0]} {count} {isObject ? 'key' : 'item'}{count !== 1 ? 's' : ''} {bracket[1]}
          </span>
        )}
      </div>
      {expanded && (
        <>
          <div style={{ paddingLeft: 20 }}>
            {entries.map(([k, v], i) => (
              <JsonNode
                key={k}
                name={isArray ? undefined : k}
                value={v}
                depth={depth + 1}
                maxDepth={maxDepth}
                isLast={i === entries.length - 1}
              />
            ))}
          </div>
          <div className="font-mono text-control leading-relaxed">
            <span className="text-textMuted">{bracket[1]}</span>
            {!isLast && <span className="text-textMuted">,</span>}
          </div>
        </>
      )}
    </div>
  );
}

export default function JsonTool() {
  const textareaRef = useRef(null);
  const getInput = () => textareaRef.current?.value || '';
  const setTextareaValue = (val) => {
    if (textareaRef.current) textareaRef.current.value = val;
  };

  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formatted, setFormatted] = useState(true);
  const [depth, setDepth] = useState(null);
  const [showView, setShowView] = useState(false);
  const [treeKey, setTreeKey] = useState(0);
  const [query, setQuery] = useState('');
  const [queryResult, setQueryResult] = useState(null);
  const [queryError, setQueryError] = useState('');
  const [queryRunning, setQueryRunning] = useState(false);

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 2000);
  };

  const parseAndApply = (mode) => {
    const value = getInput();
    if (!value.trim()) return;
    try {
      const parsed = JSON.parse(value);
      setTextareaValue(JSON.stringify(parsed, null, mode === 'format' ? 2 : 0));
      setParsedData(parsed);
      setFormatted(mode === 'format');
      setError('');
      setShowView(true);
      setTreeKey((k) => k + 1);
    } catch (e) {
      setError('Invalid JSON: ' + e.message);
    }
  };

  const handleFormat = () => parseAndApply('format');
  const handleMinify = () => parseAndApply('minify');

  const handleDepth = (d) => {
    setDepth(d === depth ? null : d);
    setTreeKey((k) => k + 1);
  };

  const handleValidate = () => {
    const value = getInput();
    if (!value.trim()) return;
    try {
      JSON.parse(value);
      setError('');
      showSuccess('Valid JSON');
    } catch (e) {
      setError('Invalid JSON: ' + e.message);
    }
  };

  const handleCopy = () => {
    const value = getInput();
    if (!value.trim()) return;
    navigator.clipboard.writeText(value);
    showSuccess('Copied to clipboard!');
  };

  const handleClear = () => {
    setTextareaValue('');
    setParsedData(null);
    setError('');
    setSuccess('');
    setShowView(false);
  };

  const handleRunQuery = useCallback(async () => {
    const value = getInput();
    if (!query.trim() || !value.trim()) return;
    setQueryRunning(true);
    setQueryError('');
    setQueryResult(null);
    try {
      const jq = await getJq();
      const result = jq.raw(value, query.trim());
      setQueryResult(result);
    } catch (e) {
      if (e.message?.includes('JSON') || e.stderr?.includes('parse error')) {
        setQueryError('Invalid JSON input');
      } else {
        setQueryError(e.message || String(e));
      }
    } finally {
      setQueryRunning(false);
    }
  }, [query]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunQuery();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleRunQuery]);

  const isMac = typeof navigator !== 'undefined' && navigator.platform?.includes('Mac');

  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>JSON Formatter - Vibe Tools</title>
        <meta name="description" content="Format, validate and minify JSON" />
      </Head>
      <header className="border-b border-border py-10">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="font-display text-product text-text mb-1 tracking-tight">JSON Formatter</h1>
          <p className="text-body text-textMuted">Format, validate and minify JSON</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          <textarea
            ref={textareaRef}
            defaultValue=""
            placeholder='Paste your JSON here...'
            wrap="off"
            className="w-full h-[400px] p-4 border border-border rounded bg-input text-text placeholder:text-textDim focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent resize-y font-mono text-control transition-colors duration-150 whitespace-pre overflow-x-auto"
          />

          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="jq filter...  (e.g. .users[].name)"
                className="w-full px-3 py-2 border border-border rounded bg-input text-text placeholder:text-textDim focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent font-mono text-control transition-colors duration-150"
              />
              <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-micro text-textDim bg-surface px-1.5 py-0.5 rounded border border-border hidden sm:inline-block">
                {isMac ? '⌘' : 'Ctrl'}+Enter
              </kbd>
            </div>
            <Button onClick={handleRunQuery} disabled={queryRunning} variant="primary">
              {queryRunning ? 'Running...' : 'Run'}
            </Button>
          </div>

          {(queryResult !== null || queryError) && (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-surface px-4 py-2.5 border-b border-border flex justify-between items-center">
                <h3 className="text-body-emphasis text-text">Query Results</h3>
                <button
                  onClick={() => { setQueryResult(null); setQueryError(''); }}
                  className="text-micro text-textMuted hover:text-text transition-colors"
                >
                  Clear
                </button>
              </div>
              <div className="p-4 bg-input">
                {queryError ? (
                  <div className="text-error text-control">{queryError}</div>
                ) : queryResult == null || queryResult === '' ? (
                  <div className="text-textMuted text-control">No results</div>
                ) : (
                  <pre className="font-mono text-control text-text whitespace-pre overflow-x-auto">
                    {queryResult}
                  </pre>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2 flex-wrap items-center">
            <div className="inline-flex rounded border border-border overflow-hidden">
              <button
                onClick={handleFormat}
                className={`px-4 py-2 text-control font-medium transition-colors duration-150 ${formatted ? 'bg-primary text-primaryText' : 'bg-transparent text-textMuted hover:bg-surfaceHover'}`}
              >
                Formatted
              </button>
              <button
                onClick={handleMinify}
                className={`px-4 py-2 text-control font-medium transition-colors duration-150 ${!formatted ? 'bg-primary text-primaryText' : 'bg-transparent text-textMuted hover:bg-surfaceHover'}`}
              >
                Minified
              </button>
            </div>
            <div className="w-px h-6 bg-border mx-1" />
            <span className="text-micro text-textMuted font-medium">Expand to</span>
            <div className="inline-flex rounded border border-border overflow-hidden">
              {DEPTH_OPTIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => handleDepth(d)}
                  className={`px-3 py-2 text-control font-medium transition-colors duration-150 ${depth === d ? 'bg-primary text-primaryText' : 'bg-transparent text-textMuted hover:bg-surfaceHover'}`}
                >
                  {d}
                </button>
              ))}
              <button
                onClick={() => handleDepth(null)}
                className={`px-3 py-2 text-control font-medium transition-colors duration-150 ${depth === null ? 'bg-primary text-primaryText' : 'bg-transparent text-textMuted hover:bg-surfaceHover'}`}
              >
                All
              </button>
            </div>
            <div className="w-px h-6 bg-border mx-1" />
            <Button onClick={handleValidate} variant="outline">Validate</Button>
            <Button onClick={handleCopy} variant="ghost">Copy</Button>
            <Button onClick={handleClear} variant="ghost">Clear</Button>
          </div>

          {error && (
            <div className="text-error text-control p-3 bg-errorBg rounded">{error}</div>
          )}

          {success && (
            <div className="text-success text-control p-3 bg-successBg rounded">{success}</div>
          )}

          {parsedData && (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-surface px-4 py-2.5 border-b border-border flex justify-between items-center">
                <h3 className="text-body-emphasis text-text">Tree View</h3>
                <button
                  onClick={() => { setShowView(false); setParsedData(null); }}
                  className="text-micro text-textMuted hover:text-text transition-colors"
                >
                  Hide
                </button>
              </div>
              <div className="p-4 text-control max-h-96 overflow-y-auto bg-input">
                <div key={treeKey}>
                  <JsonNode
                    name={undefined}
                    value={parsedData}
                    depth={0}
                    maxDepth={depth}
                    isLast={true}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
