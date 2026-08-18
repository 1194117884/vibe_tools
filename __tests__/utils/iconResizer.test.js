import {
  PLATFORMS,
  deselectPlatformKeys,
  flattenSizes,
  getPlatform,
  isUpscale,
  platformSizeKeys,
  selectPlatformKeys,
  sizeKey,
  sortSizes,
  totalPresetCount,
} from '../../utils/iconResizer';

describe('PLATFORMS presets', () => {
  test('defines the four expected platforms in order', () => {
    expect(PLATFORMS.map((p) => p.id)).toEqual(['ios', 'macos', 'android', 'web']);
  });

  test('every size has a unique file within its platform and a positive px', () => {
    for (const platform of PLATFORMS) {
      const files = platform.sizes.map((s) => s.file);
      expect(new Set(files).size).toBe(files.length);
      for (const s of platform.sizes) {
        expect(Number.isInteger(s.px)).toBe(true);
        expect(s.px).toBeGreaterThan(0);
      }
    }
  });

  test('covers the expected size counts per platform', () => {
    const counts = Object.fromEntries(PLATFORMS.map((p) => [p.id, p.sizes.length]));
    expect(counts).toEqual({ ios: 15, macos: 10, android: 6, web: 13 });
  });

  test('macOS exports the standard 10-file iconset', () => {
    const files = getPlatform('macos').sizes.map((s) => s.file);
    expect(files).toEqual([
      'icon_16x16.png',
      'icon_16x16@2x.png',
      'icon_32x32.png',
      'icon_32x32@2x.png',
      'icon_128x128.png',
      'icon_128x128@2x.png',
      'icon_256x256.png',
      'icon_256x256@2x.png',
      'icon_512x512.png',
      'icon_512x512@2x.png',
    ]);
  });
});

describe('sizeKey / platformSizeKeys', () => {
  test('builds a stable key from platform and file', () => {
    expect(sizeKey('ios', 'Icon-1024.png')).toBe('ios/Icon-1024.png');
  });

  test('returns all keys for a platform and [] for unknown platforms', () => {
    expect(platformSizeKeys('android')).toHaveLength(6);
    expect(platformSizeKeys('nope')).toEqual([]);
  });
});

describe('selectPlatformKeys / deselectPlatformKeys', () => {
  test('adds and removes a platform without mutating the input', () => {
    const initial = new Set();
    const selected = selectPlatformKeys(initial, 'web');
    expect(selected.size).toBe(13);
    expect(initial.size).toBe(0);

    const removed = deselectPlatformKeys(selected, 'web');
    expect(removed.size).toBe(0);
    expect(selected.size).toBe(13);
  });

  test('preserves other platforms when deselecting', () => {
    let selected = new Set();
    selected = selectPlatformKeys(selected, 'ios');
    selected = selectPlatformKeys(selected, 'android');
    selected = deselectPlatformKeys(selected, 'ios');
    expect(selected.size).toBe(6);
    expect(platformSizeKeys('android').every((k) => selected.has(k))).toBe(true);
  });
});

describe('flattenSizes / totalPresetCount', () => {
  test('flattens every size exactly once with unique keys', () => {
    const flat = flattenSizes();
    expect(flat).toHaveLength(totalPresetCount());
    expect(new Set(flat.map((s) => s.key)).size).toBe(flat.length);
    for (const s of flat) {
      expect(s.platformId).toBeTruthy();
      expect(s.folder).toBeTruthy();
      expect(typeof s.px).toBe('number');
    }
  });
});

describe('isUpscale', () => {
  test('flags targets larger than the longest source edge', () => {
    expect(isUpscale(128, 128, 512)).toBe(true);
    expect(isUpscale(128, 128, 128)).toBe(false);
    expect(isUpscale(128, 128, 64)).toBe(false);
  });

  test('uses the longest edge for non-square sources', () => {
    expect(isUpscale(200, 100, 150)).toBe(false);
    expect(isUpscale(200, 100, 250)).toBe(true);
  });

  test('never flags unknown dimensions', () => {
    expect(isUpscale(0, 0, 1024)).toBe(false);
    expect(isUpscale(null, undefined, 1024)).toBe(false);
  });
});

describe('sortSizes', () => {
  test('orders by platform, then px, then filename', () => {
    const sorted = sortSizes([
      { platformId: 'web', px: 512, file: 'android-chrome-512x512.png' },
      { platformId: 'ios', px: 1024, file: 'Icon-1024.png' },
      { platformId: 'ios', px: 20, file: 'Icon-20.png' },
    ]);
    expect(sorted.map((s) => s.file)).toEqual([
      'Icon-20.png',
      'Icon-1024.png',
      'android-chrome-512x512.png',
    ]);
  });

  test('places entries without a platformId last', () => {
    const sorted = sortSizes([
      { px: 256, file: 'custom.png' },
      { platformId: 'ios', px: 20, file: 'Icon-20.png' },
    ]);
    expect(sorted[0].file).toBe('Icon-20.png');
    expect(sorted[1].file).toBe('custom.png');
  });
});
