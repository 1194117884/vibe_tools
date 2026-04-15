import { useState } from 'react';
import Head from 'next/head';
import { Button } from '../../../components/ui/button';

export default function HashTool() {
  const [input, setInput] = useState('');
  const [algorithm, setAlgorithm] = useState('SHA-256');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const hashString = async (str, algo) => {
    // Simplified hashing using browser crypto API
    if (typeof window !== 'undefined') {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(str);

        // Map user-friendly algorithm names to crypto API names
        const algoMap = {
          'SHA-1': 'SHA-1',
          'SHA-256': 'SHA-256',
          'SHA-512': 'SHA-512'
        };

        const cryptoAlgo = algoMap[algo] || 'SHA-256';
        const hashBuffer = await crypto.subtle.digest(cryptoAlgo, data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      } catch (e) {
        throw new Error('Hashing failed: ' + e.message);
      }
    } else {
      // Fallback for SSR - return placeholder
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

      {/* Header */}
      <header className="border-b border-border py-6">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-3">
            <div className="text-2xl">#</div>
            <div>
              <h1 className="text-2xl font-bold text-text">Hash Generator</h1>
              <p className="text-textMuted">Generate hashes using various algorithms</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          <div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text to hash..."
              className="w-full h-40 p-4 border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary resize-y font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">Algorithm</label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
              className="w-full p-3 border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="SHA-256">SHA-256</option>
              <option value="SHA-1">SHA-1</option>
              <option value="SHA-512">SHA-512</option>
            </select>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleHash}>Generate Hash</Button>
          </div>

          {error && (
            <div className="text-red-500 text-sm p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              {error}
            </div>
          )}

          {output && (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-surface px-4 py-2 border-b border-border flex justify-between items-center">
                <h3 className="font-medium text-text">Result ({algorithm})</h3>
                <Button variant="secondary" onClick={handleCopy}>
                  Copy
                </Button>
              </div>
              <pre className="p-4 text-sm font-mono text-text whitespace-pre-wrap break-all max-h-60 overflow-y-auto bg-surface">
                {output}
              </pre>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-border py-6 mt-auto">
        <div className="max-w-4xl mx-auto px-6 text-center text-textDim text-sm">
          Built with ❤️ using Next.js
        </div>
      </footer>
    </div>
  );
}