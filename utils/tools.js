/**
 * Shared tool catalog used by the home page, sidebar, and tool search.
 */
export const tools = [
  { id: 'json', name: 'JSON Formatter', desc: 'Format, validate & minify JSON', icon: '{ }' },
  { id: 'base64', name: 'Base64', desc: 'Encode & decode Base64', icon: 'Aa' },
  { id: 'url', name: 'URL Encoder', desc: 'URL encode & decode', icon: '🔗' },
  { id: 'request', name: 'Request Builder', desc: 'Build and inspect HTTP requests', icon: '↔' },
  { id: 'hash', name: 'Hash Generator', desc: 'MD5, SHA-1, SHA-256', icon: '#' },
  { id: 'password', name: 'Password Generator', desc: 'Generate strong passwords', icon: '🔒' },
  { id: 'aes', name: 'AES Encrypt', desc: 'Symmetric encryption', icon: '🔐' },
  { id: 'rsa', name: 'RSA Key Gen', desc: 'Generate RSA key pairs', icon: '🔑' },
  { id: 'image', name: 'Image Convert', desc: 'HEIC/PNG/JPG/WebP conversion', icon: '🖼' },
  { id: 'paste-download', name: 'Paste Download', desc: 'Save clipboard images & files', icon: '📋' },
  { id: 'jwt', name: 'JWT Decoder', desc: 'Parse JWT tokens', icon: '🎫' },
  { id: 'cron', name: 'Cron Generator', desc: 'Build cron expressions', icon: '⏰' },
  { id: 'color', name: 'Color Converter', desc: 'HEX/RGB/HSL', icon: '🎨' },
  { id: 'multibase', name: 'Multi-Base Converter', desc: 'Convert between hex, dec, bin & ASCII', icon: '🔢' },
  { id: 'md-pdf', name: 'Markdown to PDF', desc: 'Convert MD to PDF', icon: '📄' },
  { id: 'timestamp', name: 'Timestamp', desc: 'Unix timestamp converter', icon: '🕐' },
  { id: 'morse', name: 'Morse Code', desc: 'Interactive Morse tree translator', icon: '🌳' },
  { id: 'banner', name: 'Banner Text', desc: 'Generate ASCII art text banners', icon: '🔤' },
  { id: 'jsformat', name: 'JS Formatter', desc: 'Format & minify JavaScript', icon: '📐' },
  { id: 'game-matrix', name: 'Game Matrix', desc: 'Manage game positioning & competitive analysis', icon: '🎮' },
];

export const protectedTools = [
  { id: 'upload', name: 'Upload Files', desc: 'Upload files to cloud storage', icon: '⬆️' },
  { id: 'douyin-proxy', name: 'Douyin Proxy', desc: 'Proxy Douyin media downloads', icon: '▶' },
];

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
