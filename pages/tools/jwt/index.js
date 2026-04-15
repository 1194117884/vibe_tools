import { useState } from 'react';
import Head from 'next/head';
import { Button } from '../../../components/ui/button';

export default function JwtTool() {
  const [input, setInput] = useState('');
  const [decoded, setDecoded] = useState(null);
  const [error, setError] = useState('');

  const parseJwt = (token) => {
    try {
      // Split the token by periods
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT: Token must have 3 parts');
      }

      // Decode each part (header, payload, signature)
      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

      return {
        header,
        payload,
        signature: parts[2]
      };
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

      {/* Header */}
      <header className="border-b border-border py-6">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🎫</div>
            <div>
              <h1 className="text-2xl font-bold text-text">JWT Decoder</h1>
              <p className="text-textMuted">Parse and decode JWT tokens</p>
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
              placeholder="Enter JWT token..."
              className="w-full h-40 p-4 border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary resize-y font-mono text-sm"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleDecode}>Decode JWT</Button>
            <Button onClick={handleClear} variant="secondary">Clear</Button>
          </div>

          {error && (
            <div className="text-red-500 text-sm p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              {error}
            </div>
          )}

          {decoded && (
            <div className="space-y-6">
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="bg-surface px-4 py-2 border-b border-border">
                  <h3 className="font-medium text-text">Header</h3>
                </div>
                <pre className="p-4 text-sm font-mono text-text whitespace-pre-wrap break-all max-h-60 overflow-y-auto bg-surface">
                  {JSON.stringify(decoded.header, null, 2)}
                </pre>
              </div>

              <div className="border border-border rounded-lg overflow-hidden">
                <div className="bg-surface px-4 py-2 border-b border-border flex justify-between items-center">
                  <h3 className="font-medium text-text">Payload</h3>
                  <Button variant="secondary" onClick={handleCopyPayload}>
                    Copy Payload
                  </Button>
                </div>
                <pre className="p-4 text-sm font-mono text-text whitespace-pre-wrap break-all max-h-60 overflow-y-auto bg-surface">
                  {JSON.stringify(decoded.payload, null, 2)}
                </pre>
              </div>

              <div className="border border-border rounded-lg overflow-hidden">
                <div className="bg-surface px-4 py-2 border-b border-border">
                  <h3 className="font-medium text-text">Signature</h3>
                </div>
                <pre className="p-4 text-sm font-mono text-text break-all max-h-32 overflow-y-auto bg-surface">
                  {decoded.signature}
                </pre>
              </div>
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