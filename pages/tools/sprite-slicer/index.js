import { useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import { Button } from '../../../components/ui/button';
import { useTheme } from '../../../contexts/ThemeContext';
import {
  buildZip,
  computeAtlasTiles,
  detectAtlasGrid,
  hexToRgb,
  removeBackgroundByColorKey,
  removeBackgroundFloodFill,
} from '../../../utils/spriteSlicer';

const COLOR_PRESETS = [
  { label: 'White', hex: '#ffffff' },
  { label: 'Green', hex: '#00ff00' },
  { label: 'Blue', hex: '#0000ff' },
  { label: 'Magenta', hex: '#ff00ff' },
  { label: 'Black', hex: '#000000' },
];

const CHECKERBOARD = {
  backgroundImage:
    'linear-gradient(45deg, #cbd5e1 25%, transparent 25%), linear-gradient(-45deg, #cbd5e1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cbd5e1 75%), linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)',
  backgroundSize: '16px 16px',
  backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0',
  backgroundColor: '#f8fafc',
};

function intVal(value, fallback) {
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function posInt(value, fallback) {
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function baseName(fileName) {
  return (fileName || 'sprite').replace(/\.[^.]+$/, '');
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function frameName(index, total) {
  const digits = Math.max(2, String(Math.max(0, total - 1)).length);
  return String(index).padStart(digits, '0') + '.png';
}

function dataUrlToBytes(dataUrl) {
  const base64 = dataUrl.split(',')[1] || '';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function downloadBlob(bytes, filename, mime) {
  const blob = new Blob([bytes], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function downloadDataUrl(dataUrl, filename) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function tileToDataUrl(sourceData, width, height, tile) {
  const canvas = document.createElement('canvas');
  canvas.width = tile.w;
  canvas.height = tile.h;
  const ctx = canvas.getContext('2d');
  const tileData = ctx.createImageData(tile.w, tile.h);
  for (let y = 0; y < tile.h; y++) {
    const srcIdx = ((tile.y + y) * width + tile.x) * 4;
    const dstIdx = y * tile.w * 4;
    tileData.data.set(sourceData.subarray(srcIdx, srcIdx + tile.w * 4), dstIdx);
  }
  ctx.putImageData(tileData, 0, 0);
  return canvas.toDataURL('image/png');
}

function computeTiles(width, height, cfg) {
  return computeAtlasTiles(
    width,
    height,
    posInt(cfg.tileW, 32),
    posInt(cfg.tileH, 32),
    intVal(cfg.marginX, 0),
    intVal(cfg.marginY, 0),
    intVal(cfg.sepX, 0),
    intVal(cfg.sepY, 0)
  );
}

function Toggle({ active, onClick, children, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={
        'px-2.5 py-1 rounded text-micro font-medium transition-colors ' +
        (active
          ? 'bg-primary text-primaryText'
          : 'border border-border text-text hover:bg-surfaceHover') +
        (disabled ? ' opacity-50 cursor-not-allowed' : '')
      }
    >
      {children}
    </button>
  );
}

export default function SpriteSlicerTool() {
  const [source, setSource] = useState(null);
  const [error, setError] = useState('');
  const [tileW, setTileW] = useState('32');
  const [tileH, setTileH] = useState('32');
  const [marginX, setMarginX] = useState('0');
  const [marginY, setMarginY] = useState('0');
  const [sepX, setSepX] = useState('0');
  const [sepY, setSepY] = useState('0');
  const [bgMode, setBgMode] = useState('none');
  const [targetColor, setTargetColor] = useState('#ffffff');
  const [tolerance, setTolerance] = useState(30);
  const [tiles, setTiles] = useState(null);
  const [slicing, setSlicing] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [dimBackground, setDimBackground] = useState(true);
  const [showIndices, setShowIndices] = useState(false);
  const [previewBgRemoval, setPreviewBgRemoval] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [loop, setLoop] = useState(true);
  const [fps, setFps] = useState(8);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [detectStatus, setDetectStatus] = useState('');
  const fileInputRef = useRef(null);
  const sourceCanvasRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const dragIdRef = useRef(null);
  const { theme, mounted } = useTheme();

  const previewTiles = useMemo(() => {
    if (!source) return [];
    return computeTiles(source.width, source.height, {
      tileW,
      tileH,
      marginX,
      marginY,
      sepX,
      sepY,
    });
  }, [source, tileW, tileH, marginX, marginY, sepX, sepY]);

  const processedCanvas = useMemo(() => {
    if (typeof document === 'undefined') return null;
    if (!source || !previewBgRemoval || bgMode === 'none') return null;
    const { imageData, width, height } = source;
    let processed;
    if (bgMode === 'color') {
      const target = hexToRgb(targetColor);
      if (!target) return null;
      processed = removeBackgroundByColorKey(imageData.data, width, height, target, tolerance);
    } else if (bgMode === 'flood') {
      processed = removeBackgroundFloodFill(imageData.data, width, height, tolerance);
    }
    if (!processed) return null;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d').putImageData(new ImageData(processed, width, height), 0, 0);
    return canvas;
  }, [source, previewBgRemoval, bgMode, targetColor, tolerance]);

  useEffect(() => {
    const canvas = previewCanvasRef.current;
    const src = sourceCanvasRef.current;
    if (!canvas || !src || !source) return;
    const { width, height } = source;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    if (previewBgRemoval && processedCanvas) {
      ctx.drawImage(processedCanvas, 0, 0);
    } else {
      ctx.drawImage(src, 0, 0);
      if (dimBackground) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
        ctx.fillRect(0, 0, width, height);
        for (const t of previewTiles) {
          ctx.drawImage(src, t.x, t.y, t.w, t.h, t.x, t.y, t.w, t.h);
        }
      }
    }

    if (showIndices) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.font = 'bold 13px ui-sans-serif, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (const t of previewTiles) {
        if (t.w < 24 || t.h < 24) continue;
        const label = t.row + ',' + t.col;
        ctx.lineWidth = 3;
        ctx.strokeText(label, t.x + t.w / 2, t.y + t.h / 2);
        ctx.lineWidth = 1;
        ctx.fillText(label, t.x + t.w / 2, t.y + t.h / 2);
      }
    }

    if (showGrid) {
      const isDark =
        typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
      const gridColor = isDark ? 'rgba(250, 204, 21, 0.95)' : 'rgba(219, 39, 119, 0.95)';
      const haloColor = isDark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.85)';

      // Draw a contrasting halo first so the grid line reads against any image,
      // then the colored 2px line on top.
      ctx.strokeStyle = haloColor;
      ctx.lineWidth = 4;
      for (const t of previewTiles) {
        ctx.strokeRect(t.x + 0.5, t.y + 0.5, t.w - 1, t.h - 1);
      }
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 2;
      for (const t of previewTiles) {
        ctx.strokeRect(t.x + 0.5, t.y + 0.5, t.w - 1, t.h - 1);
      }
    }
  }, [source, previewTiles, processedCanvas, dimBackground, showGrid, showIndices, previewBgRemoval, theme, mounted]);

  // ---- Animation playback ----
  useEffect(() => {
    if (!playing || !tiles || tiles.length === 0) return;
    const intervalMs = Math.max(16, Math.round(1000 / Math.max(1, fps)));
    const id = setInterval(() => {
      setCurrentFrame((prev) => {
        if (tiles.length <= 1) return 0;
        if (prev + 1 < tiles.length) return prev + 1;
        return loop ? 0 : prev;
      });
    }, intervalMs);
    return () => clearInterval(id);
  }, [playing, loop, fps, tiles]);

  useEffect(() => {
    if (!playing || loop || !tiles || tiles.length === 0) return;
    if (currentFrame >= tiles.length - 1) setPlaying(false);
  }, [playing, loop, tiles, currentFrame]);

  const togglePlay = () => {
    if (!tiles || tiles.length === 0) return;
    if (playing) {
      setPlaying(false);
      return;
    }
    setCurrentFrame((prev) => (prev >= tiles.length - 1 ? 0 : prev));
    setPlaying(true);
  };

  // ---- Frame reordering (drag & drop) ----
  const handleDragStart = (tile) => {
    dragIdRef.current = tile.index;
  };
  const handleDragOver = (e, targetIdx) => {
    e.preventDefault();
    setDragOverIndex(targetIdx);
    if (dragIdRef.current === null) return;
    setTiles((prev) => {
      const from = prev.findIndex((t) => t.index === dragIdRef.current);
      if (from === -1 || from === targetIdx) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(targetIdx, 0, moved);
      return next;
    });
  };
  const handleDrop = (e) => {
    e.preventDefault();
  };
  const handleDragEnd = () => {
    dragIdRef.current = null;
    setDragOverIndex(null);
  };

  const handleAutoDetect = () => {
    if (!source) return;
    const detected = detectAtlasGrid(source.imageData.data, source.width, source.height);
    if (!detected) {
      setDetectStatus('Could not auto-detect a grid — set the tile size manually.');
      return;
    }
    setTileW(String(detected.tileW));
    setTileH(String(detected.tileH));
    setMarginX(String(detected.marginX));
    setMarginY(String(detected.marginY));
    setSepX(String(detected.sepX));
    setSepY(String(detected.sepY));
    setDetectStatus(
      'Detected ' + detected.cols + ' × ' + detected.rows + ' grid — tile ' +
      detected.tileW + '×' + detected.tileH + 'px, offset ' +
      detected.marginX + ',' + detected.marginY + ', gap ' +
      detected.sepX + ',' + detected.sepY
    );
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG recommended).');
      return;
    }
    setError('');
    setTiles(null);
    setPlaying(false);
    setCurrentFrame(0);
    setDetectStatus('');
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        sourceCanvasRef.current = canvas;
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        setSource({
          name: baseName(file.name),
          imageData,
          width: img.width,
          height: img.height,
        });
      };
      img.onerror = () => setError('Failed to decode that image.');
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSlice = () => {
    if (!source) return;
    setError('');
    setSlicing(true);
    setTimeout(() => {
      try {
        const { imageData, width, height } = source;
        let processed = imageData.data;
        if (bgMode === 'color') {
          const target = hexToRgb(targetColor);
          if (!target) {
            setError('Invalid target color.');
            setSlicing(false);
            return;
          }
          processed = removeBackgroundByColorKey(imageData.data, width, height, target, tolerance);
        } else if (bgMode === 'flood') {
          processed = removeBackgroundFloodFill(imageData.data, width, height, tolerance);
        }

        const list = computeTiles(width, height, {
          tileW,
          tileH,
          marginX,
          marginY,
          sepX,
          sepY,
        });
        const results = list.map((tile) => ({
          ...tile,
          name: source.name + '-' + pad2(tile.row) + '-' + pad2(tile.col) + '.png',
          dataUrl: tileToDataUrl(processed, width, height, tile),
        }));
        setTiles(results);
        setPlaying(false);
        setCurrentFrame(0);
      } catch (err) {
        setError(err?.message || 'Failed to slice the image.');
      } finally {
        setSlicing(false);
      }
    }, 0);
  };

  const handleDownloadAll = () => {
    if (!tiles || tiles.length === 0) return;
    const entries = tiles.map((t, i) => ({ name: frameName(i, tiles.length), data: dataUrlToBytes(t.dataUrl) }));
    const zip = buildZip(entries);
    downloadBlob(zip, source.name + '-frames.zip', 'application/zip');
  };

  const canSlice = !!source && previewTiles.length > 0;
  const tileCols = previewTiles.reduce((m, t) => Math.max(m, t.col + 1), 0);
  const tileRows = previewTiles.reduce((m, t) => Math.max(m, t.row + 1), 0);

  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>Sprite Slicer - Vibe Tools</title>
        <meta name="description" content="Slice PNG sprite sheets into tiles and remove solid-color backgrounds" />
      </Head>

      <header className="border-b border-border py-10">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="font-display text-product text-text mb-1 tracking-tight">Sprite Slicer</h1>
          <p className="text-body text-textMuted">
            Cut a PNG tile sheet into individual tiles, with offset, gap and optional background removal.
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Upload */}
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-surface">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,.png" className="hidden" />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              {source ? 'Choose a different image' : 'Select a sprite sheet (PNG)'}
            </Button>
            {source && (
              <p className="text-control text-textMuted mt-3">
                {source.name}.png — {source.width} × {source.height}px
              </p>
            )}
          </div>

          {error && (
            <div className="text-error text-control p-3 bg-errorBg rounded" role="alert">
              {error}
            </div>
          )}

          {source && (
            <>
              {/* Preview */}
              <div className="border border-border rounded-lg overflow-hidden bg-surface">
                <div className="bg-surface px-4 py-2.5 border-b border-border flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-body-emphasis text-text">Preview</h3>
                  <span className="text-micro text-textMuted">
                    {previewTiles.length > 0
                      ? tileCols + ' × ' + tileRows + ' grid · ' + previewTiles.length + ' tiles'
                      : 'No full tiles fit these settings'}
                  </span>
                </div>
                <div className="p-4 flex flex-col items-center gap-3">
                  <div className="w-full max-w-[520px]">
                    <canvas
                      ref={previewCanvasRef}
                      width={source.width}
                      height={source.height}
                      className="w-full h-auto rounded border border-border"
                      style={CHECKERBOARD}
                    />
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <Toggle active={dimBackground} onClick={() => setDimBackground((v) => !v)}>
                      Dim background
                    </Toggle>
                    <Toggle active={showGrid} onClick={() => setShowGrid((v) => !v)}>
                      Grid lines
                    </Toggle>
                    <Toggle active={showIndices} onClick={() => setShowIndices((v) => !v)}>
                      Indices
                    </Toggle>
                    <Toggle
                      active={previewBgRemoval}
                      onClick={() => setPreviewBgRemoval((v) => !v)}
                      disabled={bgMode === 'none'}
                    >
                      Preview bg removal
                    </Toggle>
                  </div>
                </div>
              </div>

              {/* Tile settings */}
              <div className="border border-border rounded-lg bg-surface p-4 space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-body-emphasis text-text mb-1">Tile settings</h3>
                    <p className="text-micro text-textMuted">Set the tile size, the offset from the top-left corner, and the gap between tiles.</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleAutoDetect}>
                    Auto detect
                  </Button>
                </div>
                {detectStatus && (
                  <p className="text-control text-primary" role="status">{detectStatus}</p>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-control font-medium text-text mb-2">Tile width (px)</label>
                    <input type="number" min="1" value={tileW} onChange={(e) => setTileW(e.target.value)} className="w-full p-3 border border-border rounded bg-input text-text focus:outline-none focus:ring-2 focus:ring-focus-ring" />
                  </div>
                  <div>
                    <label className="block text-control font-medium text-text mb-2">Tile height (px)</label>
                    <input type="number" min="1" value={tileH} onChange={(e) => setTileH(e.target.value)} className="w-full p-3 border border-border rounded bg-input text-text focus:outline-none focus:ring-2 focus:ring-focus-ring" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-control font-medium text-text mb-2">Offset X (px)</label>
                    <input type="number" min="0" value={marginX} onChange={(e) => setMarginX(e.target.value)} className="w-full p-3 border border-border rounded bg-input text-text focus:outline-none focus:ring-2 focus:ring-focus-ring" />
                  </div>
                  <div>
                    <label className="block text-control font-medium text-text mb-2">Offset Y (px)</label>
                    <input type="number" min="0" value={marginY} onChange={(e) => setMarginY(e.target.value)} className="w-full p-3 border border-border rounded bg-input text-text focus:outline-none focus:ring-2 focus:ring-focus-ring" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-control font-medium text-text mb-2">Gap X (px)</label>
                    <input type="number" min="0" value={sepX} onChange={(e) => setSepX(e.target.value)} className="w-full p-3 border border-border rounded bg-input text-text focus:outline-none focus:ring-2 focus:ring-focus-ring" />
                  </div>
                  <div>
                    <label className="block text-control font-medium text-text mb-2">Gap Y (px)</label>
                    <input type="number" min="0" value={sepY} onChange={(e) => setSepY(e.target.value)} className="w-full p-3 border border-border rounded bg-input text-text focus:outline-none focus:ring-2 focus:ring-focus-ring" />
                  </div>
                </div>
                <p className="text-micro text-textMuted">
                  Tiles start at the offset and step by tile size + gap. Partial tiles at the right/bottom are excluded.
                </p>
              </div>

              {/* Background removal */}
              <div className="border border-border rounded-lg bg-surface p-4 space-y-5">
                <div>
                  <label className="block text-control font-medium text-text mb-2">Background removal</label>
                  <select value={bgMode} onChange={(e) => setBgMode(e.target.value)} className="w-full p-3 border border-border rounded bg-input text-text focus:outline-none focus:ring-2 focus:ring-focus-ring">
                    <option value="none">None — keep tiles as-is</option>
                    <option value="color">Color key — remove a chosen color anywhere</option>
                    <option value="flood">Flood fill — remove background from the edges</option>
                  </select>
                </div>

                {bgMode === 'color' && (
                  <>
                    <div>
                      <label className="block text-control font-medium text-text mb-2">Background color</label>
                      <div className="flex flex-wrap items-center gap-2">
                        {COLOR_PRESETS.map((preset) => (
                          <button
                            key={preset.hex}
                            type="button"
                            title={preset.label}
                            onClick={() => setTargetColor(preset.hex)}
                            className={
                              'w-8 h-8 rounded-full border-2 ' +
                              (targetColor.toLowerCase() === preset.hex
                                ? 'border-primary ring-2 ring-focus-ring'
                                : 'border-border')
                            }
                            style={{ backgroundColor: preset.hex }}
                          />
                        ))}
                        <input type="color" value={targetColor} onChange={(e) => setTargetColor(e.target.value)} className="w-10 h-10 rounded border border-border bg-input cursor-pointer" aria-label="Custom background color" />
                        <input type="text" value={targetColor} onChange={(e) => setTargetColor(e.target.value)} className="w-28 p-2 border border-border rounded bg-input text-text text-control focus:outline-none focus:ring-2 focus:ring-focus-ring" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-control font-medium text-text mb-2">Tolerance: {tolerance}</label>
                      <input type="range" min="0" max="255" step="1" value={tolerance} onChange={(e) => setTolerance(parseInt(e.target.value, 10))} className="w-full accent-primary" />
                      <p className="text-micro text-textMuted mt-1">Higher values remove a wider range of similar colors.</p>
                    </div>
                  </>
                )}

                {bgMode === 'flood' && (
                  <div>
                    <label className="block text-control font-medium text-text mb-2">Tolerance: {tolerance}</label>
                    <input type="range" min="0" max="255" step="1" value={tolerance} onChange={(e) => setTolerance(parseInt(e.target.value, 10))} className="w-full accent-primary" />
                    <p className="text-micro text-textMuted mt-1">The edge color is auto-detected from the four corners; only the connected background region is removed.</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 items-center">
                <Button onClick={handleSlice} disabled={!canSlice || slicing}>
                  {slicing ? 'Slicing…' : 'Slice into tiles'}
                </Button>
                {tiles && tiles.length > 0 && (
                  <Button variant="outline" onClick={handleDownloadAll}>
                    Download all as ZIP
                  </Button>
                )}
                {slicing && (
                  <svg className="animate-spin h-5 w-5 text-primary" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
              </div>

              {/* Frame animation player */}
              {tiles && tiles.length > 0 && (
                <div className="border border-border rounded-lg overflow-hidden bg-surface">
                  <div className="bg-surface px-4 py-2.5 border-b border-border flex items-center justify-between">
                    <h3 className="text-body-emphasis text-text">Frame Animation</h3>
                    <span className="text-micro text-textMuted">
                      Frame {currentFrame + 1} / {tiles.length}
                    </span>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="flex justify-center">
                      <div className="w-44 h-44 flex items-center justify-center rounded border border-border overflow-hidden" style={CHECKERBOARD}>
                        {tiles[currentFrame] && (
                          <img src={tiles[currentFrame].dataUrl} alt={'Frame ' + currentFrame} className="max-w-full max-h-full object-contain" />
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <Button onClick={togglePlay} disabled={tiles.length === 0}>
                        {playing ? 'Pause' : 'Play'}
                      </Button>
                      <Toggle active={loop} onClick={() => setLoop(true)}>Loop</Toggle>
                      <Toggle active={!loop} onClick={() => setLoop(false)}>Once</Toggle>
                      <div className="flex items-center gap-2 ml-2">
                        <label className="text-control text-textMuted">FPS</label>
                        <input
                          type="number"
                          min="1"
                          max="60"
                          value={fps}
                          onChange={(e) => setFps(Math.max(1, Math.min(60, parseInt(e.target.value, 10) || 8)))}
                          className="w-20 p-2 border border-border rounded bg-input text-text text-control focus:outline-none focus:ring-2 focus:ring-focus-ring"
                        />
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={Math.max(0, tiles.length - 1)}
                      step="1"
                      value={currentFrame}
                      onChange={(e) => setCurrentFrame(parseInt(e.target.value, 10))}
                      className="w-full accent-primary"
                    />
                    <p className="text-micro text-textMuted text-center">
                      Drag the tiles below to reorder frames — download names them 0-n in this order.
                    </p>
                  </div>
                </div>
              )}

              {/* Results */}
              {tiles && tiles.length > 0 && (
                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="bg-surface px-4 py-2.5 border-b border-border flex items-center justify-between">
                    <h3 className="text-body-emphasis text-text">Frames</h3>
                    <span className="text-micro text-textMuted">{tiles.length} frames · drag to reorder</span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 p-4 bg-input">
                    {tiles.map((tile, frameIndex) => (
                      <div
                        key={tile.index}
                        draggable
                        onDragStart={() => handleDragStart(tile)}
                        onDragOver={(e) => handleDragOver(e, frameIndex)}
                        onDrop={handleDrop}
                        onDragEnd={handleDragEnd}
                        className={
                          'relative flex flex-col items-center gap-1 p-1 rounded cursor-grab active:cursor-grabbing ' +
                          (dragOverIndex === frameIndex ? 'ring-2 ring-primary' : '')
                        }
                      >
                        <div className="absolute top-1 left-1 z-10 bg-black/70 text-white text-micro rounded px-1 leading-tight">
                          {frameIndex}
                        </div>
                        <div className="w-full aspect-square flex items-center justify-center rounded border border-border overflow-hidden" style={CHECKERBOARD} title={'Frame ' + frameIndex}>
                          <img src={tile.dataUrl} alt={'Frame ' + frameIndex} className="max-w-full max-h-full object-contain" draggable={false} />
                        </div>
                        <span className="text-micro text-textMuted truncate w-full text-center">{tile.w}×{tile.h}</span>
                        <Button variant="ghost" size="sm" onClick={() => downloadDataUrl(tile.dataUrl, frameName(frameIndex, tiles.length))}>
                          Save
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
