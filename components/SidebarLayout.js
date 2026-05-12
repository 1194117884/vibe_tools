import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ThemeToggle from './ThemeToggle';

const tools = [
  { id: 'json', name: 'JSON Formatter', icon: '{ }' },
  { id: 'base64', name: 'Base64', icon: 'Aa' },
  { id: 'url', name: 'URL Encoder', icon: '🔗' },
  { id: 'hash', name: 'Hash Generator', icon: '#' },
  { id: 'aes', name: 'AES Encrypt', icon: '🔐' },
  { id: 'rsa', name: 'RSA Key Gen', icon: '🔑' },
  { id: 'image', name: 'Image Convert', icon: '🖼' },
  { id: 'jwt', name: 'JWT Decoder', icon: '🎫' },
  { id: 'cron', name: 'Cron Generator', icon: '⏰' },
  { id: 'color', name: 'Color Converter', icon: '🎨' },
  { id: 'multibase', name: 'Multi-Base Converter', icon: '🔢' },
  { id: 'md-pdf', name: 'Markdown to PDF', icon: '📄' },
  { id: 'timestamp', name: 'Timestamp', icon: '🕐' },
  { id: 'morse', name: 'Morse Code', icon: '🌳' },
];

export default function SidebarLayout({ children }) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (toolId) => router.pathname === `/tools/${toolId}`;
  const isHome = router.pathname === '/';

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-12 bg-background/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-4">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-1.5 -ml-1.5 rounded hover:bg-surfaceHover transition-colors text-text"
          aria-label="Open menu"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <Link href="/" className="text-body-emphasis text-text tracking-tight">Vibe Tools</Link>
        <ThemeToggle />
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-surface border-r border-border animate-slide-in shadow-xl">
            <div className="flex flex-col h-full">
              {/* Mobile sidebar header */}
              <div className="flex items-center justify-between px-5 h-14 border-b border-border">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-body-emphasis text-text tracking-tight font-semibold"
                >
                  Vibe Tools
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded hover:bg-surfaceHover transition-colors text-textDim"
                  aria-label="Close menu"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Mobile sidebar navigation */}
              <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                    isHome
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-text hover:bg-surfaceHover'
                  }`}
                >
                  <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955a1.126 1.126 0 0 1 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                  </svg>
                  <span className="text-control">Home</span>
                </Link>

                <div className="my-2 border-t border-border" />

                {tools.map((tool) => (
                  <Link
                    key={tool.id}
                    href={`/tools/${tool.id}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                      isActive(tool.id)
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-text hover:bg-surfaceHover'
                    }`}
                  >
                    <span className="text-base flex-shrink-0 w-5 text-center leading-none">{tool.icon}</span>
                    <span className="text-control">{tool.name}</span>
                  </Link>
                ))}
              </nav>

              {/* Mobile sidebar footer */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-border">
                <span className="text-micro text-textDim">Theme</span>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-surface border-r border-border z-40">
        <div className="flex flex-col h-full">
          {/* Brand */}
          <div className="px-6 h-14 flex items-center border-b border-border">
            <Link href="/" className="text-body-emphasis text-text tracking-tight font-semibold">
              Vibe Tools
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
            <Link
              href="/"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                isHome
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-text hover:bg-surfaceHover'
              }`}
            >
              <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955a1.126 1.126 0 0 1 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              <span className="text-control">Home</span>
            </Link>

            <div className="my-2 border-t border-border" />

            {tools.map((tool) => (
              <Link
                key={tool.id}
                href={`/tools/${tool.id}`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                  isActive(tool.id)
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-text hover:bg-surfaceHover'
                }`}
              >
                <span className="text-base flex-shrink-0 w-5 text-center leading-none">{tool.icon}</span>
                <span className="text-control">{tool.name}</span>
              </Link>
            ))}
          </nav>

          {/* Sidebar footer */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-border">
            <span className="text-micro text-textDim">Appearance</span>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 md:ml-64 pt-12 md:pt-0 min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  );
}
