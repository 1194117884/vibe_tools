import Head from 'next/head';
import Link from 'next/link';

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
  { id: 'morse', name: 'Morse Code', desc: 'Interactive Morse tree translator', icon: '🌳' },
  { id: 'banner', name: 'Banner Text', desc: 'Generate ASCII art text banners', icon: '🔤' },
  { id: 'jsformat', name: 'JS Formatter', desc: 'Format & minify JavaScript', icon: '📐' },
  { id: 'upload', name: 'Upload', desc: 'Upload files to cloud storage', icon: '☁️' },
];

export default function Home() {
  return (
    <>
      <Head>
        <title>Vibe Tools</title>
        <meta name="description" content="Your personal toolkit for everyday tasks" />
      </Head>

      {/* Hero — compact Apple showcase style */}
      <section className="bg-[#000000] text-[#f5f5f7]">
        <div className="px-6 md:px-10 py-10 md:py-14">
          <h1 className="font-display text-[40px] md:text-[52px] leading-[1.07] tracking-tight font-semibold mb-3">
            Vibe Tools
          </h1>
          <p className="text-[21px] md:text-[24px] leading-[1.17] font-semibold text-[#86868b] max-w-xl">
            Your personal toolkit for everyday tasks
          </p>
          <p className="mt-3 text-body text-[#6e6e73] max-w-lg">
            Sixteen simple utilities to format JSON, encode data, generate hashes,
            convert images, and more — all running locally in your browser.
          </p>
        </div>
      </section>

      {/* Tools grid */}
      <section className="bg-[#f5f5f7] dark:bg-[#000000] flex-1">
        <div className="px-6 md:px-10 py-8 md:py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {tools.map((tool) => (
              <Link
                key={tool.id}
                href={`/tools/${tool.id}`}
                className="group bg-[var(--background)] border border-[var(--border)] rounded-lg p-4 hover:shadow-[0_2px_12px_rgba(0,0,0,0.08)] hover:border-primary/30 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl flex-shrink-0">{tool.icon}</span>
                  <div>
                    <h3 className="font-semibold text-[17px] leading-[1.24] text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-control text-[var(--textMuted)] mt-0.5">{tool.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
