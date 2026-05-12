import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
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
        <title>Base64 - Vibe Tools</title>
        <meta name="description" content="Base64 encode and decode" />
      </Head>
      <header className="border-b border-border py-10">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="font-display text-product text-text mb-1 tracking-tight">Base64</h1>
          <p className="text-body text-textMuted">Encode and decode Base64</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter text to encode/decode..."
            className="w-full h-40 p-4 border border-border rounded bg-input text-text placeholder:text-textDim focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent resize-y font-mono text-control transition-colors duration-150"
          />

          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleEncode}>Encode</Button>
            <Button onClick={handleDecode} variant="dark">Decode</Button>
          </div>

          {error && (
            <div className="text-error text-control p-3 bg-errorBg rounded">{error}</div>
          )}

          {output && (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-surface px-4 py-2.5 border-b border-border flex justify-between items-center">
                <h3 className="text-body-emphasis text-text">Result</h3>
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
