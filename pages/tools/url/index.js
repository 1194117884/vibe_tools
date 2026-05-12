import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
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
        <title>URL Encoder - Vibe Tools</title>
        <meta name="description" content="Encode and decode URLs" />
      </Head>
      <header className="border-b border-border py-10">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="font-display text-product text-text mb-1 tracking-tight">URL Encoder</h1>
          <p className="text-body text-textMuted">Encode and decode URLs</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter URL to encode/decode..."
            className="w-full h-40 p-4 border border-border rounded bg-input text-text placeholder:text-textDim focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent resize-y font-mono text-control transition-colors duration-150"
          />

          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleEncode}>Encode URL</Button>
            <Button onClick={handleDecode} variant="dark">Decode URL</Button>
            <Button onClick={handleFullEncode} variant="outline">Full Encode</Button>
            <Button onClick={handleClear} variant="ghost">Clear</Button>
          </div>

          {error && (
            <div className="text-error text-control p-3 bg-errorBg rounded">{error}</div>
          )}

          {encoded && (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-surface px-4 py-2.5 border-b border-border flex justify-between items-center">
                <h3 className="text-body-emphasis text-text">Encoded URL</h3>
                <Button variant="ghost" size="sm" onClick={handleCopyEncoded}>Copy</Button>
              </div>
              <pre className="p-4 text-control font-mono text-text whitespace-pre-wrap break-all max-h-60 overflow-y-auto bg-input">
                {encoded}
              </pre>
            </div>
          )}

          {decoded && (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-surface px-4 py-2.5 border-b border-border flex justify-between items-center">
                <h3 className="text-body-emphasis text-text">Decoded URL</h3>
                <Button variant="ghost" size="sm" onClick={handleCopyDecoded}>Copy</Button>
              </div>
              <pre className="p-4 text-control font-mono text-text whitespace-pre-wrap break-all max-h-60 overflow-y-auto bg-input">
                {decoded}
              </pre>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
