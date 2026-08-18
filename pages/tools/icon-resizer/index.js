import { useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import { Button } from '../../../components/ui/button';
import { buildZip } from '../../../utils/spriteSlicer';
import {
  PLATFORMS,
  deselectPlatformKeys,
  flattenSizes,
  isUpscale,
  platformSizeKeys,
  selectPlatformKeys,
  sizeKey,
  sortSizes,
} from '../../../utils/iconResizer';

const CHECKERBOARD = {
  backgroundImage:
    'linear-gradient(45deg, #cbd5e1 25%, transparent 25%), linear-gradient(-45deg, #cbd5e1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cbd5e1 75%), linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)',
  backgroundSize: '16px 16px',
  backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0',
  backgroundColor: '#f8fafc',
};

function readDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to decode image'));
    img.src = src;
  });
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

function sanitizeName(name) {
  const cleaned = String(name || '').trim().replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');
  return cleaned || 'icon';
}

function fitRect(srcW, srcH, target, fit) {
  const scale = fit === 'cover' ? target / Math.min(srcW, srcH) : target / Math.max(srcW, srcH);
  const w = srcW * scale;
  const h = srcH * scale;
  return { w, h, x: (target - w) / 2, y: (target - h) / 2 };
}

async function loadSource(file) {
  const isSvg = file.type === 'image/svg+xml' || /.svg$/i.test(file.name);
  if (isSvg) {
    const dataUrl = await readDataUrl(file);
    const img = await loadImage(dataUrl);
    let w = img.naturalWidth || 0;
    let h = img.naturalHeight || 0;
    if (!w || !h) {
      try {
        const text = await file.text();
        const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
        const svg = doc.documentElement;
        const vb = svg.getAttribute('viewBox');
        if (vb) {
          const parts = vb.trim().split(/[\s,]+/).map(Number);
          if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
            w = parts[2];
            h = parts[3];
          }
        }
        if (!w || !h) {
          const ww = parseFloat(svg.getAttribute('width'));
          const hh = parseFloat(svg.getAttribute('height'));
          if (ww > 0) w = ww;
          if (hh > 0) h = hh;
        }
      } catch (e) {
        // ignore parse errors; fall back to square
      }
    }
    return { kind: 'svg', drawable: img, width: w || null, height: h || null };
  }

  const dataUrl = await readDataUrl(file);
  const img = await loadImage(dataUrl);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  canvas.getContext('2d').drawImage(img, 0, 0);
  return { kind: 'raster', drawable: canvas, width: img.naturalWidth, height: img.naturalHeight };
}

function renderTarget(source, px, fit, mode) {
  const canvas = document.createElement('canvas');
  canvas.width = px;
  canvas.height = px;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, px, px);
  const sw = source.width || px;
  const sh = source.height || px;
  const rect = fitRect(sw, sh, px, fit);
  ctx.imageSmoothingEnabled = mode !== 'pixel';
  if (mode !== 'pixel') {
    try {
      ctx.imageSmoothingQuality = 'high';
    } catch (e) {
      // not all browsers support smoothing quality; ignore
    }
  }
  if (source.kind === 'svg') {
    ctx.drawImage(source.drawable, rect.x, rect.y, rect.w, rect.h);
  } else {
    ctx.drawImage(source.drawable, 0, 0, sw, sh, rect.x, rect.y, rect.w, rect.h);
  }
  return canvas;
}

export default function IconResizerTool() {
  const [source, setSource] = useState(null);
  const [selected, setSelected] = useState(() => new Set());
  const [customSizes, setCustomSizes] = useState([]);
  const [customPx, setCustomPx] = useState('');
  const [customName, setCustomName] = useState('');
  const [fit, setFit] = useState('contain');
  const [mode, setMode] = useState('smooth');
  const [outputs, setOutputs] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const customCounterRef = useRef(0);

  const flatSizes = useMemo(() => flattenSizes(), []);

  const targets = useMemo(() => {
    const list = [];
    for (const s of flatSizes) {
      if (selected.has(s.key)) list.push({ ...s, path: s.folder + '/' + s.file, custom: false });
    }
    for (const c of customSizes) {
      if (selected.has(c.key)) list.push({ ...c, custom: true });
    }
    return sortSizes(list);
  }, [flatSizes, selected, customSizes]);

  const upscaleCount = useMemo(() => {
    if (!source || source.kind === 'svg') return 0;
    return targets.filter((t) => isUpscale(source.width || 0, source.height || 0, t.px)).length;
  }, [source, targets]);

  const handleFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setError('');
    setLoading(true);
    setOutputs([]);
    try {
      const src = await loadSource(file);
      setSource(src);
    } catch (err) {
      setSource(null);
      setError('Failed to load image: ' + (err && err.message ? err.message : err));
    } finally {
      setLoading(false);
    }
  };

  const toggleSize = (key) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const platformState = (id) => {
    const keys = platformSizeKeys(id);
    const count = keys.filter((k) => selected.has(k)).length;
    return { count, total: keys.length, checked: keys.length > 0 && count === keys.length, partial: count > 0 && count < keys.length };
  };

  const togglePlatform = (id) => {
    setSelected((prev) => {
      const keys = platformSizeKeys(id);
      const count = keys.filter((k) => prev.has(k)).length;
      const checked = keys.length > 0 && count === keys.length;
      return checked ? deselectPlatformKeys(prev, id) : selectPlatformKeys(prev, id);
    });
  };

  const toggleAll = () => {
    setSelected((prev) => {
      if (prev.size === flatSizes.length + customSizes.length) return new Set();
      const next = new Set(flatSizes.map((s) => s.key));
      for (const c of customSizes) next.add(c.key);
      return next;
    });
  };

  const clearAll = () => setSelected(new Set());

  const addCustom = () => {
    const px = parseInt(customPx, 10);
    if (!Number.isFinite(px) || px < 1 || px > 4096) {
      setError('Custom size must be a whole number between 1 and 4096');
      return;
    }
    setError('');
    const base = sanitizeName(customName) + '-' + px;
    let file = base + '.png';
    if (customSizes.some((c) => c.file === file)) {
      file = base + '-' + customCounterRef.current + '.png';
    }
    const key = 'custom/' + customCounterRef.current++;
    const item = { key, label: 'custom', px, file, path: 'custom/' + file };
    setCustomSizes((prev) => [...prev, item]);
    setSelected((prev) => new Set(prev).add(key));
    setCustomPx('');
    setCustomName('');
  };

  const removeCustom = (key) => {
    setCustomSizes((prev) => prev.filter((c) => c.key !== key));
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
    setOutputs((prev) => prev.filter((o) => o.key !== key));
  };

  const handleGenerate = async () => {
    if (!source) {
      setError('Upload an image first');
      return;
    }
    if (targets.length === 0) {
      setError('Select at least one size');
      return;
    }
    setError('');
    setGenerating(true);
    setOutputs([]);
    await new Promise((resolve) => setTimeout(resolve, 0));
    const results = [];
    for (const t of targets) {
      const canvas = renderTarget(source, t.px, fit, mode);
      const dataUrl = canvas.toDataURL('image/png');
      const upscale = source.kind !== 'svg' && isUpscale(source.width || 0, source.height || 0, t.px);
      results.push({ key: t.key, path: t.path, px: t.px, label: t.label, dataUrl, upscale, custom: t.custom });
    }
    setOutputs(results);
    setGenerating(false);
  };

  const handleDownloadZip = () => {
    if (outputs.length === 0) return;
    const entries = outputs.map((o) => ({ name: o.path, data: dataUrlToBytes(o.dataUrl) }));
    const zip = buildZip(entries);
    downloadBlob(zip, 'app-icons.zip', 'application/zip');
  };

  const totalSelected = selected.size;

  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>App Icon Resizer - Vibe Tools</title>
        <meta name="description" content="Generate iOS, macOS, Android and Web app icons at every size from one image" />
      </Head>

      <header className="border-b border-border py-10">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="font-display text-product text-text mb-1 tracking-tight">App Icon Resizer</h1>
          <p className="text-body text-textMuted">One image → every app icon size for iOS, macOS, Android &amp; Web. Runs entirely in your browser, packaged as a ZIP.</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Upload */}
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-surface">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml" className="hidden" />
            <Button variant="outline" onClick={() => fileInputRef.current && fileInputRef.current.click()} disabled={loading}>
              {loading ? 'Loading…' : source ? 'Replace image' : 'Select an image'}
            </Button>
            {source && !loading && <p className="text-control text-textMuted mt-2">Click again to replace</p>}
          </div>

          {error && <div className="text-error text-control p-3 bg-errorBg rounded" role="alert">{error}</div>}

          {source && (
            <>
              {/* Source info */}
              <div className="border border-border rounded-lg bg-surface p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-body-emphasis text-text mb-1">Source</h3>
                    <p className="text-control text-textMuted">
                      {source.kind === 'svg'
                        ? 'SVG vector image'
                        : source.width + ' × ' + source.height + ' px (raster)'}
                    </p>
                    <p className="text-micro text-textMuted mt-1">
                      Recommend a source at least 1024×1024 for sharp App Store / Play Store icons.
                    </p>
                  </div>
                  <div className="w-20 h-20 rounded border border-border overflow-hidden flex-shrink-0" style={CHECKERBOARD}>
                    {source.kind === 'svg' ? (
                      <img src={source.drawable.src} alt="source preview" className="w-full h-full object-contain" />
                    ) : (
                      <img src={source.drawable.toDataURL('image/png')} alt="source preview" className="w-full h-full object-contain" />
                    )}
                  </div>
                </div>

                {source.kind === 'svg' && (
                  <div className="text-control p-3 rounded bg-green-500/10 text-green-700 dark:text-green-300 mt-3">
                    SVG source — every size renders losslessly (no blur on upscale).
                  </div>
                )}
                {source.kind !== 'svg' && upscaleCount > 0 && (
                  <div className="text-control p-3 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 mt-3">
                    {upscaleCount} selected size{upscaleCount > 1 ? 's are' : ' is'} larger than your source and will be upscaled — expect some blur. Upload a larger source or an SVG for crisp results.
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-control font-medium text-text mb-2">Fit</label>
                  <select value={fit} onChange={(e) => setFit(e.target.value)} className="w-full p-3 border border-border rounded bg-input text-text focus:outline-none focus:ring-2 focus:ring-focus-ring">
                    <option value="contain">Contain — fit whole image</option>
                    <option value="cover">Cover — crop to fill</option>
                  </select>
                </div>
                <div>
                  <label className="block text-control font-medium text-text mb-2">Scaling</label>
                  <select value={mode} onChange={(e) => setMode(e.target.value)} className="w-full p-3 border border-border rounded bg-input text-text focus:outline-none focus:ring-2 focus:ring-focus-ring">
                    <option value="smooth">Smooth (anti-aliased)</option>
                    <option value="pixel">Pixel (nearest-neighbor)</option>
                  </select>
                </div>
              </div>

              {/* Platform & size picker */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-body-emphasis text-text">Sizes</h3>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={toggleAll}>Select all</Button>
                    <Button variant="ghost" size="sm" onClick={clearAll}>Clear</Button>
                  </div>
                </div>

                {PLATFORMS.map((platform) => {
                  const state = platformState(platform.id);
                  return (
                    <div key={platform.id} className="border border-border rounded-lg bg-surface p-4">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <button type="button" onClick={() => togglePlatform(platform.id)} className="flex items-center gap-2 text-left">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded border border-border text-primary text-control leading-none">
                            {state.checked ? '✓' : state.partial ? '–' : ''}
                          </span>
                          <span className="text-body-emphasis text-text">{platform.label}</span>
                        </button>
                        <div className="flex items-center gap-2">
                          <span className="text-micro text-textMuted">{state.count}/{state.total}</span>
                          <Button variant="ghost" size="sm" onClick={() => togglePlatform(platform.id)}>
                            {state.checked ? 'Clear' : 'Select all'}
                          </Button>
                        </div>
                      </div>
                      <p className="text-micro text-textMuted mt-1">{platform.note}</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-3">
                        {platform.sizes.map((size) => {
                          const key = sizeKey(platform.id, size.file);
                          const upscale = source.kind !== 'svg' && isUpscale(source.width || 0, source.height || 0, size.px);
                          return (
                            <label
                              key={key}
                              className={
                                'flex flex-col gap-0.5 p-2 rounded border cursor-pointer select-none transition-colors ' +
                                (selected.has(key) ? 'border-primary bg-primary/10' : 'border-border bg-input hover:bg-surfaceHover')
                              }
                            >
                              <input type="checkbox" checked={selected.has(key)} onChange={() => toggleSize(key)} className="hidden" />
                              <span className="flex items-center justify-between gap-1">
                                <span className="text-body-emphasis text-text">{size.px}px</span>
                                {upscale && <span className="text-micro text-amber-600 dark:text-amber-400" title="Upscaled from source">↑</span>}
                              </span>
                              <span className="text-micro text-textMuted truncate">{size.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom size */}
              <div className="border border-border rounded-lg bg-surface p-4 space-y-4">
                <div>
                  <h3 className="text-body-emphasis text-text mb-1">Custom size</h3>
                  <p className="text-micro text-textMuted">Add a square size not in the presets (e.g. 256, 500).</p>
                </div>
                <div className="flex flex-wrap items-end gap-3">
                  <div>
                    <label className="block text-control font-medium text-text mb-2">Size (px)</label>
                    <input type="number" min="1" max="4096" value={customPx} onChange={(e) => setCustomPx(e.target.value)} placeholder="256" className="w-28 p-3 border border-border rounded bg-input text-text focus:outline-none focus:ring-2 focus:ring-focus-ring" />
                  </div>
                  <div>
                    <label className="block text-control font-medium text-text mb-2">Name (optional)</label>
                    <input type="text" value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="icon" className="w-40 p-3 border border-border rounded bg-input text-text focus:outline-none focus:ring-2 focus:ring-focus-ring" />
                  </div>
                  <Button variant="outline" onClick={addCustom}>Add</Button>
                </div>
                {customSizes.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {customSizes.map((c) => (
                      <span key={c.key} className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-border bg-input text-control text-text">
                        {c.px}px
                        <button type="button" onClick={() => removeCustom(c.key)} className="text-textMuted hover:text-error" aria-label="Remove custom size">✕</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 items-center">
                <Button onClick={handleGenerate} disabled={generating || !source || totalSelected === 0}>
                  {generating ? 'Generating…' : 'Generate ' + (totalSelected > 0 ? totalSelected + ' sizes' : '')}
                </Button>
                {outputs.length > 0 && (
                  <Button variant="outline" onClick={handleDownloadZip}>Download ZIP ({outputs.length})</Button>
                )}
                {generating && (
                  <svg className="animate-spin h-5 w-5 text-primary" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
              </div>

              {/* Preview */}
              {outputs.length > 0 && (
                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="bg-surface px-4 py-2.5 border-b border-border flex items-center justify-between">
                    <h3 className="text-body-emphasis text-text">Preview</h3>
                    <span className="text-micro text-textMuted">{outputs.length} files</span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 p-4 bg-input">
                    {outputs.map((o) => (
                      <div key={o.key} className="flex flex-col items-center gap-1 p-1 rounded">
                        <div className="w-full aspect-square flex items-center justify-center rounded border border-border overflow-hidden" style={CHECKERBOARD}>
                          <img src={o.dataUrl} alt={o.path} className="max-w-full max-h-full object-contain" />
                        </div>
                        <span className="text-micro text-textMuted truncate w-full text-center">{o.px}px</span>
                        {o.upscale && <span className="text-micro text-amber-600 dark:text-amber-400">↑ upscaled</span>}
                        <span className="text-[10px] text-textMuted truncate w-full text-center" title={o.path}>{o.path}</span>
                        <Button variant="ghost" size="sm" onClick={() => downloadDataUrl(o.dataUrl, o.path.split('/').pop())}>Save</Button>
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
