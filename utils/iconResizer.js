// utils/iconResizer.js
// Pure, framework-free helpers for the App Icon Resizer tool: platform
// presets (iOS / macOS / Android / Web size sets) plus selection and upscale
// detection logic. Everything here is plain data + functions so it can be
// unit-tested in Node without a DOM or canvas.

/**
 * One square icon target. `px` is the output edge length in pixels; `file` is
 * the filename (may include subfolders) inside the platform's ZIP folder.
 * @typedef {{ label: string, px: number, file: string }} IconSize
 */

/**
 * Platform presets. `folder` is the top-level directory the size's files are
 * written under in the ZIP. Sizes follow the official asset-catalog / iconset
 * / mipmap / favicon conventions.
 * @type {Array<{ id: string, label: string, folder: string, note: string, sizes: IconSize[] }>}
 */
export const PLATFORMS = [
  {
    id: 'ios',
    label: 'iOS / iPadOS',
    folder: 'ios',
    note: 'AppIcon set (iOS 7+)',
    sizes: [
      { label: '20pt · 1x', px: 20, file: 'Icon-20.png' },
      { label: '20pt · 2x', px: 40, file: 'Icon-20@2x.png' },
      { label: '20pt · 3x', px: 60, file: 'Icon-20@3x.png' },
      { label: '29pt · 1x', px: 29, file: 'Icon-29.png' },
      { label: '29pt · 2x', px: 58, file: 'Icon-29@2x.png' },
      { label: '29pt · 3x', px: 87, file: 'Icon-29@3x.png' },
      { label: '40pt · 1x', px: 40, file: 'Icon-40.png' },
      { label: '40pt · 2x', px: 80, file: 'Icon-40@2x.png' },
      { label: '40pt · 3x', px: 120, file: 'Icon-40@3x.png' },
      { label: '60pt · 2x', px: 120, file: 'Icon-60@2x.png' },
      { label: '60pt · 3x', px: 180, file: 'Icon-60@3x.png' },
      { label: '76pt · 1x', px: 76, file: 'Icon-76.png' },
      { label: '76pt · 2x', px: 152, file: 'Icon-76@2x.png' },
      { label: '83.5pt · 2x', px: 167, file: 'Icon-83.5@2x.png' },
      { label: 'App Store', px: 1024, file: 'Icon-1024.png' },
    ],
  },
  {
    id: 'macos',
    label: 'macOS',
    folder: 'macos',
    note: '.iconset PNGs (iconutil -c icns)',
    sizes: [
      { label: '16pt · 1x', px: 16, file: 'icon_16x16.png' },
      { label: '16pt · 2x', px: 32, file: 'icon_16x16@2x.png' },
      { label: '32pt · 1x', px: 32, file: 'icon_32x32.png' },
      { label: '32pt · 2x', px: 64, file: 'icon_32x32@2x.png' },
      { label: '128pt · 1x', px: 128, file: 'icon_128x128.png' },
      { label: '128pt · 2x', px: 256, file: 'icon_128x128@2x.png' },
      { label: '256pt · 1x', px: 256, file: 'icon_256x256.png' },
      { label: '256pt · 2x', px: 512, file: 'icon_256x256@2x.png' },
      { label: '512pt · 1x', px: 512, file: 'icon_512x512.png' },
      { label: '512pt · 2x', px: 1024, file: 'icon_512x512@2x.png' },
    ],
  },
  {
    id: 'android',
    label: 'Android',
    folder: 'android',
    note: 'mipmap densities + Play Store',
    sizes: [
      { label: 'mdpi', px: 48, file: 'mipmap-mdpi/ic_launcher.png' },
      { label: 'hdpi', px: 72, file: 'mipmap-hdpi/ic_launcher.png' },
      { label: 'xhdpi', px: 96, file: 'mipmap-xhdpi/ic_launcher.png' },
      { label: 'xxhdpi', px: 144, file: 'mipmap-xxhdpi/ic_launcher.png' },
      { label: 'xxxhdpi', px: 192, file: 'mipmap-xxxhdpi/ic_launcher.png' },
      { label: 'Play Store', px: 512, file: 'playstore-icon.png' },
    ],
  },
  {
    id: 'web',
    label: 'Web',
    folder: 'web',
    note: 'favicon + Apple touch + PWA',
    sizes: [
      { label: 'favicon', px: 16, file: 'favicon-16x16.png' },
      { label: 'favicon', px: 32, file: 'favicon-32x32.png' },
      { label: 'favicon', px: 48, file: 'favicon-48x48.png' },
      { label: 'Apple touch', px: 57, file: 'apple-touch-icon-57x57.png' },
      { label: 'Apple touch', px: 72, file: 'apple-touch-icon-72x72.png' },
      { label: 'Apple touch', px: 76, file: 'apple-touch-icon-76x76.png' },
      { label: 'Apple touch', px: 114, file: 'apple-touch-icon-114x114.png' },
      { label: 'Apple touch', px: 120, file: 'apple-touch-icon-120x120.png' },
      { label: 'Apple touch', px: 144, file: 'apple-touch-icon-144x144.png' },
      { label: 'Apple touch', px: 152, file: 'apple-touch-icon-152x152.png' },
      { label: 'Apple touch', px: 180, file: 'apple-touch-icon-180x180.png' },
      { label: 'PWA', px: 192, file: 'android-chrome-192x192.png' },
      { label: 'PWA', px: 512, file: 'android-chrome-512x512.png' },
    ],
  },
];

/** Find a platform preset by id, or null when unknown. */
export function getPlatform(id) {
  return PLATFORMS.find((p) => p.id === id) || null;
}

/** Stable selection key for a preset size (unique per file within a platform). */
export function sizeKey(platformId, file) {
  return platformId + '/' + file;
}

/** All selection keys for a platform's preset sizes. */
export function platformSizeKeys(platformId) {
  const platform = getPlatform(platformId);
  if (!platform) return [];
  return platform.sizes.map((s) => sizeKey(platformId, s.file));
}

/** Return a new Set with a platform's preset keys added. */
export function selectPlatformKeys(keys, platformId) {
  const next = new Set(keys);
  for (const key of platformSizeKeys(platformId)) next.add(key);
  return next;
}

/** Return a new Set with a platform's preset keys removed. */
export function deselectPlatformKeys(keys, platformId) {
  const next = new Set(keys);
  for (const key of platformSizeKeys(platformId)) next.delete(key);
  return next;
}

/**
 * Flatten every preset size into a single list with platform metadata and a
 * stable `key`. Used to render the picker and to build the export queue.
 */
export function flattenSizes() {
  const out = [];
  for (const platform of PLATFORMS) {
    for (const size of platform.sizes) {
      out.push({
        key: sizeKey(platform.id, size.file),
        platformId: platform.id,
        platformLabel: platform.label,
        folder: platform.folder,
        label: size.label,
        px: size.px,
        file: size.file,
      });
    }
  }
  return out;
}

/**
 * Whether generating `px` from a source of `sourceW`×`sourceH` would be an
 * upscale (target larger than the source along its longest edge). Upscaling a
 * raster bitmap loses sharpness; SVG sources are handled losslessly elsewhere
 * and should never be flagged.
 */
export function isUpscale(sourceW, sourceH, px) {
  const longest = Math.max(sourceW || 0, sourceH || 0);
  if (longest <= 0) return false;
  return px > longest;
}

/**
 * Sort a flat list of sizes by platform order, then pixel size, then filename.
 * Preset sizes from PLATFORMS are already ordered, but mixed/custom lists
 * benefit from a stable ordering.
 */
export function sortSizes(sizes) {
  const platformOrder = new Map(PLATFORMS.map((p, i) => [p.id, i]));
  return [...sizes].sort((a, b) => {
    if (a.platformId !== b.platformId) {
      return (platformOrder.get(a.platformId) ?? 999) - (platformOrder.get(b.platformId) ?? 999);
    }
    if (a.px !== b.px) return a.px - b.px;
    return String(a.file || '').localeCompare(String(b.file || ''));
  });
}

/** Total number of preset sizes across all platforms. */
export function totalPresetCount() {
  return PLATFORMS.reduce((sum, p) => sum + p.sizes.length, 0);
}
