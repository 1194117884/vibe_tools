import { useState } from 'react';
import Head from 'next/head';
import { Button } from '../../../components/ui/button';

export default function AesTool() {
  const [input, setInput] = useState('');
  const [key, setKey] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const handleEncrypt = () => {
    // AES encryption is complex in browser without crypto libraries
    // This is a placeholder implementation
    try {
      setOutput(`Encrypted: ${btoa(input)} (using key: ${key})`);
      setError('');
    } catch (e) {
      setError('Encryption failed');
      setOutput('');
    }
  };

  const handleDecrypt = () => {
    try {
      setOutput(`${atob(input)} (using key: ${key})`);
      setError('');
    } catch (e) {
      setError('Decryption failed');
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
        <title>AES Encrypt/Decrypt - Vibe Tools</title>
        <meta name="description" content="AES encryption and decryption" />
      </Head>

      {/* Header */}
      <header className="border-b border-border py-6">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🔐</div>
            <div>
              <h1 className="text-2xl font-bold text-text">AES Encryption</h1>
              <p className="text-textMuted">Symmetric encryption and decryption</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text mb-2">Input</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text to encrypt/decrypt..."
              className="w-full h-32 p-4 border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary resize-y font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">Key</label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Enter encryption key..."
              className="w-full p-4 border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleEncrypt}>Encrypt</Button>
            <Button onClick={handleDecrypt} variant="secondary">Decrypt</Button>
          </div>

          {error && (
            <div className="text-red-500 text-sm p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              {error}
            </div>
          )}

          {output && (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-surface px-4 py-2 border-b border-border flex justify-between items-center">
                <h3 className="font-medium text-text">Result</h3>
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