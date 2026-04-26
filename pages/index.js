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
  { id: 'md-pdf', name: 'Markdown to PDF', desc: 'Convert MD to PDF', icon: '📄' },
  { id: 'timestamp', name: 'Timestamp', desc: 'Unix timestamp converter', icon: '🕐' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>Vibe Tools</title>
        <meta name="description" content="Your personal toolkit for everyday tasks" />
      </Head>

      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-between">
          <Link href="/" className="text-body font-semibold text-text tracking-tight">
            Vibe Tools
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-[#000000] text-[#f5f5f7]">
        <div className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
          <h1 className="font-display text-hero tracking-tight mb-4">
            Vibe Tools
          </h1>
          <p className="text-[28px] leading-[1.14] font-semibold text-[#86868b] max-w-xl mx-auto">
            Your personal toolkit for everyday tasks
          </p>
          <p className="mt-6 text-body text-[#6e6e73] max-w-md mx-auto">
            Thirteen simple utilities to format JSON, encode data, generate hashes, convert images, and more — all running locally in your browser.
          </p>
        </div>
      </section>

      {/* Tools Section */}
      <section className="bg-[#f5f5f7] dark:bg-[#000000]">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="font-display text-product text-center text-text mb-10 tracking-tight">
            Tools
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {tools.map((tool) => (
              <Link
                key={tool.id}
                href={`/tools/${tool.id}`}
                className="group bg-[var(--background)] border border-[var(--border)] rounded-lg p-5 hover:shadow-[0_2px_12px_rgba(0,0,0,0.08)] transition-shadow duration-200"
              >
                <div className="text-2xl mb-3">{tool.icon}</div>
                <h3 className="font-semibold text-[17px] leading-[1.24] text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
                  {tool.name}
                </h3>
                <p className="text-control text-[var(--textMuted)] mt-1">{tool.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#f5f5f7] dark:bg-[#000000] border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center text-micro text-[var(--textDim)]">
          Built with Next.js
        </div>
      </footer>
    </div>
  );
}
