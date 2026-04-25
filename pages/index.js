import Head from 'next/head';
import Link from 'next/link';
import ThemeToggle from '../components/ThemeToggle';

const tools = [
  { id: 'json', name: 'JSON Formatter', desc: 'Format, validate & minify JSON', icon: '{ }' },
  { id: 'base64', name: 'Base64', desc: 'Encode & decode Base64', icon: 'Aa' },
  { id: 'url', name: 'URL Encoder', desc: 'URL encode & decode', icon: '🔗' },
  { id: 'hash', name: 'Hash Generator', desc: 'MD5, SHA-1, SHA-256', icon: '#' },
  { id: 'aes', name: 'AES Encrypt', desc: 'Symmetric encryption', icon: '🔐' },
  { id: 'rsa', name: 'RSA Key Gen', desc: 'Generate RSA key pairs', icon: '🔑' },
  { id: 'image', name: 'Image Convert', desc: 'HEIC/PNG/JPG/WebP conversion', icon: '🖼' },
  { id: 'jwt', name: 'JWT Decoder', desc: 'Parse JWT tokens', icon: '🎫' },
  { id: 'cron', name: 'Cron Generator', desc: 'Build cron expressions', icon: '⏰' },
  { id: 'color', name: 'Color Converter', desc: 'HEX/RGB/HSL', icon: '🎨' },
  { id: 'multibase', name: 'Multi-Base Converter', desc: 'Convert between hex, dec, bin & ASCII', icon: '🔢' },
  { id: 'md-pdf', name: 'Markdown → PDF', desc: 'Convert MD to PDF', icon: '📄' },
  { id: 'timestamp', name: 'Timestamp', desc: 'Unix timestamp converter', icon: '🕐' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>Vibe Tools</title>
        <meta name="description" content="Your personal toolkit for everyday tasks" />
      </Head>

      {/* Header */}
      <header className="border-b border-border py-6">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-text">Vibe Tools</h1>
            <p className="text-textMuted mt-1">Your personal toolkit</p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Tools Grid */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tools.map((tool) => (
            <Link
              key={tool.id}
              href={`/tools/${tool.id}`}
              className="group bg-surface border border-border rounded-xl p-5 hover:bg-surfaceHover hover:border-borderLight transition-all duration-200"
            >
              <div className="text-2xl mb-3">{tool.icon}</div>
              <h3 className="font-semibold text-text group-hover:text-primary transition-colors">
                {tool.name}
              </h3>
              <p className="text-sm text-textMuted mt-1">{tool.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-6 text-center text-textDim text-sm">
          Built with ❤️ using Next.js
        </div>
      </footer>
    </div>
  );
}