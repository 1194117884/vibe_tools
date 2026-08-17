import {
  buildZip,
  colorDistance,
  computeAtlasTiles,
  computeGridTiles,
  computeSizeTiles,
  crc32,
  detectAtlasGrid,
  hexToRgb,
  removeBackgroundByColorKey,
  removeBackgroundFloodFill,
  sampleCornerColor,
} from '../../utils/spriteSlicer';

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

describe('computeGridTiles', () => {
  test('splits evenly divisible sheets exactly', () => {
    const tiles = computeGridTiles(10, 10, 2, 2);
    expect(tiles).toHaveLength(4);
    expect(tiles.map((t) => [t.x, t.y, t.w, t.h])).toEqual([
      [0, 0, 5, 5],
      [5, 0, 5, 5],
      [0, 5, 5, 5],
      [5, 5, 5, 5],
    ]);
  });

  test('distributes remainder pixels and stays row-major', () => {
    const tiles = computeGridTiles(11, 11, 2, 2);
    expect(tiles).toHaveLength(4);
    expect(tiles[0]).toMatchObject({ x: 0, y: 0, w: 6, h: 6 });
    expect(tiles[1]).toMatchObject({ x: 6, y: 0, w: 5, h: 6 });
    expect(tiles[2]).toMatchObject({ x: 0, y: 6, w: 6, h: 5 });
    expect(tiles[3]).toMatchObject({ x: 6, y: 6, w: 5, h: 5 });
  });

  test('clamps columns/rows to at least one', () => {
    expect(computeGridTiles(10, 10, 0, 0)).toHaveLength(1);
  });
});

describe('computeSizeTiles', () => {
  test('includes a smaller final column and row', () => {
    const tiles = computeSizeTiles(10, 10, 4, 4);
    expect(tiles).toHaveLength(9);
    expect(tiles[2]).toMatchObject({ x: 8, y: 0, w: 2, h: 4 });
    expect(tiles[8]).toMatchObject({ x: 8, y: 8, w: 2, h: 2 });
  });
});

describe('computeAtlasTiles', () => {
  test('lays out full tiles starting at the margin, stepping by size + separation', () => {
    const tiles = computeAtlasTiles(100, 100, 32, 32, 0, 0, 0, 0);
    expect(tiles).toHaveLength(9); // floor(100/32) = 3 columns x 3 rows
    expect(tiles[0]).toMatchObject({ x: 0, y: 0, w: 32, h: 32 });
    expect(tiles[1]).toMatchObject({ x: 32, y: 0, w: 32, h: 32 });
    expect(tiles[3]).toMatchObject({ x: 0, y: 32, w: 32, h: 32 });
  });

  test('applies margins and separation offsets', () => {
    const tiles = computeAtlasTiles(120, 120, 32, 32, 8, 4, 2, 2);
    expect(tiles[0]).toMatchObject({ x: 8, y: 4, w: 32, h: 32 });
    expect(tiles[1]).toMatchObject({ x: 42, y: 4 }); // 8 + 32 + 2
    expect(tiles[3]).toMatchObject({ x: 8, y: 38 }); // 4 + 32 + 2
  });

  test('excludes partial tiles at the right/bottom (Godot integer division)', () => {
    const tiles = computeAtlasTiles(70, 70, 32, 32, 0, 0, 0, 0);
    expect(tiles).toHaveLength(4); // 2 x 2, the 6px remainder is dropped
    expect(tiles.map((t) => [t.x, t.y])).toEqual([
      [0, 0],
      [32, 0],
      [0, 32],
      [32, 32],
    ]);
  });

  test('returns no tiles when the margin exceeds the sheet', () => {
    expect(computeAtlasTiles(10, 10, 32, 32, 20, 0, 0, 0)).toEqual([]);
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

describe('sampleCornerColor', () => {
  test('averages the four corners', () => {
    const data = rgba(2, 2, (x, y) => {
      const value = x === 0 && y === 0 ? 100 : x === 1 && y === 0 ? 200 : x === 0 && y === 1 ? 0 : 220;
      return [value, value, value, 255];
    });
    // corners: (0,0)=100, (1,0)=200, (0,1)=0, (1,1)=220 -> avg 130
    expect(sampleCornerColor(data, 2, 2)).toEqual({ r: 130, g: 130, b: 130 });
  });
});

describe('crc32', () => {
  test('matches the standard check value', () => {
    const bytes = Buffer.from('123456789', 'utf8');
    expect(crc32(bytes)).toBe(0xcbf43926);
  });
});

describe('buildZip', () => {
  test('produces a valid STORE archive with correct entries', () => {
    const zip = buildZip([
      { name: 'a.png', data: new Uint8Array([1, 2, 3, 4]) },
      { name: 'b.png', data: new Uint8Array([5, 6, 7]) },
    ]);
    const view = new DataView(zip.buffer);

    // local file header
    expect(view.getUint32(0, true)).toBe(0x04034b50);
    expect(view.getUint16(8, true)).toBe(0); // method = store
    expect(view.getUint16(26, true)).toBe(5); // "a.png" name length
    expect(view.getUint32(14, true)).toBe(crc32(new Uint8Array([1, 2, 3, 4])));

    // stored bytes for first entry follow the 30-byte header + 5-byte name
    expect(Array.from(zip.slice(35, 39))).toEqual([1, 2, 3, 4]);

    // end of central directory
    const eocd = zip.length - 22;
    expect(view.getUint32(eocd, true)).toBe(0x06054b50);
    expect(view.getUint16(eocd + 8, true)).toBe(2); // total entries
  });

  test('handles an empty entry list', () => {
    const zip = buildZip([]);
    expect(zip.length).toBe(22);
    expect(new DataView(zip.buffer).getUint32(0, true)).toBe(0x06054b50);
  });
});

describe('detectAtlasGrid', () => {
  function makeSheet({ transparent }) {
    // 3 cols x 2 rows, tile 10x10, margin 4, separation 2.
    const w = 38;
    const h = 26;
    const data = new Uint8ClampedArray(w * h * 4);
    if (!transparent) {
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
        data[i + 3] = 255;
      }
    }
    const fill = (x, y, ww, hh) => {
      for (let yy = y; yy < y + hh; yy++) {
        for (let xx = x; xx < x + ww; xx++) {
          const i = (yy * w + xx) * 4;
          data[i] = 255;
          data[i + 1] = 0;
          data[i + 2] = 0;
          data[i + 3] = 255;
        }
      }
    };
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 3; c++) {
        fill(4 + c * 12, 4 + r * 12, 10, 10);
      }
    }
    return { data, w, h };
  }

  test('detects a transparent tile sheet grid', () => {
    const { data, w, h } = makeSheet({ transparent: true });
    expect(detectAtlasGrid(data, w, h)).toEqual({
      tileW: 10,
      tileH: 10,
      marginX: 4,
      marginY: 4,
      sepX: 2,
      sepY: 2,
      cols: 3,
      rows: 2,
    });
  });

  test('detects an opaque tile sheet grid with a solid background', () => {
    const { data, w, h } = makeSheet({ transparent: false });
    expect(detectAtlasGrid(data, w, h)).toEqual({
      tileW: 10,
      tileH: 10,
      marginX: 4,
      marginY: 4,
      sepX: 2,
      sepY: 2,
      cols: 3,
      rows: 2,
    });
  });

  test('returns null for a single blob with no grid', () => {
    const w = 20;
    const h = 20;
    const data = new Uint8ClampedArray(w * h * 4);
    for (let y = 5; y < 15; y++) {
      for (let x = 5; x < 15; x++) {
        const i = (y * w + x) * 4;
        data[i] = 255;
        data[i + 3] = 255;
      }
    }
    expect(detectAtlasGrid(data, w, h)).toBeNull();
  });
});
