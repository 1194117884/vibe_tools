import { useState } from 'react';
import Head from 'next/head';
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
    switch(preset) {
      case 'every-minute':
        setMinute('*'); setHour('*'); setDay('*'); setMonth('*'); setWeekday('*');
        break;
      case 'every-hour':
        setMinute('0'); setHour('*'); setDay('*'); setMonth('*'); setWeekday('*');
        break;
      case 'daily':
        setMinute('0'); setHour('0'); setDay('*'); setMonth('*'); setWeekday('*');
        break;
      case 'weekly':
        setMinute('0'); setHour('0'); setDay('*'); setMonth('*'); setWeekday('0');
        break;
      case 'monthly':
        setMinute('0'); setHour('0'); setDay('1'); setMonth('*'); setWeekday('*');
        break;
      default:
        break;
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

      {/* Header */}
      <header className="border-b border-border py-6">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-3">
            <div className="text-2xl">⏰</div>
            <div>
              <h1 className="text-2xl font-bold text-text">Cron Generator</h1>
              <p className="text-textMuted">Build cron expressions</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          <div className="grid grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">Minute (0-59)</label>
              <input
                type="text"
                value={minute}
                onChange={(e) => setMinute(e.target.value)}
                className="w-full p-3 border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Hour (0-23)</label>
              <input
                type="text"
                value={hour}
                onChange={(e) => setHour(e.target.value)}
                className="w-full p-3 border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Day (1-31)</label>
              <input
                type="text"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="w-full p-3 border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Month (1-12)</label>
              <input
                type="text"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full p-3 border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Weekday (0-6)</label>
              <input
                type="text"
                value={weekday}
                onChange={(e) => setWeekday(e.target.value)}
                className="w-full p-3 border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => handleCommonPresets('every-minute')} variant="secondary">Every minute</Button>
            <Button onClick={() => handleCommonPresets('every-hour')} variant="secondary">Every hour</Button>
            <Button onClick={() => handleCommonPresets('daily')} variant="secondary">Daily</Button>
            <Button onClick={() => handleCommonPresets('weekly')} variant="secondary">Weekly</Button>
            <Button onClick={() => handleCommonPresets('monthly')} variant="secondary">Monthly</Button>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleGenerate}>Generate Expression</Button>
          </div>

          {error && (
            <div className="text-red-500 text-sm p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              {error}
            </div>
          )}

          {output && (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-surface px-4 py-2 border-b border-border flex justify-between items-center">
                <h3 className="font-medium text-text">Generated Cron Expression</h3>
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