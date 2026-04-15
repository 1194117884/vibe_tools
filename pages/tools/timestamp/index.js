import { useState } from 'react';
import Head from 'next/head';
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

      // Handle both second and millisecond timestamps
      let date;
      if (input.length === 10) { // Unix timestamp (seconds)
        date = new Date(timestamp * 1000);
      } else if (input.length === 13) { // JavaScript timestamp (milliseconds)
        date = new Date(timestamp);
      } else {
        // Guess based on size - assume seconds if less than 1e10, milliseconds otherwise
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

      {/* Header */}
      <header className="border-b border-border py-6">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🕐</div>
            <div>
              <h1 className="text-2xl font-bold text-text">Timestamp Converter</h1>
              <p className="text-textMuted">Convert between Unix timestamps and dates</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          <div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter date (YYYY-MM-DDTHH:mm:ss) or timestamp (e.g., 1700000000)"
              className="w-full p-4 border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button onClick={convertToTimestamp}>Date to Timestamp</Button>
            <Button onClick={convertFromTimestamp} variant="secondary">Timestamp to Date</Button>
            <Button onClick={getCurrentTimestamp} variant="secondary">Current Time</Button>
            <Button onClick={handleClear} variant="secondary">Clear</Button>
          </div>

          {error && (
            <div className="text-red-500 text-sm p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              {error}
            </div>
          )}

          {(unixTimestamp || formattedDate) && (
            <div className="space-y-4">
              {unixTimestamp && (
                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="bg-surface px-4 py-2 border-b border-border flex justify-between items-center">
                    <h3 className="font-medium text-text">Unix Timestamp</h3>
                    <Button variant="secondary" onClick={handleCopyTimestamp}>
                      Copy
                    </Button>
                  </div>
                  <pre className="p-4 text-sm font-mono text-text break-all bg-surface">
                    {unixTimestamp}
                  </pre>
                </div>
              )}

              {formattedDate && (
                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="bg-surface px-4 py-2 border-b border-border flex justify-between items-center">
                    <h3 className="font-medium text-text">ISO Date</h3>
                    <Button variant="secondary" onClick={handleCopyDate}>
                      Copy
                    </Button>
                  </div>
                  <pre className="p-4 text-sm font-mono text-text break-all bg-surface">
                    {formattedDate}
                  </pre>
                </div>
              )}
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