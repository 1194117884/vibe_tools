// utils/bgRemover.js
// Pure, framework-free helpers for removing solid-color backgrounds from
// PNG / WebP images. These functions operate on plain Uint8ClampedArray RGBA
// pixel buffers so they can be unit-tested in Node without a DOM or canvas.

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

/** Sample the average color of the four corner pixels. */
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

/**
 * Remove every pixel whose color distance to `target` is ≤ `tolerance`.
 * Matching pixels become fully transparent (alpha = 0).
 */
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

/**
 * Flood-fill from the four edges: auto-detect the background color from the
 * four corners, then remove all connected pixels within `tolerance`.
 */
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

  // Seed from all four edges
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

/**
 * Feather the edges of transparent regions by `radius` pixels.
 * For each opaque pixel, compute the minimum distance to any transparent pixel
 * within the radius. Alpha is scaled proportionally: pixels closer to the
 * transparent boundary get lower alpha, producing a smooth anti-aliased edge.
 *
 * Only affects pixels that are currently fully opaque (alpha >= 254) and have
 * at least one transparent neighbor within the radius.
 */
export function featherEdges(data, width, height, radius) {
  if (!radius || radius < 1) return new Uint8ClampedArray(data);

  const out = new Uint8ClampedArray(data);
  const r = Math.min(radius, Math.max(width, height));

  // Build a distance map: for each pixel, store the squared distance to the
  // nearest transparent pixel. We use a two-pass algorithm (forward + backward)
  // which is O(n) and approximates the Euclidean distance transform.
  const dist = new Float32Array(width * height);
  const INF = 1e10;

  // Initialize: transparent pixels get 0, opaque get INF
  for (let i = 0; i < dist.length; i++) {
    dist[i] = out[i * 4 + 3] < 16 ? 0 : INF;
  }

  // Forward pass (top-left to bottom-right)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (dist[idx] === 0) continue;
      let minDist = dist[idx];
      if (x > 0) minDist = Math.min(minDist, dist[idx - 1] + 1);
      if (y > 0) minDist = Math.min(minDist, dist[idx - width] + 1);
      if (x > 0 && y > 0) minDist = Math.min(minDist, dist[idx - width - 1] + 1.414);
      if (x < width - 1 && y > 0) minDist = Math.min(minDist, dist[idx - width + 1] + 1.414);
      dist[idx] = minDist;
    }
  }

  // Backward pass (bottom-right to top-left)
  for (let y = height - 1; y >= 0; y--) {
    for (let x = width - 1; x >= 0; x--) {
      const idx = y * width + x;
      let minDist = dist[idx];
      if (x < width - 1) minDist = Math.min(minDist, dist[idx + 1] + 1);
      if (y < height - 1) minDist = Math.min(minDist, dist[idx + width] + 1);
      if (x < width - 1 && y < height - 1) minDist = Math.min(minDist, dist[idx + width + 1] + 1.414);
      if (x > 0 && y < height - 1) minDist = Math.min(minDist, dist[idx + width - 1] + 1.414);
      dist[idx] = minDist;
    }
  }

  // Apply feathering: scale alpha by distance within the radius
  const rSq = r * r;
  for (let i = 0; i < dist.length; i++) {
    const d = dist[i];
    if (d > 0 && d <= r) {
      // Linear falloff within the radius
      const factor = d / r;
      const a = out[i * 4 + 3];
      out[i * 4 + 3] = Math.max(0, Math.min(255, Math.round(a * factor)));
    }
  }

  return out;
}

/**
 * Restore the original alpha for every pixel whose mask value is non-zero
 * (i.e. the user painted over it to protect it from removal). Operates in
 * place on `out` and returns it.
 *
 * `mask` is a Uint8Array of length width × height where 0 = process normally,
 * 1 = protected (keep original).
 */
export function applyMask(out, original, mask, width, height) {
  for (let i = 0; i < mask.length; i++) {
    if (mask[i] !== 0) {
      out[i * 4 + 3] = original[i * 4 + 3];
    }
  }
  return out;
}

/**
 * Rasterize a polygon defined by a list of `{ x, y }` points into a mask
 * of the given width × height. Uses the even-odd rule.
 *
 * Returns a Uint8Array where:
 *   0 = inside the polygon (process normally)
 *   1 = outside the polygon (protected from removal)
 */
export function rasterizePolygon(points, width, height) {
  const mask = new Uint8Array(width * height);
  if (!points || points.length < 3) return mask;

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const n = points.length;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let inside = false;
      for (let i = 0, j = n - 1; i < n; j = i++) {
        const yi = ys[i];
        const yj = ys[j];
        if ((yi > y) !== (yj > y)) {
          const intersectX = xs[i] + ((y - yi) * (xs[j] - xs[i])) / (yj - yi);
          if (x < intersectX) inside = !inside;
        }
      }
      if (!inside) {
        mask[y * width + x] = 1;
      }
    }
  }
  return mask;
}