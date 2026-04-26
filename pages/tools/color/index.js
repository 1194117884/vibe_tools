import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Button } from '../../../components/ui/button';

export default function ColorTool() {
  const [input, setInput] = useState('#ffffff');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
  };

  const rgbToHex = (r, g, b) => {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
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
    } catch {
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
    } catch {
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

      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-4xl mx-auto px-6 h-12 flex items-center gap-6">
          <Link href="/" className="text-control text-textDim hover:text-text transition-colors">Vibe Tools</Link>
          <span className="text-control text-textDim">/</span>
          <span className="text-control font-medium text-text">Color Converter</span>
        </div>
      </nav>

      <header className="border-b border-border py-10">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="font-display text-product text-text mb-1 tracking-tight">Color Converter</h1>
          <p className="text-body text-textMuted">Convert between HEX and RGB formats</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter color (#ffffff, rgb(255, 255, 255), etc.)"
            className="w-full p-4 border border-border rounded bg-input text-text placeholder:text-textDim focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent font-mono text-control transition-colors duration-150"
          />

          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleHexToRgb}>HEX to RGB</Button>
            <Button onClick={handleRgbToHex} variant="dark">RGB to HEX</Button>
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
              <div className="p-4 text-control font-mono text-text whitespace-pre-wrap bg-input">
                {output}
                <div className="mt-3 w-16 h-16 rounded border border-border" style={{ backgroundColor: output.startsWith('rgb') ? output : output }} />
              </div>
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
