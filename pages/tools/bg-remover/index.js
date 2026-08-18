import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import { Button } from '../../../components/ui/button';
import {
  applyMask,
  featherEdges,
  hexToRgb,
  rasterizePolygon,
  removeBackgroundByColorKey,
  removeBackgroundFloodFill,
} from '../../../utils/bgRemover';

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

function baseName(fileName) {
  return (fileName || 'image').replace(/\.[^.]+$/, '');
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('');
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

function drawCircleMask(mask, width, height, cx, cy, radius, value) {
  const r = Math.max(1, Math.floor(radius || 1));
  const x0 = Math.max(0, Math.floor(cx - r));
  const y0 = Math.max(0, Math.floor(cy - r));
  const x1 = Math.min(width - 1, Math.ceil(cx + r));
  const y1 = Math.min(height - 1, Math.ceil(cy + r));
  const rSq = r * r;
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      if ((x - cx) * (x - cx) + (y - cy) * (y - cy) <= rSq) {
        mask[y * width + x] = value;
      }
    }
  }
}

function hexToRgbaStr(hex, alpha) {
  const c = hexToRgb(hex);
  if (!c) return 'rgba(255,0,0,0.35)';
  return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + alpha + ')';
}

export default function BgRemoverTool() {
  const [source, setSource] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('color');
  const [targetColor, setTargetColor] = useState('#ffffff');
  const [tolerance, setTolerance] = useState(30);
  const [featherRadius, setFeatherRadius] = useState(0);
  const [outputFormat, setOutputFormat] = useState('png');
  const [showBefore, setShowBefore] = useState(false);
  const [eyedropperActive, setEyedropperActive] = useState(false);
  const [eyedropperColor, setEyedropperColor] = useState(null);

  // ---- Mask state ----
  const [maskTool, setMaskTool] = useState('none');
  const [brushSize, setBrushSize] = useState(12);
  const [maskData, setMaskData] = useState(null);
  const [lassoPoints, setLassoPoints] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushPos, setBrushPos] = useState(null);

  const fileInputRef = useRef(null);
  const sourceCanvasRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const maskCanvasRef = useRef(null);
  const previewContainerRef = useRef(null);

  // ---- Clear mask on new image ----
  const clearMask = useCallback(() => {
    setMaskData(null);
    setLassoPoints([]);
    setMaskTool('none');
    setBrushPos(null);
  }, []);

  // ---- Process image ----
  const processedCanvas = useMemo(() => {
    if (typeof document === 'undefined') return null;
    if (!source) return null;

    const { imageData, width, height } = source;
    let processed;

    if (mode === 'color') {
      const target = hexToRgb(targetColor);
      if (!target) return null;
      processed = removeBackgroundByColorKey(imageData.data, width, height, target, tolerance);
    } else if (mode === 'flood') {
      processed = removeBackgroundFloodFill(imageData.data, width, height, tolerance);
    }

    if (!processed) return null;

    // Apply edge feathering
    if (featherRadius > 0) {
      processed = featherEdges(processed, width, height, featherRadius);
    }

    // Build combined mask
    let combinedMask = null;

    // Lasso polygon mask
    if (lassoPoints.length >= 3) {
      combinedMask = rasterizePolygon(lassoPoints, width, height);
    }

    // Brush mask (protection)
    if (maskData && maskData.length === width * height) {
      if (combinedMask) {
        // Merge: brush protection overrides the polygon mask (both mark as protected)
        for (let i = 0; i < combinedMask.length; i++) {
          if (maskData[i] !== 0) combinedMask[i] = 1;
        }
      } else {
        combinedMask = new Uint8Array(maskData);
      }
    }

    // Apply mask to restore protected pixels
    if (combinedMask) {
      applyMask(processed, imageData.data, combinedMask, width, height);
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d').putImageData(new ImageData(processed, width, height), 0, 0);
    return canvas;
  }, [source, mode, targetColor, tolerance, featherRadius, maskData, lassoPoints]);

  // ---- Render preview ----
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas || !source) return;
    const ctx = canvas.getContext('2d');
    const { width, height } = source;
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);

    if (showBefore || !processedCanvas) {
      ctx.drawImage(sourceCanvasRef.current, 0, 0);
    } else {
      ctx.drawImage(processedCanvas, 0, 0);
    }
  }, [source, processedCanvas, showBefore]);

  // ---- Render mask overlay ----
  useEffect(() => {
    const canvas = maskCanvasRef.current;
    if (!canvas || !source) return;
    const { width, height } = source;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    // Draw brush mask
    if (maskData && maskData.length === width * height) {
      const imgData = ctx.createImageData(width, height);
      for (let i = 0; i < maskData.length; i++) {
        if (maskData[i] !== 0) {
          imgData.data[i * 4] = 255;
          imgData.data[i * 4 + 1] = 60;
          imgData.data[i * 4 + 2] = 60;
          imgData.data[i * 4 + 3] = 100;
        }
      }
      ctx.putImageData(imgData, 0, 0);
    }

    // Draw lasso polygon
    if (lassoPoints.length >= 2) {
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.9)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);
      ctx.beginPath();
      ctx.moveTo(lassoPoints[0].x, lassoPoints[0].y);
      for (let i = 1; i < lassoPoints.length; i++) {
        ctx.lineTo(lassoPoints[i].x, lassoPoints[i].y);
      }
      if (lassoPoints.length >= 3) {
        ctx.closePath();
      }
      ctx.stroke();

      // Draw points
      for (const p of lassoPoints) {
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw brush cursor
    if (maskTool === 'brush' || maskTool === 'eraser') {
      // Cursor is handled via CSS; no extra drawing needed here
    }
  }, [source, maskData, lassoPoints, maskTool]);

  // ---- Load file ----
  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a PNG or WebP image.');
      return;
    }
    setError('');
    setLoading(true);
    setEyedropperColor(null);
    clearMask();

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
        setLoading(false);
      };
      img.onerror = () => {
        setError('Failed to decode that image.');
        setLoading(false);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }, [clearMask]);

  // ---- Convert event coords to image pixel coords ----
  const eventToPixel = useCallback((e) => {
    const canvas = maskCanvasRef.current;
    if (!canvas || !source) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = source.width / rect.width;
    const scaleY = source.height / rect.height;
    return {
      x: Math.floor((e.clientX - rect.left) * scaleX),
      y: Math.floor((e.clientY - rect.top) * scaleY),
    };
  }, [source]);

  // ---- Mask interactions ----
  const ensureMask = useCallback(() => {
    if (!source) return null;
    const { width, height } = source;
    if (maskData && maskData.length === width * height) return maskData;
    const fresh = new Uint8Array(width * height);
    setMaskData(fresh);
    return fresh;
  }, [source, maskData]);

  const handleMaskMouseDown = useCallback((e) => {
    if (maskTool === 'lasso') {
      const pt = eventToPixel(e);
      if (!pt) return;
      setLassoPoints((prev) => [...prev, pt]);
      return;
    }
    if (maskTool === 'brush' || maskTool === 'eraser') {
      setIsDrawing(true);
      const pt = eventToPixel(e);
      if (!pt) return;
      setBrushPos(pt);
      const mask = ensureMask();
      if (!mask) return;
      const value = maskTool === 'brush' ? 1 : 0;
      drawCircleMask(mask, source.width, source.height, pt.x, pt.y, brushSize, value);
      setMaskData(new Uint8Array(mask));
    }
  }, [maskTool, eventToPixel, ensureMask, brushSize, source]);

  const handleMaskMouseMove = useCallback((e) => {
    if (maskTool !== 'brush' && maskTool !== 'eraser') return;
    const pt = eventToPixel(e);
    if (!pt) return;
    setBrushPos(pt);

    if (!isDrawing) return;
    const mask = ensureMask();
    if (!mask) return;
    const value = maskTool === 'brush' ? 1 : 0;
    drawCircleMask(mask, source.width, source.height, pt.x, pt.y, brushSize, value);
    setMaskData(new Uint8Array(mask));
  }, [isDrawing, maskTool, eventToPixel, ensureMask, brushSize, source]);

  const handleMaskMouseUp = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const handleMaskMouseLeave = useCallback(() => {
    setIsDrawing(false);
    setBrushPos(null);
  }, []);

  const handleMaskDoubleClick = useCallback((e) => {
    if (maskTool === 'lasso' && lassoPoints.length >= 2) {
      // Close the polygon by adding a final point near the first
      const pt = eventToPixel(e);
      if (!pt) return;
      setLassoPoints((prev) => [...prev, pt]);
      setMaskTool('none');
    }
  }, [maskTool, lassoPoints, eventToPixel]);

  // ---- Eyedropper ----
  const handlePreviewClick = useCallback((e) => {
    if (!eyedropperActive || !source) return;

    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = source.width / rect.width;
    const scaleY = source.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    if (x < 0 || x >= source.width || y < 0 || y >= source.height) return;

    const ctx = canvas.getContext('2d');
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
    setTargetColor(hex);
    setEyedropperColor(hex);
    setEyedropperActive(false);
  }, [eyedropperActive, source]);

  const handlePreviewMouseMove = useCallback((e) => {
    if (!eyedropperActive || !source) return;

    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = source.width / rect.width;
    const scaleY = source.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    if (x < 0 || x >= source.width || y < 0 || y >= source.height) return;

    const ctx = canvas.getContext('2d');
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    setEyedropperColor(rgbToHex(pixel[0], pixel[1], pixel[2]));
  }, [eyedropperActive, source]);

  // ---- Download ----
  const handleDownload = useCallback(() => {
    if (!processedCanvas) return;
    const mime = outputFormat === 'webp' ? 'image/webp' : 'image/png';
    const ext = outputFormat === 'webp' ? '.webp' : '.png';
    const dataUrl = processedCanvas.toDataURL(mime);
    const bytes = dataUrlToBytes(dataUrl);
    downloadBlob(bytes, source.name + '-nobg' + ext, mime);
  }, [processedCanvas, outputFormat, source]);

  // ---- Cursor style ----
  const previewCursor = useMemo(() => {
    if (eyedropperActive) return 'crosshair';
    if (maskTool === 'lasso') return 'crosshair';
    if (maskTool === 'brush' || maskTool === 'eraser') return 'crosshair';
    return 'default';
  }, [eyedropperActive, maskTool]);

  const hasMask = (maskData && maskData.some((v) => v !== 0)) || lassoPoints.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>Background Remover - Vibe Tools</title>
        <meta name="description" content="Remove solid-color backgrounds from PNG and WebP images — color key, flood fill, edge feathering, brush protection & lasso selection" />
      </Head>

      <header className="border-b border-border py-10">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="font-display text-product text-text mb-1 tracking-tight">Background Remover</h1>
          <p className="text-body text-textMuted">
            Remove solid-color backgrounds from PNG &amp; WebP images. Brush protection, lasso selection, edge feathering — all in your browser.
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Upload */}
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-surface">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png,image/webp"
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
            >
              {loading ? 'Loading…' : source ? 'Replace image' : 'Select a PNG or WebP image'}
            </Button>
            {source && !loading && (
              <p className="text-control text-textMuted mt-2">
                {source.name} — {source.width} × {source.height}px
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
              {/* Mode */}
              <div className="border border-border rounded-lg bg-surface p-4 space-y-4">
                <div>
                  <label className="block text-control font-medium text-text mb-2">Removal mode</label>
                  <div className="flex gap-2">
                    <Toggle active={mode === 'color'} onClick={() => setMode('color')}>
                      Color key
                    </Toggle>
                    <Toggle active={mode === 'flood'} onClick={() => setMode('flood')}>
                      Flood fill
                    </Toggle>
                  </div>
                  <p className="text-micro text-textMuted mt-1">
                    {mode === 'color'
                      ? 'Remove every pixel that matches the chosen color.'
                      : 'Auto-detect the edge color and remove the connected background region.'}
                  </p>
                </div>

                {/* Color key options */}
                {mode === 'color' && (
                  <div className="space-y-4">
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
                        <input
                          type="color"
                          value={targetColor}
                          onChange={(e) => setTargetColor(e.target.value)}
                          className="w-10 h-10 rounded border border-border bg-input cursor-pointer"
                          aria-label="Custom background color"
                        />
                        <input
                          type="text"
                          value={targetColor}
                          onChange={(e) => setTargetColor(e.target.value)}
                          className="w-28 p-2 border border-border rounded bg-input text-text text-control focus:outline-none focus:ring-2 focus:ring-focus-ring"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEyedropperActive((v) => !v);
                            if (!eyedropperActive) setMaskTool('none');
                          }}
                          disabled={eyedropperActive}
                        >
                          {eyedropperActive ? 'Picking…' : '🖉 Eyedropper'}
                        </Button>
                      </div>
                      {eyedropperActive && (
                        <p className="text-micro text-primary mt-1">
                          Click on the preview image to pick a color. Press the button again to cancel.
                        </p>
                      )}
                      {eyedropperColor && !eyedropperActive && (
                        <p className="text-micro text-textMuted mt-1">
                          Last picked: {eyedropperColor}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Tolerance */}
                <div>
                  <label className="block text-control font-medium text-text mb-2">
                    Tolerance: {tolerance}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    step="1"
                    value={tolerance}
                    onChange={(e) => setTolerance(parseInt(e.target.value, 10))}
                    className="w-full accent-primary"
                  />
                  <p className="text-micro text-textMuted mt-1">
                    Higher values remove a wider range of similar colors.
                  </p>
                </div>

                {/* Edge feathering */}
                <div>
                  <label className="block text-control font-medium text-text mb-2">
                    Edge feathering: {featherRadius > 0 ? featherRadius + 'px' : 'Off'}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="1"
                    value={featherRadius}
                    onChange={(e) => setFeatherRadius(parseInt(e.target.value, 10))}
                    className="w-full accent-primary"
                  />
                  <p className="text-micro text-textMuted mt-1">
                    Smooth the transition between opaque and transparent edges. 0 = off, 1–5 = subtle, 6–20 = strong.
                  </p>
                </div>
              </div>

              {/* Mask tools */}
              <div className="border border-border rounded-lg bg-surface p-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-body-emphasis text-text">Mask tools</h3>
                  {hasMask && (
                    <Button variant="ghost" size="sm" onClick={clearMask}>
                      Clear mask
                    </Button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Toggle
                    active={maskTool === 'none'}
                    onClick={() => setMaskTool('none')}
                    disabled={eyedropperActive}
                  >
                    None
                  </Toggle>
                  <Toggle
                    active={maskTool === 'brush'}
                    onClick={() => setMaskTool('brush')}
                    disabled={eyedropperActive}
                  >
                    🖌 Protect
                  </Toggle>
                  <Toggle
                    active={maskTool === 'eraser'}
                    onClick={() => setMaskTool('eraser')}
                    disabled={eyedropperActive}
                  >
                    Erase
                  </Toggle>
                  <Toggle
                    active={maskTool === 'lasso'}
                    onClick={() => {
                      setMaskTool('lasso');
                      setLassoPoints([]);
                    }}
                    disabled={eyedropperActive}
                  >
                    ✂️ Lasso
                  </Toggle>

                  {(maskTool === 'brush' || maskTool === 'eraser') && (
                    <>
                      <span className="text-micro text-textMuted ml-2">Size:</span>
                      <input
                        type="range"
                        min="2"
                        max="60"
                        value={brushSize}
                        onChange={(e) => setBrushSize(parseInt(e.target.value, 10))}
                        className="w-20 accent-primary"
                      />
                      <span className="text-micro text-textMuted">{brushSize}px</span>
                    </>
                  )}
                </div>

                <p className="text-micro text-textMuted">
                  {maskTool === 'brush'
                    ? 'Paint over areas you want to protect from background removal.'
                    : maskTool === 'eraser'
                    ? 'Erase protection to allow background removal in those areas.'
                    : maskTool === 'lasso'
                    ? 'Click to add points. Double-click to close the polygon — only the area inside will be processed.'
                    : 'Use the brush to protect interior areas, or the lasso to limit processing to a selected region.'}
                </p>
              </div>

              {/* Preview */}
              <div className="border border-border rounded-lg overflow-hidden bg-surface">
                <div className="bg-surface px-4 py-2.5 border-b border-border flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-body-emphasis text-text">Preview</h3>
                  <div className="flex items-center gap-2">
                    <Toggle active={!showBefore} onClick={() => setShowBefore(false)}>
                      After
                    </Toggle>
                    <Toggle active={showBefore} onClick={() => setShowBefore(true)}>
                      Before
                    </Toggle>
                  </div>
                </div>
                <div className="p-4 flex justify-center">
                  <div
                    ref={previewContainerRef}
                    className="relative w-full max-w-[520px] rounded border border-border overflow-hidden"
                    style={CHECKERBOARD}
                  >
                    <canvas
                      ref={previewCanvasRef}
                      width={source.width}
                      height={source.height}
                      className="w-full h-auto block"
                      style={{ cursor: previewCursor }}
                      onClick={handlePreviewClick}
                      onMouseMove={handlePreviewMouseMove}
                    />
                    <canvas
                      ref={maskCanvasRef}
                      width={source.width}
                      height={source.height}
                      className="w-full h-auto block absolute inset-0"
                      style={{
                        cursor: previewCursor,
                        pointerEvents: maskTool !== 'none' && !eyedropperActive ? 'auto' : 'none',
                      }}
                      onMouseDown={handleMaskMouseDown}
                      onMouseMove={handleMaskMouseMove}
                      onMouseUp={handleMaskMouseUp}
                      onMouseLeave={handleMaskMouseLeave}
                      onDoubleClick={handleMaskDoubleClick}
                    />
                    {/* Brush cursor indicator */}
                    {(maskTool === 'brush' || maskTool === 'eraser') && brushPos && source && (
                      <div
                        className="absolute pointer-events-none rounded-full border-2 border-white/80 shadow-sm"
                        style={{
                          width: (brushSize * 2 / source.width) * 100 + '%',
                          height: (brushSize * 2 / source.width) * 100 + '%',
                          left: (brushPos.x / source.width) * 100 + '%',
                          top: (brushPos.y / source.height) * 100 + '%',
                          transform: 'translate(-50%, -50%)',
                        }}
                      />
                    )}
                  </div>
                </div>
                {lassoPoints.length > 0 && lassoPoints.length < 3 && (
                  <p className="text-micro text-primary text-center pb-2">
                    Click at least 3 points to define a polygon region. Double-click to close.
                  </p>
                )}
              </div>

              {/* Output & download */}
              <div className="border border-border rounded-lg bg-surface p-4 space-y-4">
                <div>
                  <label className="block text-control font-medium text-text mb-2">Output format</label>
                  <div className="flex gap-2">
                    <Toggle active={outputFormat === 'png'} onClick={() => setOutputFormat('png')}>
                      PNG
                    </Toggle>
                    <Toggle active={outputFormat === 'webp'} onClick={() => setOutputFormat('webp')}>
                      WebP
                    </Toggle>
                  </div>
                </div>

                <Button onClick={handleDownload} disabled={!processedCanvas}>
                  Download {outputFormat.toUpperCase()}
                </Button>

                {processedCanvas && (
                  <p className="text-micro text-textMuted">
                    Image will be saved with transparency. Use the Before/After toggle above to compare.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}