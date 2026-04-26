import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Button } from '../../../components/ui/button';

export default function TimestampTool() {
  const [input, setInput] = useState('');
  const [unixTimestamp, setUnixTimestamp] = useState('');
  const [formattedDate, setFormattedDate] = useState('');
  const [error, setError] = useState('');

  const convertToTimestamp = () => {
    try {
      const date = new Date(input);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date format');
      }
      const timestamp = Math.floor(date.getTime() / 1000);
      setUnixTimestamp(timestamp.toString());
      setFormattedDate(date.toISOString());
      setError('');
    } catch (e) {
      setError('Conversion failed: ' + e.message);
      setUnixTimestamp('');
      setFormattedDate('');
    }
  };

  const convertFromTimestamp = () => {
    try {
      const timestamp = parseInt(input);
      if (isNaN(timestamp)) {
        throw new Error('Invalid timestamp');
      }
      let date;
      if (input.length === 10) {
        date = new Date(timestamp * 1000);
      } else if (input.length === 13) {
        date = new Date(timestamp);
      } else {
        if (Math.abs(timestamp) < 1e10) {
          date = new Date(timestamp * 1000);
        } else {
          date = new Date(timestamp);
        }
      }
      if (isNaN(date.getTime())) {
        throw new Error('Invalid timestamp');
      }
      setFormattedDate(date.toISOString());
      setUnixTimestamp(timestamp.toString());
      setError('');
    } catch (e) {
      setError('Conversion failed: ' + e.message);
      setUnixTimestamp('');
      setFormattedDate('');
    }
  };

  const getCurrentTimestamp = () => {
    const timestamp = Math.floor(Date.now() / 1000);
    setInput(timestamp.toString());
    setUnixTimestamp(timestamp.toString());
    setFormattedDate(new Date(timestamp * 1000).toISOString());
    setError('');
  };

  const handleClear = () => {
    setInput('');
    setUnixTimestamp('');
    setFormattedDate('');
    setError('');
  };

  const handleCopyTimestamp = () => {
    navigator.clipboard.writeText(unixTimestamp);
    alert('Timestamp copied to clipboard!');
  };

  const handleCopyDate = () => {
    navigator.clipboard.writeText(formattedDate);
    alert('Date copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>Timestamp Converter - Vibe Tools</title>
        <meta name="description" content="Convert between timestamps and human readable dates" />
      </Head>

      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-4xl mx-auto px-6 h-12 flex items-center gap-6">
          <Link href="/" className="text-control text-textDim hover:text-text transition-colors">Vibe Tools</Link>
          <span className="text-control text-textDim">/</span>
          <span className="text-control font-medium text-text">Timestamp Converter</span>
        </div>
      </nav>

      <header className="border-b border-border py-10">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="font-display text-product text-text mb-1 tracking-tight">Timestamp Converter</h1>
          <p className="text-body text-textMuted">Convert between Unix timestamps and dates</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter date (YYYY-MM-DDTHH:mm:ss) or timestamp (e.g., 1700000000)"
            className="w-full p-4 border border-border rounded bg-input text-text placeholder:text-textDim focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent font-mono text-control transition-colors duration-150"
          />

          <div className="flex gap-2 flex-wrap">
            <Button onClick={convertToTimestamp}>Date to Timestamp</Button>
            <Button onClick={convertFromTimestamp} variant="dark">Timestamp to Date</Button>
            <Button onClick={getCurrentTimestamp} variant="outline">Current Time</Button>
            <Button onClick={handleClear} variant="ghost">Clear</Button>
          </div>

          {error && (
            <div className="text-error text-control p-3 bg-errorBg rounded">{error}</div>
          )}

          {(unixTimestamp || formattedDate) && (
            <div className="space-y-4">
              {unixTimestamp && (
                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="bg-surface px-4 py-2.5 border-b border-border flex justify-between items-center">
                    <h3 className="text-body-emphasis text-text">Unix Timestamp</h3>
                    <Button variant="ghost" size="sm" onClick={handleCopyTimestamp}>Copy</Button>
                  </div>
                  <pre className="p-4 text-control font-mono text-text break-all bg-input">
                    {unixTimestamp}
                  </pre>
                </div>
              )}

              {formattedDate && (
                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="bg-surface px-4 py-2.5 border-b border-border flex justify-between items-center">
                    <h3 className="text-body-emphasis text-text">ISO Date</h3>
                    <Button variant="ghost" size="sm" onClick={handleCopyDate}>Copy</Button>
                  </div>
                  <pre className="p-4 text-control font-mono text-text break-all bg-input">
                    {formattedDate}
                  </pre>
                </div>
              )}
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
