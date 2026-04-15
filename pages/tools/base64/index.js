import { useState } from 'react';
import Head from 'next/head';
import { Button } from '../../../components/ui/button';
import { encodeBase64, decodeBase64 } from '../../../utils';

export default function Base64Tool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const handleEncode = () => {
    try {
      setOutput(encodeBase64(input));
      setError('');
    } catch (e) {
      setError('Encoding failed');
      setOutput('');
    }
  };

  const handleDecode = () => {
    try {
      setOutput(decodeBase64(input));
      setError('');
    } catch (e) {
      setError('Decoding failed');
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
        <title>Base64 Encode/Decode - Vibe Tools</title>
        <meta name="description" content="Base64 encode and decode" />
      </Head>

      {/* Header */}
      <header className="border-b border-border py-6">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-3">
            <div className="text-2xl">Aa</div>
            <div>
              <h1 className="text-2xl font-bold text-text">Base64</h1>
              <p className="text-textMuted">Encode and decode Base64</p>
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
              placeholder="Enter text to encode/decode..."
              className="w-full h-40 p-4 border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary resize-y font-mono text-sm"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleEncode}>Encode</Button>
            <Button onClick={handleDecode} variant="secondary">Decode</Button>
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