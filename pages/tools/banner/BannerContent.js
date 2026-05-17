import { useState, useRef, useEffect, useMemo } from 'react';
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

const PIXEL_CHAR_SETS = {
  '█ Full Block': ' ░▒▓█',
  '⬛ B&W': ' ⬜⬛',
  '▓ Gradient': ' ░░▒▒▓▓██',
  '▌ Half': ' ▎▌▊█',
  '● Circle': ' ○◐●⬤',
};

function renderPixel(text, options = {}) {
  const { pixelSize = 2, charSet = ' ░▒▓█', fontSize = 64 } = options;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const font = `bold ${fontSize}px "PingFang SC","Noto Sans SC","Microsoft YaHei","Helvetica Neue",sans-serif`;
  ctx.font = font;

  const metrics = ctx.measureText(text);
  const textWidth = Math.max(Math.ceil(metrics.width), 1);
  const textHeight = Math.ceil(fontSize * 1.3);

  canvas.width = textWidth;
  canvas.height = textHeight;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#000000';
  ctx.font = font;
  ctx.textBaseline = 'top';
  ctx.fillText(text, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const levels = charSet.length - 1;

  let result = '';
  for (let y = 0; y < canvas.height; y += pixelSize) {
    for (let x = 0; x < canvas.width; x += pixelSize) {
      let sum = 0;
      let count = 0;
      for (let dy = 0; dy < pixelSize && y + dy < canvas.height; dy++) {
        for (let dx = 0; dx < pixelSize && x + dx < canvas.width; dx++) {
          const idx = ((y + dy) * canvas.width + (x + dx)) * 4;
          sum += (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
          count++;
        }
      }
      const avg = sum / count;
      const level = Math.round(((255 - avg) / 255) * levels);
      result += charSet[Math.min(level, levels)];
    }
    result += '\n';
  }

  return result;
}

const PIXEL_SIZE_OPTIONS = [
  { value: 1, label: 'Fine (1px)' },
  { value: 2, label: 'Normal (2px)' },
  { value: 3, label: 'Coarse (3px)' },
  { value: 4, label: 'Large (4px)' },
  { value: 6, label: 'XL (6px)' },
];

export default function BannerContent() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('figlet');
  const [width, setWidth] = useState(80);
  const [figletResults, setFigletResults] = useState({});
  const [pixelOutput, setPixelOutput] = useState('');
  const [pixelSize, setPixelSize] = useState(2);
  const [charSetKey, setCharSetKey] = useState('█ Full Block');
  const debounceRef = useRef(null);
  const widthRef = useRef(width);
  widthRef.current = width;

  const charSet = PIXEL_CHAR_SETS[charSetKey];

  // ── FIGlet rendering ──
  const renderAllFiglet = (text, w) => {
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
  };

  // ── Debounced render on input change ──
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!input.trim()) {
      setFigletResults({});
      setPixelOutput('');
      return;
    }

    debounceRef.current = setTimeout(() => {
      if (mode === 'figlet') {
        setFigletResults(renderAllFiglet(input, widthRef.current));
        setPixelOutput('');
      } else {
        setPixelOutput(renderPixel(input, { pixelSize, charSet }));
        setFigletResults({});
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [input]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Immediate re-render on setting changes ──
  useEffect(() => {
    if (!input.trim()) return;
    if (mode === 'figlet') {
      setFigletResults(renderAllFiglet(input, width));
      setPixelOutput('');
    }
  }, [width]);

  useEffect(() => {
    if (!input.trim()) return;
    if (mode === 'pixel') {
      setPixelOutput(renderPixel(input, { pixelSize, charSet }));
      setFigletResults({});
    }
  }, [pixelSize, charSetKey, mode]);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    if (!input.trim()) return;
    if (newMode === 'figlet') {
      setFigletResults(renderAllFiglet(input, width));
      setPixelOutput('');
    } else {
      setPixelOutput(renderPixel(input, { pixelSize, charSet }));
      setFigletResults({});
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  const hasResults = Object.keys(figletResults).length > 0 || pixelOutput;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border py-10">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <h1 className="font-display text-product text-text mb-1 tracking-tight">
            Banner Text Generator
          </h1>
          <p className="text-body text-textMuted">
            Generate ASCII art text banners with FIGlet fonts or pixel blocks
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-10 py-8 space-y-6">
        {/* Input textarea */}
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type something to generate your banner..."
          spellCheck={false}
          className="w-full h-28 p-4 border border-border rounded-lg bg-input text-text placeholder:text-textDim focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent resize-y font-mono text-control transition-colors duration-150"
        />

        {/* Mode toggle + controls */}
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-control text-textDim mb-2">Mode</label>
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => handleModeChange('figlet')}
                className={`px-4 py-2 text-control font-medium transition-colors ${
                  mode === 'figlet'
                    ? 'bg-primary text-primaryText'
                    : 'bg-input text-textDim hover:bg-surfaceHover'
                }`}
              >
                FIGlet
              </button>
              <button
                onClick={() => handleModeChange('pixel')}
                className={`px-4 py-2 text-control font-medium transition-colors border-l border-border ${
                  mode === 'pixel'
                    ? 'bg-primary text-primaryText'
                    : 'bg-input text-textDim hover:bg-surfaceHover'
                }`}
              >
                Pixel
              </button>
            </div>
          </div>

          {mode === 'figlet' && (
            <div>
              <label className="block text-control text-textDim mb-2">Width</label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                min={20}
                max={500}
                className="w-20 p-2 border border-border rounded-lg bg-input text-text text-control focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent"
              />
            </div>
          )}

          {mode === 'pixel' && (
            <>
              <div>
                <label className="block text-control text-textDim mb-2">Block size</label>
                <select
                  value={pixelSize}
                  onChange={(e) => setPixelSize(Number(e.target.value))}
                  className="p-2 border border-border rounded-lg bg-input text-text text-control focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent"
                >
                  {PIXEL_SIZE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-control text-textDim mb-2">Style</label>
                <select
                  value={charSetKey}
                  onChange={(e) => setCharSetKey(e.target.value)}
                  className="p-2 border border-border rounded-lg bg-input text-text text-control focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent"
                >
                  {Object.keys(PIXEL_CHAR_SETS).map((key) => (
                    <option key={key} value={key}>{key}</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        {/* Empty state */}
        {!hasResults && (
          <div className="text-center py-16 text-textDim">
            <p className="text-body">
              {mode === 'figlet'
                ? 'Type something above to see all font variations'
                : 'Type something above to generate pixel block art'}
            </p>
          </div>
        )}

        {/* FIGlet gallery */}
        {mode === 'figlet' && hasResults && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {FONTS.map((font) => {
              const output = figletResults[font];
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

        {/* Pixel output */}
        {mode === 'pixel' && pixelOutput && (
          <div className="border border-border rounded-lg overflow-hidden bg-surface">
            <div className="px-4 py-2.5 border-b border-border flex justify-between items-center">
              <h3 className="text-body-emphasis text-text font-medium">
                Pixel Block — {charSetKey}
              </h3>
              <Button variant="ghost" size="sm" onClick={() => handleCopy(pixelOutput)}>
                Copy
              </Button>
            </div>
            <pre className="p-4 font-mono text-text whitespace-pre overflow-x-auto bg-input max-h-[600px] overflow-y-auto leading-[1.1] tracking-[0]">
              {pixelOutput}
            </pre>
          </div>
        )}
      </main>
    </div>
  );
}
