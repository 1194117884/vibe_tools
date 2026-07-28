import { useState } from 'react';
import Head from 'next/head';
import { Button } from '../../../components/ui/button';

export const ALGORITHMS = [
  { id: 'SHA-1', label: 'HMAC-SHA-1' },
  { id: 'SHA-256', label: 'HMAC-SHA-256' },
  { id: 'SHA-384', label: 'HMAC-SHA-384' },
  { id: 'SHA-512', label: 'HMAC-SHA-512' },
];

function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

/**
 * Compute HMAC using Web Crypto. cryptoSource injectable for tests.
 */
export async function computeHmac(message, secret, algorithm = 'SHA-256', cryptoSource = globalThis.crypto) {
  if (!cryptoSource?.subtle) {
    throw new Error('Web Crypto API is not available.');
  }
  const enc = new TextEncoder();
  const key = await cryptoSource.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: { name: algorithm } },
    false,
    ['sign']
  );
  const signature = await cryptoSource.subtle.sign('HMAC', key, enc.encode(message));
  return {
    hex: bufferToHex(signature),
    base64: bufferToBase64(signature),
  };
}

export default function HmacTool() {
  const [message, setMessage] = useState('hello world');
  const [secret, setSecret] = useState('secret');
  const [algorithm, setAlgorithm] = useState('SHA-256');
  const [output, setOutput] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  const handleGenerate = async () => {
    try {
      const result = await computeHmac(message, secret, algorithm);
      setOutput(result);
      setError('');
      setCopied('');
    } catch (e) {
      setError(e.message || 'HMAC failed');
      setOutput(null);
    }
  };

  const handleCopy = async (key, value) => {
    await navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(''), 1200);
  };

  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>HMAC Generator - Vibe Tools</title>
        <meta name="description" content="Generate HMAC-SHA signatures for API authentication" />
      </Head>
      <header className="border-b border-border py-10">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="font-display text-product text-text mb-1 tracking-tight">HMAC Generator</h1>
          <p className="text-body text-textMuted">Sign messages with a secret key (HMAC-SHA)</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          <div>
            <label className="block text-control font-medium text-text mb-2">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full h-28 p-4 border border-border rounded bg-input text-text font-mono text-control focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent resize-y"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-control font-medium text-text mb-2">Secret key</label>
              <input
                type="text"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                className="w-full p-3 border border-border rounded bg-input text-text font-mono focus:outline-none focus:ring-2 focus:ring-focus-ring"
              />
            </div>
            <div>
              <label className="block text-control font-medium text-text mb-2">Algorithm</label>
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
                className="w-full p-3 border border-border rounded bg-input text-text focus:outline-none focus:ring-2 focus:ring-focus-ring"
              >
                {ALGORITHMS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Button onClick={handleGenerate}>Generate HMAC</Button>

          {error && <div className="text-error text-control p-3 bg-errorBg rounded">{error}</div>}

          {output && (
            <div className="space-y-4">
              {[
                { key: 'hex', label: 'Hex', value: output.hex },
                { key: 'base64', label: 'Base64', value: output.base64 },
              ].map((item) => (
                <div key={item.key} className="border border-border rounded-lg overflow-hidden">
                  <div className="bg-surface px-4 py-2.5 border-b border-border flex justify-between items-center">
                    <h3 className="text-body-emphasis text-text">{item.label}</h3>
                    <Button variant="ghost" size="sm" onClick={() => handleCopy(item.key, item.value)}>
                      {copied === item.key ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                  <pre className="p-4 text-control font-mono text-text whitespace-pre-wrap break-all bg-input">
                    {item.value}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
