import { useState } from 'react';
import Head from 'next/head';
import { Button } from '../../../components/ui/button';

export default function ColorTool() {
  const [input, setInput] = useState('#ffffff');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgbToHex = (r, g, b) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  const handleHexToRgb = () => {
    try {
      const rgb = hexToRgb(input);
      if (rgb) {
        setOutput(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`);
        setError('');
      } else {
        setError('Invalid HEX color');
        setOutput('');
      }
    } catch (e) {
      setError('Conversion failed');
      setOutput('');
    }
  };

  const handleRgbToHex = () => {
    try {
      const rgbValues = input.match(/\d+/g);
      if (rgbValues && rgbValues.length >= 3) {
        const r = parseInt(rgbValues[0]);
        const g = parseInt(rgbValues[1]);
        const b = parseInt(rgbValues[2]);
        setOutput(rgbToHex(r, g, b));
        setError('');
      } else {
        setError('Invalid RGB format. Use format like: rgb(255, 255, 255)');
        setOutput('');
      }
    } catch (e) {
      setError('Conversion failed');
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
        <title>Color Converter - Vibe Tools</title>
        <meta name="description" content="Convert colors between HEX, RGB, and HSL" />
      </Head>

      {/* Header */}
      <header className="border-b border-border py-6">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🎨</div>
            <div>
              <h1 className="text-2xl font-bold text-text">Color Converter</h1>
              <p className="text-textMuted">Convert between HEX, RGB, and other formats</p>
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
              placeholder="Enter color (#ffffff, rgb(255, 255, 255), etc.)"
              className="w-full p-4 border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleHexToRgb}>HEX to RGB</Button>
            <Button onClick={handleRgbToHex} variant="secondary">RGB to HEX</Button>
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
              <div className="p-4 text-sm font-mono text-text whitespace-pre-wrap break-all max-h-60 overflow-y-auto bg-surface">
                {output}
                <div className="mt-2 w-16 h-16 rounded border border-border" style={{ backgroundColor: output }}></div>
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