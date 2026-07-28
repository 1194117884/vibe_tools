import { useState } from 'react';
import Head from 'next/head';
import { Button } from '../../../components/ui/button';

const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

export function generateUuidV4(cryptoSource = globalThis.crypto) {
  if (cryptoSource?.randomUUID) {
    return cryptoSource.randomUUID();
  }
  const bytes = new Uint8Array(16);
  cryptoSource.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function generateUlid(now = Date.now(), cryptoSource = globalThis.crypto) {
  let time = Math.max(0, Math.floor(now));
  let timePart = '';
  for (let i = 0; i < 10; i += 1) {
    timePart = CROCKFORD[time % 32] + timePart;
    time = Math.floor(time / 32);
  }

  const randomBytes = new Uint8Array(10);
  cryptoSource.getRandomValues(randomBytes);
  let randomPart = '';
  for (let i = 0; i < 16; i += 1) {
    // Use 5 bits from the random stream for Crockford base32
    const value = randomBytes[i % 10] ^ (randomBytes[(i + 3) % 10] << (i % 3));
    randomPart += CROCKFORD[value % 32];
  }

  return timePart + randomPart;
}

export default function UuidTool() {
  const [type, setType] = useState('uuid');
  const [count, setCount] = useState(5);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    try {
      const n = Math.min(100, Math.max(1, Number(count) || 1));
      const lines = Array.from({ length: n }, () =>
        type === 'ulid' ? generateUlid() : generateUuidV4()
      );
      setOutput(lines.join('\n'));
      setError('');
      setCopied(false);
    } catch (e) {
      setError('Generation failed: ' + e.message);
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
        <title>UUID / ULID - Vibe Tools</title>
        <meta name="description" content="Generate UUID v4 and ULID identifiers" />
      </Head>
      <header className="border-b border-border py-10">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="font-display text-product text-text mb-1 tracking-tight">UUID / ULID</h1>
          <p className="text-body text-textMuted">Generate unique identifiers for systems and databases</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-control font-medium text-text mb-2">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full p-3 border border-border rounded bg-input text-text focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent transition-colors duration-150"
              >
                <option value="uuid">UUID v4</option>
                <option value="ulid">ULID</option>
              </select>
            </div>
            <div>
              <label className="block text-control font-medium text-text mb-2">Count (1–100)</label>
              <input
                type="number"
                min={1}
                max={100}
                value={count}
                onChange={(e) => setCount(e.target.value)}
                className="w-full p-3 border border-border rounded bg-input text-text focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent transition-colors duration-150"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleGenerate}>Generate</Button>
            <Button onClick={handleCopy} variant="ghost" disabled={!output}>
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>

          {error && (
            <div className="text-error text-control p-3 bg-errorBg rounded">{error}</div>
          )}

          {output && (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-surface px-4 py-2.5 border-b border-border">
                <h3 className="text-body-emphasis text-text">
                  Result ({type === 'ulid' ? 'ULID' : 'UUID v4'})
                </h3>
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
