import { useState } from 'react';
import Head from 'next/head';
import { Button } from '../../../components/ui/button';

export default function UrlTool() {
  const [input, setInput] = useState('');
  const [encoded, setEncoded] = useState('');
  const [decoded, setDecoded] = useState('');
  const [error, setError] = useState('');

  const handleEncode = () => {
    try {
      const encodedValue = encodeURIComponent(input);
      setEncoded(encodedValue);
      setError('');
    } catch (e) {
      setError('Encoding failed: ' + e.message);
      setEncoded('');
    }
  };

  const handleDecode = () => {
    try {
      const decodedValue = decodeURIComponent(input);
      setDecoded(decodedValue);
      setError('');
    } catch (e) {
      setError('Decoding failed: ' + e.message);
      setDecoded('');
    }
  };

  const handleFullEncode = () => {
    try {
      // More comprehensive URL encoding
      const encodedValue = input.replace(/[^\w\-_.~!*'();:@&=+$,/?#\[\]]/g, function(match) {
        return encodeURIComponent(match);
      });
      setEncoded(encodedValue);
      setError('');
    } catch (e) {
      setError('Encoding failed: ' + e.message);
      setEncoded('');
    }
  };

  const handleClear = () => {
    setInput('');
    setEncoded('');
    setDecoded('');
    setError('');
  };

  const handleCopyEncoded = () => {
    navigator.clipboard.writeText(encoded);
    alert('Encoded URL copied to clipboard!');
  };

  const handleCopyDecoded = () => {
    navigator.clipboard.writeText(decoded);
    alert('Decoded URL copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>URL Encoder/Decoder - Vibe Tools</title>
        <meta name="description" content="Encode and decode URLs" />
      </Head>

      {/* Header */}
      <header className="border-b border-border py-6">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🔗</div>
            <div>
              <h1 className="text-2xl font-bold text-text">URL Encoder/Decoder</h1>
              <p className="text-textMuted">Encode and decode URLs</p>
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
              placeholder="Enter URL to encode/decode..."
              className="w-full h-40 p-4 border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary resize-y font-mono text-sm"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleEncode}>Encode URL</Button>
            <Button onClick={handleDecode} variant="secondary">Decode URL</Button>
            <Button onClick={handleFullEncode} variant="secondary">Full Encode</Button>
            <Button onClick={handleClear} variant="secondary">Clear</Button>
          </div>

          {error && (
            <div className="text-red-500 text-sm p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              {error}
            </div>
          )}

          {encoded && (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-surface px-4 py-2 border-b border-border flex justify-between items-center">
                <h3 className="font-medium text-text">Encoded URL</h3>
                <Button variant="secondary" onClick={handleCopyEncoded}>
                  Copy
                </Button>
              </div>
              <pre className="p-4 text-sm font-mono text-text whitespace-pre-wrap break-all max-h-60 overflow-y-auto bg-surface">
                {encoded}
              </pre>
            </div>
          )}

          {decoded && (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-surface px-4 py-2 border-b border-border flex justify-between items-center">
                <h3 className="font-medium text-text">Decoded URL</h3>
                <Button variant="secondary" onClick={handleCopyDecoded}>
                  Copy
                </Button>
              </div>
              <pre className="p-4 text-sm font-mono text-text whitespace-pre-wrap break-all max-h-60 overflow-y-auto bg-surface">
                {decoded}
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