import { useCallback, useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import { Button } from '../../../components/ui/button';

const EXTENSIONS_BY_MIME = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
  'image/tiff': 'tiff',
  'image/bmp': 'bmp',
  'application/pdf': 'pdf',
  'text/plain': 'txt',
  'text/html': 'html',
  'text/uri-list': 'url',
  'text/rtf': 'rtf',
  'application/rtf': 'rtf',
  'application/json': 'json',
  'application/xml': 'xml',
  'text/xml': 'xml',
  'text/csv': 'csv',
  'text/markdown': 'md',
};

const TEXT_TYPES = new Set([
  'text/plain',
  'text/html',
  'text/uri-list',
  'text/rtf',
  'application/rtf',
  'application/json',
  'application/xml',
  'text/xml',
  'text/csv',
  'text/markdown',
]);

export function getExtensionFromMime(type = '') {
  if (EXTENSIONS_BY_MIME[type]) return EXTENSIONS_BY_MIME[type];
  const subtype = type.split('/')[1]?.split(';')[0]?.split('+')[0];
  return subtype || 'bin';
}

export function getReadableSize(size) {
  if (!Number.isFinite(size) || size < 0) return '0 B';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function makeDownloadName(blob, index) {
  const sourceName = blob.name || '';
  if (sourceName && sourceName.includes('.')) return sourceName;
  const extension = getExtensionFromMime(blob.type);
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  return sourceName || `clipboard-${stamp}-${index + 1}.${extension}`;
}

function getClipboardString(item) {
  return new Promise((resolve) => {
    item.getAsString((value) => resolve(value || ''));
  });
}

function inferStringType(itemType) {
  if (itemType && itemType !== 'Files') return itemType;
  return 'text/plain';
}

function blobFromClipboardString(value, type) {
  if (type === 'application/json') {
    const trimmed = value.trim();
    try {
      return new Blob([JSON.stringify(JSON.parse(trimmed), null, 2)], { type });
    } catch {
      return new Blob([value], { type });
    }
  }
  return new Blob([value], { type });
}

function downloadBlob(item) {
  const link = document.createElement('a');
  link.href = item.url;
  link.download = item.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export default function PasteDownloadTool() {
  const [items, setItems] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [message, setMessage] = useState('Paste clipboard content to turn it into a download.');
  const [error, setError] = useState('');
  const dropRef = useRef(null);
  const itemsRef = useRef([]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, []);

  const addBlobs = useCallback((blobs) => {
    const validBlobs = blobs.filter(Boolean);
    if (validBlobs.length === 0) {
      setError('No downloadable data was found in the clipboard.');
      return;
    }

    setError('');
    setItems((current) => {
      const nextItems = validBlobs.map((blob, index) => ({
        id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2)}`,
        name: makeDownloadName(blob, current.length + index),
        type: blob.type || 'application/octet-stream',
        size: blob.size || 0,
        url: URL.createObjectURL(blob),
        createdAt: new Date().toLocaleTimeString(),
      }));
      setMessage(`${nextItems.length} item${nextItems.length > 1 ? 's' : ''} ready to download.`);
      return [...nextItems, ...current];
    });
  }, []);

  const handlePaste = useCallback(async (event) => {
    const sourceEvent = event.nativeEvent || event;
    if (sourceEvent.__pasteDownloadHandled) return;
    sourceEvent.__pasteDownloadHandled = true;
    event.preventDefault?.();
    event.stopPropagation?.();

    const clipboardItems = Array.from(event.clipboardData?.items || []);
    const files = Array.from(event.clipboardData?.files || []);
    const blobs = [];
    const stringItems = [];

    clipboardItems.forEach((item) => {
      if (item.kind === 'file') {
        blobs.push(item.getAsFile());
      } else if (item.kind === 'string') {
        stringItems.push(item);
      }
    });

    files.forEach((file) => {
      if (!blobs.includes(file)) blobs.push(file);
    });

    if (stringItems.length > 0) {
      const stringBlobs = await Promise.all(
        stringItems.map(async (item) => {
          const value = await getClipboardString(item);
          const type = inferStringType(item.type);
          return value ? blobFromClipboardString(value, type) : null;
        })
      );
      blobs.push(...stringBlobs);
    }

    const plainText = event.clipboardData?.getData?.('text/plain');
    if (blobs.length === 0 && plainText) {
      blobs.push(blobFromClipboardString(plainText, 'text/plain'));
    }

    if (blobs.filter(Boolean).length > 0) {
      addBlobs(blobs);
    } else {
      setError('Clipboard data is empty or uses a private format this browser cannot read.');
    }
  }, [addBlobs]);

  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  const readClipboard = async () => {
    if (!navigator.clipboard?.read) {
      setError('This browser does not support direct clipboard file reading. Use Cmd+V instead.');
      return;
    }

    try {
      setError('');
      const clipboardItems = await navigator.clipboard.read();
      const blobs = [];
      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          const blob = await clipboardItem.getType(type);
          if (TEXT_TYPES.has(type)) {
            const text = await blob.text();
            blobs.push(blobFromClipboardString(text, type));
          } else {
            blobs.push(blob);
          }
        }
      }
      addBlobs(blobs);
    } catch (err) {
      setError(err?.message || 'Clipboard permission was denied. Click the paste area and press Cmd+V.');
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsActive(false);
    addBlobs(Array.from(event.dataTransfer?.files || []));
  };

  const handleDownloadAll = () => {
    items.forEach(downloadBlob);
  };

  const removeItem = (id) => {
    setItems((current) => {
      const target = current.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return current.filter((item) => item.id !== id);
    });
  };

  const clearItems = () => {
    items.forEach((item) => URL.revokeObjectURL(item.url));
    setItems([]);
    setMessage('Paste clipboard content to turn it into a download.');
    setError('');
  };

  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>Paste to Download - Vibe Tools</title>
        <meta name="description" content="Paste clipboard images and files, then download them locally" />
      </Head>

      <header className="border-b border-border py-10">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="font-display text-product text-text mb-1 tracking-tight">Paste to Download</h1>
          <p className="text-body text-textMuted">Turn clipboard files, images, text, HTML, URLs, and data into local downloads.</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          <div
            ref={dropRef}
            tabIndex={0}
            role="button"
            aria-label="Paste clipboard file area"
            onPaste={handlePaste}
            onDragOver={(event) => {
              event.preventDefault();
              setIsActive(true);
            }}
            onDragLeave={() => setIsActive(false)}
            onDrop={handleDrop}
            onFocus={() => setIsActive(true)}
            onBlur={() => setIsActive(false)}
            className={`border-2 border-dashed rounded-lg p-8 md:p-10 bg-surface outline-none transition-colors ${
              isActive ? 'border-primary bg-primary/5' : 'border-border'
            }`}
          >
            <div className="max-w-xl">
              <div className="text-[42px] leading-none mb-4">📋</div>
              <h2 className="text-[28px] leading-tight font-semibold text-text mb-2">Paste clipboard content here</h2>
              <p className="text-body text-textMuted mb-5">
                Copy an image, file, text, HTML, URL, JSON, CSV, Markdown, or RTF content, focus this area, then press Cmd+V.
              </p>
              <div className="flex flex-wrap gap-3 items-center">
                <Button onClick={() => dropRef.current?.focus()}>Focus Paste Area</Button>
                <Button variant="outline" onClick={readClipboard}>Read Clipboard</Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-control text-textMuted" role="status" aria-live="polite">{message}</p>
            {items.length > 0 && (
              <div className="flex gap-2">
                <Button onClick={handleDownloadAll}>Download All</Button>
                <Button variant="outline" onClick={clearItems}>Clear</Button>
              </div>
            )}
          </div>

          {error && (
            <div className="text-error text-control p-3 bg-errorBg rounded" role="alert">
              {error}
            </div>
          )}

          {items.length > 0 && (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-surface px-4 py-2.5 border-b border-border">
                <h3 className="text-body-emphasis text-text">Ready Files</h3>
              </div>
              <div className="divide-y divide-border">
                {items.map((item) => (
                  <div key={item.id} className="px-4 py-3 bg-input flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-control font-medium text-text truncate">{item.name}</div>
                      <div className="text-micro text-textMuted mt-1">
                        {item.type} · {getReadableSize(item.size)} · {item.createdAt}
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 gap-2">
                      <Button size="sm" onClick={() => downloadBlob(item)}>Download</Button>
                      <Button size="sm" variant="ghost" onClick={() => removeItem(item.id)}>Remove</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
