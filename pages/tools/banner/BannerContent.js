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

const FONTS = [
  'Standard', 'Big', 'Slant', 'Small', 'Banner', 'Banner3-D',
  'Bloody', 'Bulbhead', 'Calvin S', 'Crawford', 'Delta Corps Priest 1',
  'Doom', 'Electronic', 'Elite', 'Epic', 'Fraktur', 'Graffiti',
  'JS Bracket Letters', 'Larry 3D', 'Nancyj', 'Ogre', 'Rectangles',
  'Shadow', 'Univers', 'Weird',
];

export default function BannerContent() {
  const [input, setInput] = useState('');
  const [width, setWidth] = useState(80);
  const [results, setResults] = useState({});
  const debounceRef = useRef(null);
  const widthRef = useRef(width);
  widthRef.current = width;

  const renderAll = useCallback((text, w) => {
    const clamped = Math.max(20, Math.min(500, Number(w) || 80));
    const newResults = {};
    FONTS.forEach((font) => {
      try {
        newResults[font] = figlet.textSync(text, { font, width: clamped });
      } catch (e) {
        newResults[font] = null;
      }
    });
    return newResults;
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!input.trim()) {
      setResults({});
      return;
    }

    debounceRef.current = setTimeout(() => {
      setResults(renderAll(input, widthRef.current));
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [input, renderAll]);

  // Immediate re-render on width change
  useEffect(() => {
    if (!input.trim()) {
      setResults({});
      return;
    }
    setResults(renderAll(input, width));
  }, [width]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  const hasResults = Object.keys(results).length > 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border py-10">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <h1 className="font-display text-product text-text mb-1 tracking-tight">
            Banner Text Generator
          </h1>
          <p className="text-body text-textMuted">
            Generate ASCII art text banners with FIGlet fonts
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-10 py-8 space-y-6">
        {/* Input + width */}
        <div className="space-y-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type something to generate your banner..."
            spellCheck={false}
            className="w-full h-28 p-4 border border-border rounded-lg bg-input text-text placeholder:text-textDim focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent resize-y font-mono text-control transition-colors duration-150"
          />
          <div className="flex items-center gap-3">
            <label className="text-control text-textDim">Width:</label>
            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              min={20}
              max={500}
              className="w-20 p-2 border border-border rounded-lg bg-input text-text text-control focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent"
            />
          </div>
        </div>

        {/* Empty state */}
        {!hasResults && (
          <div className="text-center py-16 text-textDim">
            <p className="text-body">Type something above to see all font variations</p>
          </div>
        )}

        {/* Font gallery grid */}
        {hasResults && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {FONTS.map((font) => {
              const output = results[font];
              if (!output) return null;
              return (
                <div
                  key={font}
                  className="border border-border rounded-lg overflow-hidden bg-surface flex flex-col"
                >
                  <div className="px-4 py-2.5 border-b border-border flex justify-between items-center">
                    <h3 className="text-body-emphasis text-text font-medium">{font}</h3>
                    <Button variant="ghost" size="sm" onClick={() => handleCopy(output)}>
                      Copy
                    </Button>
                  </div>
                  <pre className="p-4 text-micro font-mono text-text whitespace-pre overflow-x-auto bg-input flex-1 max-h-64 overflow-y-auto">
                    {output}
                  </pre>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
