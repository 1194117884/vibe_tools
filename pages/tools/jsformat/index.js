import { useState, useMemo, useRef } from 'react';
import Head from 'next/head';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import { Button } from '../../../components/ui/button';
import 'highlight.js/styles/atom-one-dark.css';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);

const STYLE = {
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  printWidth: 100,
};

const MINIFY_STYLE = {
  semi: false,
  singleQuote: true,
  tabWidth: 0,
  trailingComma: 'none',
  printWidth: 10000,
  bracketSpacing: false,
  arrowParens: 'avoid',
};

async function runPrettier(code, options) {
  const prettier = (await import('prettier/standalone')).default;
  const parserBabel = (await import('prettier/plugins/babel')).default;
  const parserEstree = (await import('prettier/plugins/estree')).default;

  return prettier.format(code, {
    parser: 'babel',
    plugins: [parserBabel, parserEstree],
    ...options,
  });
}

function highlightCode(code) {
  try {
    const result = hljs.highlight(code, { language: 'javascript' });
    return result.value;
  } catch {
    return code;
  }
}

function formatConsoleEntry(args) {
  return args
    .map((a) => {
      if (a === null) return 'null';
      if (a === undefined) return 'undefined';
      if (typeof a === 'object') {
        try {
          return JSON.stringify(a, null, 2);
        } catch {
          return String(a);
        }
      }
      return String(a);
    })
    .join(' ');
}

function executeCode(code) {
  const entries = [];
  const original = {};

  ['log', 'error', 'warn', 'info', 'debug'].forEach((method) => {
    original[method] = console[method];
    console[method] = (...args) => {
      entries.push({ type: method, text: formatConsoleEntry(args) });
    };
  });

  let result;
  let runtimeError;

  try {
    result = new Function(code)();
  } catch (e) {
    runtimeError = e.message;
  }

  Object.keys(original).forEach((method) => {
    console[method] = original[method];
  });

  if (result !== undefined && entries.length === 0) {
    entries.push({ type: 'log', text: formatConsoleEntry([result]) });
  }

  if (runtimeError) {
    entries.push({ type: 'error', text: runtimeError });
  }

  return entries;
}

export default function JsFormatTool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState([]);
  const consoleEndRef = useRef(null);

  const highlighted = useMemo(() => highlightCode(output), [output]);

  const handleFormat = async () => {
    setLoading(true);
    setError('');
    try {
      setOutput(await runPrettier(input, STYLE));
    } catch (e) {
      setError('Formatting error: ' + e.message);
      setOutput('');
    } finally {
      setLoading(false);
    }
  };

  const handleMinify = async () => {
    setLoading(true);
    setError('');
    try {
      setOutput(await runPrettier(input, MINIFY_STYLE));
    } catch (e) {
      setError('Minify error: ' + e.message);
      setOutput('');
    } finally {
      setLoading(false);
    }
  };

  const handleRun = () => {
    const code = output || input;
    if (!code.trim()) return;
    setError('');
    const entries = executeCode(code);
    setConsoleLogs(entries);
    setTimeout(() => {
      consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    alert('Copied to clipboard!');
  };

  const handleClearConsole = () => setConsoleLogs([]);

  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>JS Formatter - Vibe Tools</title>
        <meta name="description" content="Format, minify and run JavaScript and TypeScript code" />
      </Head>
      <header className="border-b border-border py-10">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="font-display text-product text-text mb-1 tracking-tight">JS Formatter</h1>
          <p className="text-body text-textMuted">Format, minify &amp; run JavaScript code</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="console.log('hello');"
            spellCheck={false}
            className="w-full h-60 p-4 border border-border rounded bg-input text-text placeholder:text-textDim focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent resize-y font-mono text-control transition-colors duration-150"
          />

          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleFormat} disabled={loading}>
              {loading ? 'Formatting...' : 'Format'}
            </Button>
            <Button onClick={handleMinify} variant="dark" disabled={loading}>
              Minify
            </Button>
            <Button onClick={handleRun} variant="outline" disabled={loading}>
              Run
            </Button>
          </div>

          {error && (
            <div className="text-error text-control p-3 bg-errorBg rounded">{error}</div>
          )}

          {output && (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-surface px-4 py-2.5 border-b border-border flex justify-between items-center">
                <h3 className="text-body-emphasis text-text">Result</h3>
                <Button variant="ghost" size="sm" onClick={handleCopy}>Copy</Button>
              </div>
              <pre className="hljs text-control max-h-[32rem] overflow-y-auto !px-4 !py-4 whitespace-pre-wrap break-words">
                <code dangerouslySetInnerHTML={{ __html: highlighted }} />
              </pre>
            </div>
          )}

          {consoleLogs.length > 0 && (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-surface px-4 py-2.5 border-b border-border flex justify-between items-center">
                <h3 className="text-body-emphasis text-text">Console</h3>
                <Button variant="ghost" size="sm" onClick={handleClearConsole}>Clear</Button>
              </div>
              <div className="bg-[#1e1e2e] text-control font-mono max-h-80 overflow-y-auto">
                {consoleLogs.map((entry, i) => (
                  <div
                    key={i}
                    className={`px-4 py-1.5 border-b border-[#2a2a3c] flex gap-3 ${
                      entry.type === 'error'
                        ? 'text-red-400'
                        : entry.type === 'warn'
                        ? 'text-amber-400'
                        : entry.type === 'debug'
                        ? 'text-sky-400'
                        : 'text-[#cdd6f4]'
                    }`}
                  >
                    <span className="text-[#6c7086] text-[11px] uppercase mt-px shrink-0 w-10">
                      {entry.type}
                    </span>
                    <span className="whitespace-pre-wrap break-words">{entry.text}</span>
                  </div>
                ))}
                <div ref={consoleEndRef} />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
