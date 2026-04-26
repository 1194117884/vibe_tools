import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Button } from '../../../components/ui/button';

export default function CronTool() {
  const [minute, setMinute] = useState('*');
  const [hour, setHour] = useState('*');
  const [day, setDay] = useState('*');
  const [month, setMonth] = useState('*');
  const [weekday, setWeekday] = useState('*');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const handleGenerate = () => {
    try {
      const cronExpression = `${minute} ${hour} ${day} ${month} ${weekday}`;
      setOutput(cronExpression);
      setError('');
    } catch (e) {
      setError('Generation failed');
      setOutput('');
    }
  };

  const handleCommonPresets = (preset) => {
    switch (preset) {
      case 'every-minute':
        setMinute('*'); setHour('*'); setDay('*'); setMonth('*'); setWeekday('*'); break;
      case 'every-hour':
        setMinute('0'); setHour('*'); setDay('*'); setMonth('*'); setWeekday('*'); break;
      case 'daily':
        setMinute('0'); setHour('0'); setDay('*'); setMonth('*'); setWeekday('*'); break;
      case 'weekly':
        setMinute('0'); setHour('0'); setDay('*'); setMonth('*'); setWeekday('0'); break;
      case 'monthly':
        setMinute('0'); setHour('0'); setDay('1'); setMonth('*'); setWeekday('*'); break;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    alert('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>Cron Generator - Vibe Tools</title>
        <meta name="description" content="Generate and validate cron expressions" />
      </Head>

      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-4xl mx-auto px-6 h-12 flex items-center gap-6">
          <Link href="/" className="text-control text-textDim hover:text-text transition-colors">Vibe Tools</Link>
          <span className="text-control text-textDim">/</span>
          <span className="text-control font-medium text-text">Cron Generator</span>
        </div>
      </nav>

      <header className="border-b border-border py-10">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="font-display text-product text-text mb-1 tracking-tight">Cron Generator</h1>
          <p className="text-body text-textMuted">Build cron expressions</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          <div className="grid grid-cols-5 gap-4">
            {[
              { label: 'Minute (0-59)', value: minute, setter: setMinute },
              { label: 'Hour (0-23)', value: hour, setter: setHour },
              { label: 'Day (1-31)', value: day, setter: setDay },
              { label: 'Month (1-12)', value: month, setter: setMonth },
              { label: 'Weekday (0-6)', value: weekday, setter: setWeekday },
            ].map((field) => (
              <div key={field.label}>
                <label className="block text-micro font-medium text-text mb-1">{field.label}</label>
                <input
                  type="text"
                  value={field.value}
                  onChange={(e) => field.setter(e.target.value)}
                  className="w-full p-3 border border-border rounded bg-input text-text focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent text-control transition-colors duration-150"
                />
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              ['every-minute', 'Every minute'],
              ['every-hour', 'Every hour'],
              ['daily', 'Daily'],
              ['weekly', 'Weekly'],
              ['monthly', 'Monthly'],
            ].map(([preset, label]) => (
              <Button key={preset} onClick={() => handleCommonPresets(preset)} variant="outline" size="sm">
                {label}
              </Button>
            ))}
          </div>

          <Button onClick={handleGenerate}>Generate Expression</Button>

          {error && (
            <div className="text-error text-control p-3 bg-errorBg rounded">{error}</div>
          )}

          {output && (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-surface px-4 py-2.5 border-b border-border flex justify-between items-center">
                <h3 className="text-body-emphasis text-text">Generated Cron Expression</h3>
                <Button variant="ghost" size="sm" onClick={handleCopy}>Copy</Button>
              </div>
              <pre className="p-4 text-control font-mono text-text whitespace-pre-wrap break-all max-h-60 overflow-y-auto bg-input">
                {output}
              </pre>
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
