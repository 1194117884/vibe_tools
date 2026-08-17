// utils/spriteSlicer.js
// Pure, framework-free helpers for slicing sprite sheets / tile sheets and
// removing solid-color backgrounds. These functions operate on plain
// Uint8ClampedArray RGBA pixel buffers so they can be unit-tested in Node
// without a DOM or canvas.

/** Parse "#rgb" / "#rrggbb" (with or without leading #) into { r, g, b }. */
export function hexToRgb(hex) {
  if (typeof hex !== 'string') return null;
  let value = hex.trim().replace(/^#/, '');
  if (value.length === 3) {
    value = value
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (!/^[0-9a-fA-F]{6}$/.test(value)) return null;
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

/** Euclidean distance between two RGB colors (0 .. ~441). */
export function colorDistance(r1, g1, b1, r2, g2, b2) {
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

export function removeBackgroundByColorKey(data, width, height, target, tolerance) {
  const out = new Uint8ClampedArray(data);
  const t = tolerance || 0;
  for (let i = 0; i < out.length; i += 4) {
    if (colorDistance(out[i], out[i + 1], out[i + 2], target.r, target.g, target.b) <= t) {
      out[i + 3] = 0;
    }
  }
  return out;
}

export function sampleCornerColor(data, width, height) {
  const corners = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
  ];
  let r = 0;
  let g = 0;
  let b = 0;
  for (const [x, y] of corners) {
    const i = (y * width + x) * 4;
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }
  return { r: Math.round(r / 4), g: Math.round(g / 4), b: Math.round(b / 4) };
}

export function removeBackgroundFloodFill(data, width, height, tolerance) {
  const bg = sampleCornerColor(data, width, height);
  const t = tolerance || 0;
  const out = new Uint8ClampedArray(data);
  const size = width * height;
  const visited = new Uint8Array(size);
  const queue = new Uint32Array(size);
  let head = 0;
  let tail = 0;

  const matches = (x, y) => {
    const i = (y * width + x) * 4;
    return colorDistance(out[i], out[i + 1], out[i + 2], bg.r, bg.g, bg.b) <= t;
  };

  const push = (x, y) => {
    const idx = y * width + x;
    if (visited[idx]) return;
    visited[idx] = 1;
    queue[tail++] = (y << 16) | x;
  };

  for (let x = 0; x < width; x++) {
    if (matches(x, 0)) push(x, 0);
    if (matches(x, height - 1)) push(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    if (matches(0, y)) push(0, y);
    if (matches(width - 1, y)) push(width - 1, y);
  }

  while (head < tail) {
    const p = queue[head++];
    const x = p & 0xffff;
    const y = p >>> 16;
    out[(y * width + x) * 4 + 3] = 0;
    if (x > 0 && matches(x - 1, y)) push(x - 1, y);
    if (x < width - 1 && matches(x + 1, y)) push(x + 1, y);
    if (y > 0 && matches(x, y - 1)) push(x, y - 1);
    if (y < height - 1 && matches(x, y + 1)) push(x, y + 1);
  }

  return out;
}

function boundaries(total, count) {
  const edges = [];
  for (let i = 0; i <= count; i++) edges.push(Math.round((i * total) / count));
  return edges;
}

export function computeGridTiles(width, height, cols, rows) {
  const c = Math.max(1, Math.floor(cols || 1));
  const r = Math.max(1, Math.floor(rows || 1));
  const xs = boundaries(width, c);
  const ys = boundaries(height, r);
  const tiles = [];
  let index = 0;
  for (let row = 0; row < r; row++) {
    for (let col = 0; col < c; col++) {
      const w = xs[col + 1] - xs[col];
      const h = ys[row + 1] - ys[row];
      if (w <= 0 || h <= 0) continue;
      tiles.push({ index, row, col, x: xs[col], y: ys[row], w, h });
      index++;
    }
  }
  return tiles;
}

export function computeSizeTiles(width, height, tileW, tileH) {
  const tw = Math.max(1, Math.floor(tileW || 1));
  const th = Math.max(1, Math.floor(tileH || 1));
  const cols = Math.ceil(width / tw);
  const rows = Math.ceil(height / th);
  const tiles = [];
  let index = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * tw;
      const y = row * th;
      const w = Math.min(tw, width - x);
      const h = Math.min(th, height - y);
      if (w <= 0 || h <= 0) continue;
      tiles.push({ index, row, col, x, y, w, h });
      index++;
    }
  }
  return tiles;
}

/**
 * Slice a sheet Godot TileSet-atlas style: full tiles of tileW×tileH laid out
 * starting at (marginX, marginY), stepping by (tileW+sepX, tileH+sepY). The
 * grid size matches Godot's TileSetAtlasSource integer division, so partial
 * tiles at the right/bottom are excluded. Returns [] when no full tile fits.
 */
export function computeAtlasTiles(width, height, tileW, tileH, marginX = 0, marginY = 0, sepX = 0, sepY = 0) {
  const tw = Math.max(1, Math.floor(tileW || 1));
  const th = Math.max(1, Math.floor(tileH || 1));
  const mx = Math.max(0, Math.floor(marginX || 0));
  const my = Math.max(0, Math.floor(marginY || 0));
  const sx = Math.max(0, Math.floor(sepX || 0));
  const sy = Math.max(0, Math.floor(sepY || 0));
  const availW = width - mx;
  const availH = height - my;
  if (availW <= 0 || availH <= 0) return [];
  const cols = Math.floor(availW / (tw + sx));
  const rows = Math.floor(availH / (th + sy));
  if (cols <= 0 || rows <= 0) return [];
  const tiles = [];
  let index = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      tiles.push({ index, row, col, x: mx + col * (tw + sx), y: my + row * (th + sy), w: tw, h: th });
      index++;
    }
  }
  return tiles;
}

// ---------------------------------------------------------------------------
// Auto-slice: detect a tile-sheet grid from the image content.
// The approach mirrors how sprite-sheet auto-slicers (and Godot's atlas
// detection) work: find the background (transparent or a solid color), then
// locate full rows/columns that are (almost) entirely background — those are
// the margins and the separation gaps between tiles. From those gaps we derive
// tile size, margins, separation and the column/row count.
// ---------------------------------------------------------------------------

function hasTransparency(data) {
  const total = data.length / 4;
  let count = 0;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 16) count++;
    if (count > total * 0.005) return true;
  }
  return false;
}

function dominantBorderColor(data, width, height) {
  const bins = new Uint32Array(4096);
  const sample = (x, y) => {
    const i = (y * width + x) * 4;
    const r = data[i] >> 4;
    const g = data[i + 1] >> 4;
    const b = data[i + 2] >> 4;
    bins[(r << 8) | (g << 4) | b]++;
  };
  for (let x = 0; x < width; x++) {
    sample(x, 0);
    sample(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    sample(0, y);
    sample(width - 1, y);
  }
  let best = 0;
  for (let b = 1; b < bins.length; b++) if (bins[b] > bins[best]) best = b;
  return {
    r: ((best >> 8) & 0xf) * 16 + 8,
    g: ((best >> 4) & 0xf) * 16 + 8,
    b: (best & 0xf) * 16 + 8,
  };
}

function segmentFlags(flags, length) {
  const segments = [];
  let start = 0;
  for (let i = 1; i <= length; i++) {
    if (i === length || flags[i] !== flags[start]) {
      segments.push({ empty: flags[start] === 1, start, end: i, len: i - start });
      start = i;
    }
  }
  return segments;
}

function summarize(segments) {
  const tiles = segments.filter((s) => !s.empty);
  if (tiles.length === 0) return null;
  const gaps = [];
  for (let i = 0; i < segments.length; i++) {
    const s = segments[i];
    if (!s.empty) continue;
    const prev = segments[i - 1];
    const next = segments[i + 1];
    gaps.push({ ...s, internal: !!prev && !prev.empty && !!next && !next.empty });
  }
  return { tileSegments: tiles, gapSegments: gaps };
}

function median(values) {
  if (!values || values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

/**
 * Auto-detect a tile-sheet grid from an RGBA pixel buffer.
 *
 * Returns { tileW, tileH, marginX, marginY, sepX, sepY, cols, rows } on
 * success, or null when no clear grid can be detected (e.g. a single opaque
 * blob with no background separation).
 */
export function detectAtlasGrid(data, width, height, opts = {}) {
  const tolerance = opts.tolerance != null ? opts.tolerance : 30;
  const emptyThreshold = opts.emptyThreshold != null ? opts.emptyThreshold : 0.97;

  const transparent = hasTransparency(data);
  const bgColor = transparent ? null : dominantBorderColor(data, width, height);

  const isBackground = (x, y) => {
    const i = (y * width + x) * 4;
    if (transparent) return data[i + 3] < 16;
    return colorDistance(data[i], data[i + 1], data[i + 2], bgColor.r, bgColor.g, bgColor.b) <= tolerance;
  };

  const rowEmpty = new Uint8Array(height);
  for (let y = 0; y < height; y++) {
    let count = 0;
    for (let x = 0; x < width; x++) if (isBackground(x, y)) count++;
    rowEmpty[y] = count / width >= emptyThreshold ? 1 : 0;
  }

  const colEmpty = new Uint8Array(width);
  for (let x = 0; x < width; x++) {
    let count = 0;
    for (let y = 0; y < height; y++) if (isBackground(x, y)) count++;
    colEmpty[x] = count / height >= emptyThreshold ? 1 : 0;
  }

  const ySummary = summarize(segmentFlags(rowEmpty, height));
  const xSummary = summarize(segmentFlags(colEmpty, width));
  if (!xSummary || !ySummary) return null;

  // A single tile in both directions means there is no grid to detect.
  if (xSummary.tileSegments.length === 1 && ySummary.tileSegments.length === 1) return null;

  const tileW = median(xSummary.tileSegments.map((s) => s.len));
  const tileH = median(ySummary.tileSegments.map((s) => s.len));
  const sepX = median(xSummary.gapSegments.filter((s) => s.internal).map((s) => s.len));
  const sepY = median(ySummary.gapSegments.filter((s) => s.internal).map((s) => s.len));

  if (tileW <= 0 || tileH <= 0) return null;

  return {
    tileW,
    tileH,
    marginX: xSummary.tileSegments[0].start,
    marginY: ySummary.tileSegments[0].start,
    sepX,
    sepY,
    cols: xSummary.tileSegments.length,
    rows: ySummary.tileSegments.length,
  };
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

export function crc32(data) {
  let c = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    c = CRC_TABLE[(c ^ data[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function utf8Bytes(str) {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(str);
  }
  // Fallback for environments without TextEncoder (e.g. jsdom test runs).
  const encoded = unescape(encodeURIComponent(str));
  const bytes = new Uint8Array(encoded.length);
  for (let i = 0; i < encoded.length; i++) bytes[i] = encoded.charCodeAt(i);
  return bytes;
}

export function buildZip(entries) {
  const list = entries || [];
  const now = new Date();
  const dosTime = ((now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)) & 0xffff;
  const dosDate = (((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()) & 0xffff;

  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const entry of list) {
    const nameBytes = utf8Bytes(entry.name);
    const data = entry.data;
    const crc = crc32(data);

    const local = new Uint8Array(30 + nameBytes.length);
    const ldv = new DataView(local.buffer);
    ldv.setUint32(0, 0x04034b50, true);
    ldv.setUint16(4, 20, true);
    ldv.setUint16(6, 0, true);
    ldv.setUint16(8, 0, true);
    ldv.setUint16(10, dosTime, true);
    ldv.setUint16(12, dosDate, true);
    ldv.setUint32(14, crc, true);
    ldv.setUint32(18, data.length, true);
    ldv.setUint32(22, data.length, true);
    ldv.setUint16(26, nameBytes.length, true);
    ldv.setUint16(28, 0, true);
    local.set(nameBytes, 30);
    localParts.push(local, data);

    const central = new Uint8Array(46 + nameBytes.length);
    const cdv = new DataView(central.buffer);
    cdv.setUint32(0, 0x02014b50, true);
    cdv.setUint16(4, 20, true);
    cdv.setUint16(6, 20, true);
    cdv.setUint16(8, 0, true);
    cdv.setUint16(10, 0, true);
    cdv.setUint16(12, dosTime, true);
    cdv.setUint16(14, dosDate, true);
    cdv.setUint32(16, crc, true);
    cdv.setUint32(20, data.length, true);
    cdv.setUint32(24, data.length, true);
    cdv.setUint16(28, nameBytes.length, true);
    cdv.setUint32(38, 0, true);
    cdv.setUint32(42, offset, true);
    central.set(nameBytes, 46);
    centralParts.push(central);

    offset += local.length + data.length;
  }

  const localSize = localParts.reduce((sum, p) => sum + p.length, 0);
  const centralSize = centralParts.reduce((sum, p) => sum + p.length, 0);

  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(4, 0, true);
  ev.setUint16(6, 0, true);
  ev.setUint16(8, list.length, true);
  ev.setUint16(10, list.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, localSize, true);
  ev.setUint16(20, 0, true);

  const result = new Uint8Array(localSize + centralSize + 22);
  let cursor = 0;
  for (const part of localParts) {
    result.set(part, cursor);
    cursor += part.length;
  }
  for (const part of centralParts) {
    result.set(part, cursor);
    cursor += part.length;
  }
  result.set(eocd, cursor);
  return result;
}
