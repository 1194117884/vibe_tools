import { useState, useRef, useEffect, useCallback } from 'react';
import figlet from 'figlet';
import { Button } from '../../../components/ui/button';

// ── Import all 25 fonts ──
import StandardFont from 'figlet/importable-fonts/Standard';
import BigFont from 'figlet/importable-fonts/Big';
import SlantFont from 'figlet/importable-fonts/Slant';
import SmallFont from 'figlet/importable-fonts/Small';
import BannerFont from 'figlet/importable-fonts/Banner';
import Banner3DFont from 'figlet/importable-fonts/Banner3-D';
import BloodyFont from 'figlet/importable-fonts/Bloody';
import BulbheadFont from 'figlet/importable-fonts/Bulbhead';
import CalvinSFont from 'figlet/importable-fonts/Calvin S';
import CrawfordFont from 'figlet/importable-fonts/Crawford';
import DeltaCorpsPriest1Font from 'figlet/importable-fonts/Delta Corps Priest 1';
import DoomFont from 'figlet/importable-fonts/Doom';
import ElectronicFont from 'figlet/importable-fonts/Electronic';
import EliteFont from 'figlet/importable-fonts/Elite';
import EpicFont from 'figlet/importable-fonts/Epic';
import FrakturFont from 'figlet/importable-fonts/Fraktur';
import GraffitiFont from 'figlet/importable-fonts/Graffiti';
import JSBracketLettersFont from 'figlet/importable-fonts/JS Bracket Letters';
import Larry3DFont from 'figlet/importable-fonts/Larry 3D';
import NancyjFont from 'figlet/importable-fonts/Nancyj';
import OgreFont from 'figlet/importable-fonts/Ogre';
import RectanglesFont from 'figlet/importable-fonts/Rectangles';
import ShadowFont from 'figlet/importable-fonts/Shadow';
import UniversFont from 'figlet/importable-fonts/Univers';
import WeirdFont from 'figlet/importable-fonts/Weird';

// ── Register all fonts with figlet ──
figlet.parseFont('Standard', StandardFont);
figlet.parseFont('Big', BigFont);
figlet.parseFont('Slant', SlantFont);
figlet.parseFont('Small', SmallFont);
figlet.parseFont('Banner', BannerFont);
figlet.parseFont('Banner3-D', Banner3DFont);
figlet.parseFont('Bloody', BloodyFont);
figlet.parseFont('Bulbhead', BulbheadFont);
figlet.parseFont('Calvin S', CalvinSFont);
figlet.parseFont('Crawford', CrawfordFont);
figlet.parseFont('Delta Corps Priest 1', DeltaCorpsPriest1Font);
figlet.parseFont('Doom', DoomFont);
figlet.parseFont('Electronic', ElectronicFont);
figlet.parseFont('Elite', EliteFont);
figlet.parseFont('Epic', EpicFont);
figlet.parseFont('Fraktur', FrakturFont);
figlet.parseFont('Graffiti', GraffitiFont);
figlet.parseFont('JS Bracket Letters', JSBracketLettersFont);
figlet.parseFont('Larry 3D', Larry3DFont);
figlet.parseFont('Nancyj', NancyjFont);
figlet.parseFont('Ogre', OgreFont);
figlet.parseFont('Rectangles', RectanglesFont);
figlet.parseFont('Shadow', ShadowFont);
figlet.parseFont('Univers', UniversFont);
figlet.parseFont('Weird', WeirdFont);

// ── Font list for the dropdown ──
const FONTS = [
  'Standard',
  'Big',
  'Slant',
  'Small',
  'Banner',
  'Banner3-D',
  'Bloody',
  'Bulbhead',
  'Calvin S',
  'Crawford',
  'Delta Corps Priest 1',
  'Doom',
  'Electronic',
  'Elite',
  'Epic',
  'Fraktur',
  'Graffiti',
  'JS Bracket Letters',
  'Larry 3D',
  'Nancyj',
  'Ogre',
  'Rectangles',
  'Shadow',
  'Univers',
  'Weird',
];

function renderBanner(text, font, width) {
  return figlet.textSync(text, { font, width: Number(width) });
}

export default function BannerContent() {
  const [input, setInput] = useState('');
  const [font, setFont] = useState('Standard');
  const [width, setWidth] = useState(80);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const debounceRef = useRef(null);
  const fontRef = useRef(font);
  const widthRef = useRef(width);
  fontRef.current = font;
  widthRef.current = width;

  const safeRender = useCallback((text, f, w) => {
    const clamped = Math.max(20, Math.min(500, Number(w) || 80));
    return renderBanner(text, f, clamped);
  }, []);

  // Debounced render on input change (300ms)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!input.trim()) {
      setOutput('');
      setError('');
      return;
    }

    debounceRef.current = setTimeout(() => {
      try {
        setOutput(safeRender(input, fontRef.current, widthRef.current));
        setError('');
      } catch (e) {
        setError('Rendering error: ' + e.message);
        setOutput('');
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [input, safeRender]);

  // Immediate re-render on font or width change
  useEffect(() => {
    if (!input.trim()) {
      setOutput('');
      setError('');
      return;
    }

    try {
      setOutput(safeRender(input, font, width));
      setError('');
    } catch (e) {
      setError('Rendering error: ' + e.message);
      setOutput('');
    }
  }, [font, width, input, safeRender]);

  const handleCopy = () => {
    navigator.clipboard.writeText(output).catch(() => {});
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border py-10">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="font-display text-product text-text mb-1 tracking-tight">
            Banner Text Generator
          </h1>
          <p className="text-body text-textMuted">
            Generate ASCII art text banners with FIGlet fonts
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Input textarea */}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type something to generate your banner..."
            spellCheck={false}
            className="w-full h-40 p-4 border border-border rounded bg-input text-text placeholder:text-textDim focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent resize-y font-mono text-control transition-colors duration-150"
          />

          {/* Controls: font select + width input */}
          <div className="flex gap-4 flex-wrap items-end">
            <div className="flex-1 min-w-[180px]">
              <label className="block text-control text-text mb-2">Font</label>
              <select
                value={font}
                onChange={(e) => setFont(e.target.value)}
                className="w-full p-2.5 border border-border rounded-lg bg-input text-text text-control focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent"
              >
                {FONTS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-24">
              <label className="block text-control text-text mb-2">Width</label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                min={20}
                max={500}
                className="w-full p-2.5 border border-border rounded-lg bg-input text-text text-control focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent"
              />
            </div>
            <Button
              variant="outline"
              disabled={!input.trim()}
              onClick={() => {
                try {
                  setOutput(safeRender(input, font, width));
                  setError('');
                } catch (e) {
                  setError('Rendering error: ' + e.message);
                  setOutput('');
                }
              }}
            >
              Refresh
            </Button>
          </div>

          {/* Error display */}
          {error && (
            <div className="text-error text-control p-3 bg-errorBg rounded">{error}</div>
          )}

          {/* Output panel */}
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="bg-surface px-4 py-2.5 border-b border-border flex justify-between items-center">
              <h3 className="text-body-emphasis text-text">Result</h3>
              {output && (
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  Copy
                </Button>
              )}
            </div>
            {output ? (
              <pre className="p-4 text-control font-mono text-text whitespace-pre-wrap break-all max-h-96 overflow-y-auto bg-input">
                {output}
              </pre>
            ) : (
              <div className="p-4 text-control text-textDim bg-input">
                Type something above to generate your banner
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
