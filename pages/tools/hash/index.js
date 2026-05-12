import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Button } from '../../../components/ui/button';

export default function HashTool() {
  const [input, setInput] = useState('');
  const [algorithm, setAlgorithm] = useState('SHA-256');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const hashString = async (str, algo) => {
    if (typeof window !== 'undefined') {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const algoMap = { 'SHA-1': 'SHA-1', 'SHA-256': 'SHA-256', 'SHA-512': 'SHA-512' };
        const cryptoAlgo = algoMap[algo] || 'SHA-256';
        const hashBuffer = await crypto.subtle.digest(cryptoAlgo, data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      } catch (e) {
        throw new Error('Hashing failed: ' + e.message);
      }
    } else {
      return str + '_hashed_' + algo.toLowerCase().replace('-', '');
    }
  };

  const handleHash = async () => {
    try {
      const hashed = await hashString(input, algorithm);
      setOutput(hashed);
      setError('');
    } catch (e) {
      setError('Hashing failed: ' + e.message);
      setOutput('');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    alert('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>Hash Generator - Vibe Tools</title>
        <meta name="description" content="Generate hash values using various algorithms" />
      </Head>
      <header className="border-b border-border py-10">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="font-display text-product text-text mb-1 tracking-tight">Hash Generator</h1>
          <p className="text-body text-textMuted">Generate hashes using various algorithms</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter text to hash..."
            className="w-full h-40 p-4 border border-border rounded bg-input text-text placeholder:text-textDim focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent resize-y font-mono text-control transition-colors duration-150"
          />

          <div>
            <label className="block text-control font-medium text-text mb-2">Algorithm</label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
              className="w-full p-3 border border-border rounded bg-input text-text focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent transition-colors duration-150"
            >
              <option value="SHA-256">SHA-256</option>
              <option value="SHA-1">SHA-1</option>
              <option value="SHA-512">SHA-512</option>
            </select>
          </div>

          <Button onClick={handleHash}>Generate Hash</Button>

          {error && (
            <div className="text-error text-control p-3 bg-errorBg rounded">{error}</div>
          )}

          {output && (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-surface px-4 py-2.5 border-b border-border flex justify-between items-center">
                <h3 className="text-body-emphasis text-text">Result ({algorithm})</h3>
                <Button variant="ghost" size="sm" onClick={handleCopy}>Copy</Button>
              </div>
              <pre className="p-4 text-control font-mono text-text whitespace-pre-wrap break-all max-h-60 overflow-y-auto bg-input">
                {output}
              </pre>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
