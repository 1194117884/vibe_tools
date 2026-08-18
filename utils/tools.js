/**
 * Shared tool catalog used by the home page, sidebar, and tool search.
 *
 * category ids must match an entry in CATEGORIES.
 */

/** Sidebar / home grouping. Order = display order. */
export const CATEGORIES = [
  { id: 'format', label: 'Format & Diff' },
  { id: 'convert', label: 'Converters' },
  { id: 'crypto', label: 'Crypto' },
  { id: 'web', label: 'Web' },
  { id: 'devops', label: 'DevOps' },
  { id: 'media', label: 'Media' },
  { id: 'other', label: 'Other' },
  { id: 'private', label: 'Private' },
];

export const tools = [
  // Format & Diff
  { id: 'json', name: 'JSON Formatter', desc: 'Format, validate & minify JSON', icon: '{ }', category: 'format' },
  { id: 'json-diff', name: 'JSON Diff', desc: 'Compare two JSON objects side by side', icon: '≠', category: 'format' },
  { id: 'text-diff', name: 'Text Diff', desc: 'Compare two texts line by line', icon: '📄', category: 'format' },
  { id: 'yaml', name: 'YAML ↔ JSON', desc: 'Convert between YAML and JSON', icon: 'Y', category: 'format' },
  { id: 'json-csv', name: 'JSON → CSV', desc: 'Convert JSON arrays to CSV', icon: '📊', category: 'format' },
  { id: 'sql', name: 'SQL Formatter', desc: 'Format and prettify SQL queries', icon: 'SQL', category: 'format' },
  { id: 'jsformat', name: 'JS Formatter', desc: 'Format & minify JavaScript', icon: '📐', category: 'format' },
  { id: 'md-pdf', name: 'Markdown to PDF', desc: 'Convert MD to PDF', icon: '📄', category: 'format' },

  // Converters
  { id: 'base64', name: 'Base64', desc: 'Encode & decode Base64', icon: 'Aa', category: 'convert' },
  { id: 'url', name: 'URL Encoder', desc: 'URL encode & decode', icon: '🔗', category: 'convert' },
  { id: 'case', name: 'Case Converter', desc: 'snake_case, camelCase, kebab-case & more', icon: 'Aa', category: 'convert' },
  { id: 'slugify', name: 'Slugify', desc: 'Make URL and filename-safe slugs', icon: '—', category: 'convert' },
  { id: 'html-entities', name: 'HTML Entities', desc: 'Escape and unescape HTML entities', icon: '</>', category: 'convert' },
  { id: 'multibase', name: 'Multi-Base Converter', desc: 'Convert between hex, dec, bin & ASCII', icon: '🔢', category: 'convert' },
  { id: 'color', name: 'Color Converter', desc: 'HEX/RGB/HSL', icon: '🎨', category: 'convert' },
  { id: 'timestamp', name: 'Timestamp', desc: 'Unix timestamp converter', icon: '🕐', category: 'convert' },
  { id: 'morse', name: 'Morse Code', desc: 'Interactive Morse tree translator', icon: '🌳', category: 'convert' },

  // Crypto
  { id: 'hash', name: 'Hash Generator', desc: 'MD5, SHA-1, SHA-256', icon: '#', category: 'crypto' },
  { id: 'hmac', name: 'HMAC Generator', desc: 'HMAC-SHA signatures for API auth', icon: '🔏', category: 'crypto' },
  { id: 'password', name: 'Password Generator', desc: 'Generate strong passwords', icon: '🔒', category: 'crypto' },
  { id: 'uuid', name: 'UUID / ULID', desc: 'Generate UUID v4 and ULID identifiers', icon: '🆔', category: 'crypto' },
  { id: 'aes', name: 'AES Encrypt', desc: 'Symmetric encryption', icon: '🔐', category: 'crypto' },
  { id: 'rsa', name: 'RSA Key Gen', desc: 'Generate RSA key pairs', icon: '🔑', category: 'crypto' },
  { id: 'jwt', name: 'JWT Decoder', desc: 'Parse JWT tokens', icon: '🎫', category: 'crypto' },

  // Web
  { id: 'url-parser', name: 'URL Parser', desc: 'Break URLs into host, path, query & more', icon: '🧩', category: 'web' },
  { id: 'request', name: 'Request Builder', desc: 'Build and inspect HTTP requests', icon: '↔', category: 'web' },
  { id: 'regex', name: 'Regex Tester', desc: 'Test regular expressions with live matches', icon: '.*', category: 'web' },

  // DevOps
  { id: 'cron', name: 'Cron Generator', desc: 'Build cron expressions', icon: '⏰', category: 'devops' },
  { id: 'docker', name: 'Docker Compose', desc: 'Convert docker run to docker-compose', icon: '🐳', category: 'devops' },
  { id: 'chmod', name: 'Chmod Calculator', desc: 'Unix file permission calculator', icon: 'rwx', category: 'devops' },
  { id: 'subnet', name: 'IPv4 Subnet', desc: 'CIDR subnet calculator', icon: '🌐', category: 'devops' },

  // Media
  { id: 'image', name: 'Image Convert', desc: 'HEIC/PNG/JPG/WebP conversion', icon: '🖼', category: 'media' },
  { id: 'icon-resizer', name: 'Icon Resizer', desc: 'Generate iOS / macOS / Android / Web app icons at every size', icon: '📱', category: 'media' },
  { id: 'sprite-slicer', name: 'Sprite Slicer', desc: 'Slice sprite sheets into tiles & remove solid backgrounds', icon: '✂️', category: 'media' },
  { id: 'bg-remover', name: 'Background Remover', desc: 'Remove solid-color backgrounds from PNG & WebP images', icon: '🎯', category: 'media' },
  { id: 'paste-download', name: 'Paste Download', desc: 'Save clipboard images & files', icon: '📋', category: 'media' },
  { id: 'banner', name: 'Banner Text', desc: 'Generate ASCII art text banners', icon: '🔤', category: 'media' },

  // Other
  { id: 'game-matrix', name: 'Game Matrix', desc: 'Manage game positioning & competitive analysis', icon: '🎮', category: 'other' },
  { id: 'lazyvim-learn', name: 'LazyVim Learn', desc: 'Learn and practice LazyVim keymaps', icon: '⌨️', category: 'other' },
];

export const protectedTools = [
  { id: 'upload', name: 'Upload Files', desc: 'Upload files to cloud storage', icon: '⬆️', category: 'private' },
  { id: 'douyin-proxy', name: 'Douyin Proxy', desc: 'Proxy Douyin media downloads', icon: '▶', category: 'private' },
  { id: 'x-viewer', name: 'Unroll X', desc: 'Read X posts and download media', icon: '𝕏', category: 'private' },
];

/**
 * Group tools into categories for the sidebar.
 * Empty categories are omitted. Unknown category ids fall under "other".
 */
export function groupToolsByCategory(toolList, categories = CATEGORIES) {
  const buckets = new Map(categories.map((c) => [c.id, []]));
  const knownIds = new Set(categories.map((c) => c.id));

  for (const tool of toolList || []) {
    const catId = knownIds.has(tool.category) ? tool.category : 'other';
    if (!buckets.has(catId)) buckets.set(catId, []);
    buckets.get(catId).push(tool);
  }

  return categories
    .map((c) => ({
      id: c.id,
      label: c.label,
      tools: buckets.get(c.id) || [],
    }))
    .filter((group) => group.tools.length > 0);
}

/**
 * Filter tools by query against name and description (case-insensitive).
 * Empty query returns the full list.
 */
export function filterTools(toolList, query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return toolList;
  return toolList.filter((tool) => {
    const name = (tool.name || '').toLowerCase();
    const desc = (tool.desc || '').toLowerCase();
    const id = (tool.id || '').toLowerCase();
    return name.includes(q) || desc.includes(q) || id.includes(q);
  });
}
