import { useMemo, useState } from 'react';
import Head from 'next/head';
import { Button } from '../../../components/ui/button';

/**
 * Parse a URL string into structured parts. Accepts bare hosts by prefixing https://.
 */
export function parseUrl(raw) {
  const trimmed = (raw || '').trim();
  if (!trimmed) throw new Error('Enter a URL to parse.');

  let url;
  try {
    url = new URL(trimmed);
  } catch {
    try {
      url = new URL(`https://${trimmed}`);
    } catch {
      throw new Error('Invalid URL.');
    }
  }

  const query = [];
  url.searchParams.forEach((value, key) => {
    query.push({ key, value });
  });

  return {
    href: url.href,
    protocol: url.protocol.replace(/:$/, ''),
    username: url.username,
    password: url.password,
    hostname: url.hostname,
    port: url.port || defaultPort(url.protocol),
    host: url.host,
    pathname: url.pathname,
    search: url.search,
    hash: url.hash,
    origin: url.origin,
    query,
  };
}

function defaultPort(protocol) {
  if (protocol === 'https:') return '443 (default)';
  if (protocol === 'http:') return '80 (default)';
  return '';
}

const SAMPLE = 'https://user:pass@example.com:8443/path/to/page?foo=1&bar=hello%20world&foo=2#section';

export default function UrlParserTool() {
  const [input, setInput] = useState(SAMPLE);
  const [copied, setCopied] = useState('');

  const result = useMemo(() => {
    try {
      return { data: parseUrl(input), error: null };
    } catch (e) {
      return { data: null, error: e.message };
    }
  }, [input]);

  const fields = result.data
    ? [
        ['Full URL', result.data.href],
        ['Protocol', result.data.protocol],
        ['Username', result.data.username || '—'],
        ['Password', result.data.password || '—'],
        ['Hostname', result.data.hostname],
        ['Port', result.data.port || '—'],
        ['Host', result.data.host],
        ['Origin', result.data.origin],
        ['Pathname', result.data.pathname],
        ['Search', result.data.search || '—'],
        ['Hash', result.data.hash || '—'],
      ]
    : [];

  const handleCopy = async (key, value) => {
    if (!value || value === '—') return;
    await navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(''), 1200);
  };

  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>URL Parser - Vibe Tools</title>
        <meta name="description" content="Parse URLs into host, path, query parameters and more" />
      </Head>
      <header className="border-b border-border py-10">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="font-display text-product text-text mb-1 tracking-tight">URL Parser</h1>
          <p className="text-body text-textMuted">Break a URL into protocol, host, path, query and hash</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          <div>
            <label className="block text-control font-medium text-text mb-2">URL</label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="https://example.com/path?q=1"
              className="w-full p-3 border border-border rounded bg-input text-text font-mono focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent transition-colors duration-150"
            />
          </div>

          {result.error && (
            <div className="text-error text-control p-3 bg-errorBg rounded">{result.error}</div>
          )}

          {result.data && (
            <>
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="bg-surface px-4 py-2.5 border-b border-border">
                  <h3 className="text-body-emphasis text-text">Parts</h3>
                </div>
                <table className="w-full text-control">
                  <tbody>
                    {fields.map(([label, value]) => (
                      <tr key={label} className="border-t border-border bg-input">
                        <td className="px-4 py-2.5 text-textMuted w-1/3">{label}</td>
                        <td className="px-4 py-2.5 font-mono text-text break-all">{value}</td>
                        <td className="px-2 py-2.5 w-20 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(label, value)}
                            disabled={!value || value === '—'}
                          >
                            {copied === label ? 'Copied' : 'Copy'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border border-border rounded-lg overflow-hidden">
                <div className="bg-surface px-4 py-2.5 border-b border-border">
                  <h3 className="text-body-emphasis text-text">
                    Query params ({result.data.query.length})
                  </h3>
                </div>
                {result.data.query.length === 0 ? (
                  <p className="p-4 text-control text-textMuted bg-input">No query parameters.</p>
                ) : (
                  <table className="w-full text-control">
                    <thead className="bg-surface border-b border-border">
                      <tr>
                        <th className="text-left px-4 py-2 font-medium text-textMuted">Key</th>
                        <th className="text-left px-4 py-2 font-medium text-textMuted">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.data.query.map((q, i) => (
                        <tr key={`${q.key}-${i}`} className="border-t border-border bg-input">
                          <td className="px-4 py-2 font-mono text-text">{q.key}</td>
                          <td className="px-4 py-2 font-mono text-text break-all">{q.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
