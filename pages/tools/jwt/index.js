import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Button } from '../../../components/ui/button';

export default function JwtTool() {
  const [input, setInput] = useState('');
  const [decoded, setDecoded] = useState(null);
  const [error, setError] = useState('');

  const parseJwt = (token) => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT: Token must have 3 parts');
      }
      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      return { header, payload, signature: parts[2] };
    } catch (e) {
      throw new Error('Invalid JWT: ' + e.message);
    }
  };

  const handleDecode = () => {
    try {
      const jwtData = parseJwt(input);
      setDecoded(jwtData);
      setError('');
    } catch (e) {
      setError('Decoding failed: ' + e.message);
      setDecoded(null);
    }
  };

  const handleClear = () => {
    setInput('');
    setDecoded(null);
    setError('');
  };

  const handleCopyPayload = () => {
    if (decoded) {
      navigator.clipboard.writeText(JSON.stringify(decoded.payload, null, 2));
      alert('Payload copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>JWT Decoder - Vibe Tools</title>
        <meta name="description" content="Decode JWT tokens" />
      </Head>

      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-4xl mx-auto px-6 h-12 flex items-center gap-6">
          <Link href="/" className="text-control text-textDim hover:text-text transition-colors">Vibe Tools</Link>
          <span className="text-control text-textDim">/</span>
          <span className="text-control font-medium text-text">JWT Decoder</span>
        </div>
      </nav>

      <header className="border-b border-border py-10">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="font-display text-product text-text mb-1 tracking-tight">JWT Decoder</h1>
          <p className="text-body text-textMuted">Parse and decode JWT tokens</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter JWT token..."
            className="w-full h-40 p-4 border border-border rounded bg-input text-text placeholder:text-textDim focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent resize-y font-mono text-control transition-colors duration-150"
          />

          <div className="flex gap-2">
            <Button onClick={handleDecode}>Decode JWT</Button>
            <Button onClick={handleClear} variant="ghost">Clear</Button>
          </div>

          {error && (
            <div className="text-error text-control p-3 bg-errorBg rounded">{error}</div>
          )}

          {decoded && (
            <div className="space-y-4">
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="bg-surface px-4 py-2.5 border-b border-border">
                  <h3 className="text-body-emphasis text-text">Header</h3>
                </div>
                <pre className="p-4 text-control font-mono text-text whitespace-pre-wrap break-all max-h-60 overflow-y-auto bg-input">
                  {JSON.stringify(decoded.header, null, 2)}
                </pre>
              </div>

              <div className="border border-border rounded-lg overflow-hidden">
                <div className="bg-surface px-4 py-2.5 border-b border-border flex justify-between items-center">
                  <h3 className="text-body-emphasis text-text">Payload</h3>
                  <Button variant="ghost" size="sm" onClick={handleCopyPayload}>Copy Payload</Button>
                </div>
                <pre className="p-4 text-control font-mono text-text whitespace-pre-wrap break-all max-h-60 overflow-y-auto bg-input">
                  {JSON.stringify(decoded.payload, null, 2)}
                </pre>
              </div>

              <div className="border border-border rounded-lg overflow-hidden">
                <div className="bg-surface px-4 py-2.5 border-b border-border">
                  <h3 className="text-body-emphasis text-text">Signature</h3>
                </div>
                <pre className="p-4 text-control font-mono text-text break-all max-h-32 overflow-y-auto bg-input">
                  {decoded.signature}
                </pre>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-border py-6 mt-auto">
        <div className="max-w-4xl mx-auto px-6 text-center text-micro text-textDim">
          Vibe Tools
        </div>
      </footer>
    </div>
  );
}
