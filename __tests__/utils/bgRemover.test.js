import {
  applyMask,
  colorDistance,
  featherEdges,
  hexToRgb,
  rasterizePolygon,
  removeBackgroundByColorKey,
  removeBackgroundFloodFill,
  sampleCornerColor,
} from '../../utils/bgRemover';

function rgba(width, height, painter) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = painter(x, y);
      const i = (y * width + x) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = a;
    }
  }
  return data;
}

describe('hexToRgb', () => {
  test('parses 3- and 6-digit hex with or without #', () => {
    expect(hexToRgb('#fff')).toEqual({ r: 255, g: 255, b: 255 });
    expect(hexToRgb('ffffff')).toEqual({ r: 255, g: 255, b: 255 });
    expect(hexToRgb('#00ff00')).toEqual({ r: 0, g: 255, b: 0 });
    expect(hexToRgb('#0a0B0c')).toEqual({ r: 10, g: 11, b: 12 });
  });

  test('returns null for invalid input', () => {
    expect(hexToRgb('xyz')).toBeNull();
    expect(hexToRgb('')).toBeNull();
    expect(hexToRgb(null)).toBeNull();
    expect(hexToRgb('#12345')).toBeNull();
  });
});

describe('colorDistance', () => {
  test('is zero for identical colors', () => {
    expect(colorDistance(10, 20, 30, 10, 20, 30)).toBe(0);
  });

  test('measures euclidean distance', () => {
    expect(colorDistance(0, 0, 0, 255, 255, 255)).toBeCloseTo(441.67, 1);
    expect(colorDistance(0, 0, 0, 3, 4, 0)).toBe(5);
  });
});

describe('sampleCornerColor', () => {
  test('averages the four corners', () => {
    const data = rgba(2, 2, (x, y) => {
      const value = x === 0 && y === 0 ? 100 : x === 1 && y === 0 ? 200 : x === 0 && y === 1 ? 0 : 220;
      return [value, value, value, 255];
    });
    expect(sampleCornerColor(data, 2, 2)).toEqual({ r: 130, g: 130, b: 130 });
  });
});

describe('removeBackgroundByColorKey', () => {
  test('makes matching pixels transparent and preserves others', () => {
    const data = rgba(2, 2, (x, y) =>
      x === 1 && y === 1 ? [255, 0, 0, 255] : [255, 255, 255, 255]
    );
    const out = removeBackgroundByColorKey(data, 2, 2, { r: 255, g: 255, b: 255 }, 0);
    expect(out[3]).toBe(0);
    const redIdx = (1 * 2 + 1) * 4;
    expect(out[redIdx + 3]).toBe(255);
  });

  test('respects tolerance', () => {
    const data = rgba(1, 1, () => [250, 250, 250, 255]);
    const exact = removeBackgroundByColorKey(data, 1, 1, { r: 255, g: 255, b: 255 }, 0);
    expect(exact[3]).toBe(255);
    const loose = removeBackgroundByColorKey(data, 1, 1, { r: 255, g: 255, b: 255 }, 20);
    expect(loose[3]).toBe(0);
  });
});

describe('removeBackgroundFloodFill', () => {
  test('removes only the connected background region from the edges', () => {
    const data = rgba(5, 5, (x, y) => {
      const isBorder = x === 0 || y === 0 || x === 4 || y === 4;
      const isCenter = x === 2 && y === 2;
      return isBorder || isCenter ? [255, 255, 255, 255] : [255, 0, 0, 255];
    });
    const out = removeBackgroundFloodFill(data, 5, 5, 0);
    expect(out[(0 * 5 + 0) * 4 + 3]).toBe(0);
    expect(out[(1 * 5 + 1) * 4 + 3]).toBe(255);
    expect(out[(2 * 5 + 2) * 4 + 3]).toBe(255);
  });

  test('clears a fully solid image', () => {
    const data = rgba(3, 3, () => [255, 255, 255, 255]);
    const out = removeBackgroundFloodFill(data, 3, 3, 0);
    for (let i = 3; i < out.length; i += 4) expect(out[i]).toBe(0);
  });
});

describe('featherEdges', () => {
  test('returns a copy when radius is 0', () => {
    const data = rgba(3, 3, (x, y) => (x === 1 && y === 1 ? [255, 0, 0, 255] : [0, 0, 0, 0]));
    const out = featherEdges(data, 3, 3, 0);
    for (let i = 0; i < data.length; i++) expect(out[i]).toBe(data[i]);
  });

  test('reduces alpha for pixels near transparent regions', () => {
    // 3x3 image: center is white opaque, border is transparent
    const data = rgba(3, 3, (x, y) =>
      x === 1 && y === 1 ? [255, 255, 255, 255] : [0, 0, 0, 0]
    );
    const out = featherEdges(data, 3, 3, 2);
    // Center pixel (1,1) is at distance 1 from transparent → alpha should be reduced
    const centerIdx = (1 * 3 + 1) * 4;
    expect(out[centerIdx + 3]).toBeGreaterThan(0);
    expect(out[centerIdx + 3]).toBeLessThan(255);
  });

  test('does not affect pixels far from transparent regions', () => {
    // 5x5 image: 3x3 opaque block in center, surrounded by transparent
    const data = rgba(5, 5, (x, y) =>
      x >= 1 && x <= 3 && y >= 1 && y <= 3 ? [255, 255, 255, 255] : [0, 0, 0, 0]
    );
    const out = featherEdges(data, 5, 5, 3);
    // Center pixel (2,2) is at distance 2 from transparent → within radius 3 → affected
    const centerIdx = (2 * 5 + 2) * 4;
    expect(out[centerIdx + 3]).toBeGreaterThan(0);
    expect(out[centerIdx + 3]).toBeLessThan(255);
    // Edge pixel (1,1) is at distance 1 from transparent → more affected than center
    const edgeIdx = (1 * 5 + 1) * 4;
    expect(out[edgeIdx + 3]).toBeGreaterThan(0);
    expect(out[edgeIdx + 3]).toBeLessThan(out[centerIdx + 3]);
  });

  test('does not modify already transparent pixels', () => {
    const data = rgba(2, 2, (x, y) => (x === 0 && y === 0 ? [255, 255, 255, 255] : [0, 0, 0, 0]));
    const out = featherEdges(data, 2, 2, 5);
    // Transparent pixels should stay transparent
    expect(out[(1 * 2 + 0) * 4 + 3]).toBe(0);
    expect(out[(1 * 2 + 1) * 4 + 3]).toBe(0);
  });
});

describe('applyMask', () => {
  test('restores original alpha for protected pixels', () => {
    const original = rgba(2, 2, (x, y) => [255, 255, 255, 255]);
    const out = new Uint8ClampedArray(original);
    // Make all pixels transparent in the output
    for (let i = 3; i < out.length; i += 4) out[i] = 0;
    // Protect pixel (0,0)
    const mask = new Uint8Array(4);
    mask[0] = 1; // protect pixel 0,0

    applyMask(out, original, mask, 2, 2);
    expect(out[3]).toBe(255); // restored
    expect(out[(1 * 2 + 1) * 4 + 3]).toBe(0); // still transparent
  });

  test('does not change pixels where mask is 0', () => {
    const original = rgba(2, 2, (x, y) => [255, 255, 255, 255]);
    const out = new Uint8ClampedArray(original);
    // Make half transparent
    for (let i = 3; i < out.length; i += 4) out[i] = 128;
    const mask = new Uint8Array(4); // all zeros

    applyMask(out, original, mask, 2, 2);
    for (let i = 3; i < out.length; i += 4) expect(out[i]).toBe(128);
  });
});

describe('rasterizePolygon', () => {
  test('returns empty mask for fewer than 3 points', () => {
    const mask = rasterizePolygon([{ x: 0, y: 0 }, { x: 5, y: 5 }], 10, 10);
    expect(mask.every((v) => v === 0)).toBe(true);
  });

  test('marks pixels inside polygon as 0', () => {
    const points = [
      { x: 1, y: 1 },
      { x: 4, y: 1 },
      { x: 4, y: 4 },
      { x: 1, y: 4 },
    ];
    const mask = rasterizePolygon(points, 6, 6);
    // Center pixel (2,2) is inside → mask should be 0
    expect(mask[2 * 6 + 2]).toBe(0);
    // Corner pixel (0,0) is outside → mask should be 1
    expect(mask[0 * 6 + 0]).toBe(1);
  });
});