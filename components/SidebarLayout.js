import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ThemeToggle from './ThemeToggle';
import HiddenTrigger from './HiddenTrigger';
import AuthModal from './AuthModal';
import ToolSearch, { ToolSearchTrigger } from './ToolSearch';
import { useAuth } from '../contexts/AuthContext';
import { protectedTools, tools } from '../utils/tools';

const PROTECTED_MENU_STORAGE_KEY = 'protected_tools_menu_visible';

export default function SidebarLayout({ children }) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, verify } = useAuth();
  const [protectedMenuVisible, setProtectedMenuVisible] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('sidebar_collapsed') === 'true') {
      setSidebarCollapsed(true);
    }
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  };

  useEffect(() => {
    if (localStorage.getItem(PROTECTED_MENU_STORAGE_KEY) === 'true') {
      setProtectedMenuVisible(true);
    }
  }, []);

  const revealProtectedMenu = () => {
    localStorage.setItem(PROTECTED_MENU_STORAGE_KEY, 'true');
    setProtectedMenuVisible(true);
  };

  const handleVerify = async (key) => {
    setAuthLoading(true);
    setAuthError('');
    const err = await verify(key);
    if (err) {
      setAuthError(err);
    } else {
      setShowAuthModal(false);
      setAuthError('');
      router.push('/tools/upload');
    }
    setAuthLoading(false);
  };

  const isActive = (toolId) => router.pathname === `/tools/${toolId}`;
  const isHome = router.pathname === '/';
  const visibleProtectedTools = protectedMenuVisible || isAuthenticated ? protectedTools : [];

  const searchTriggerClass = (collapsed) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-text hover:bg-surfaceHover w-full ${
      collapsed ? 'justify-center' : ''
    }`;

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
        <div className="flex items-center gap-1">
          <ToolSearchTrigger className="p-1.5 rounded hover:bg-surfaceHover transition-colors text-text" collapsed />
          <ThemeToggle />
        </div>
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
              <nav className="flex-1 overflow-y-auto scrollbar-hide py-2 px-2 space-y-0.5">
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

                <ToolSearchTrigger
                  className={searchTriggerClass(false)}
                  collapsed={false}
                />

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

                {visibleProtectedTools.length > 0 && (
                  <>
                    <div className="my-2 border-t border-border" />
                    {visibleProtectedTools.map((tool) => (
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
                  </>
                )}
              </nav>

              {/* Mobile sidebar footer */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-border">
                <span className="text-micro text-textDim">Theme</span>
                <HiddenTrigger onActivated={revealProtectedMenu}>
                  <span className="text-micro text-textDim select-none cursor-default">·</span>
                </HiddenTrigger>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 bg-surface border-r border-border z-40 transition-all duration-300 ${sidebarCollapsed ? 'md:w-14' : 'md:w-64'}`}>
        <div className="flex flex-col h-full">
          {/* Brand */}
          <div className="px-3 h-14 flex items-center border-b border-border">
            <Link href="/" className={`text-body-emphasis text-text tracking-tight font-semibold whitespace-nowrap ${sidebarCollapsed ? 'hidden' : 'block'}`}>
              Vibe Tools
            </Link>
            <button
              onClick={toggleSidebar}
              className={`p-1.5 rounded hover:bg-surfaceHover transition-colors text-textDim ${sidebarCollapsed ? 'mx-auto' : 'ml-auto'}`}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                {sidebarCollapsed ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                )}
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto scrollbar-hide py-3 px-2 space-y-0.5">
            <Link
              href="/"
              title={sidebarCollapsed ? 'Home' : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                isHome
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-text hover:bg-surfaceHover'
              }`}
            >
              <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955a1.126 1.126 0 0 1 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              <span className={`text-control whitespace-nowrap ${sidebarCollapsed ? 'hidden' : 'block'}`}>Home</span>
            </Link>

            <ToolSearchTrigger
              className={searchTriggerClass(sidebarCollapsed)}
              collapsed={sidebarCollapsed}
            />

            <div className="my-2 border-t border-border" />

            {tools.map((tool) => (
              <Link
                key={tool.id}
                href={`/tools/${tool.id}`}
                title={sidebarCollapsed ? tool.name : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                  isActive(tool.id)
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-text hover:bg-surfaceHover'
                }`}
              >
                <span className="text-base flex-shrink-0 w-5 text-center leading-none">{tool.icon}</span>
                <span className={`text-control whitespace-nowrap ${sidebarCollapsed ? 'hidden' : 'block'}`}>{tool.name}</span>
              </Link>
            ))}

            {visibleProtectedTools.length > 0 && (
              <>
                <div className="my-2 border-t border-border" />
                {visibleProtectedTools.map((tool) => (
                  <Link
                    key={tool.id}
                    href={`/tools/${tool.id}`}
                    title={sidebarCollapsed ? tool.name : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                      isActive(tool.id)
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-text hover:bg-surfaceHover'
                    }`}
                  >
                    <span className="text-base flex-shrink-0 w-5 text-center leading-none">{tool.icon}</span>
                    <span className={`text-control whitespace-nowrap ${sidebarCollapsed ? 'hidden' : 'block'}`}>{tool.name}</span>
                  </Link>
                ))}
              </>
            )}
          </nav>

          {/* Sidebar footer */}
          <div className="flex items-center justify-between px-3 py-3 border-t border-border">
            <span className={`text-micro text-textDim whitespace-nowrap ${sidebarCollapsed ? 'hidden' : 'block'}`}>Appearance</span>
            <HiddenTrigger onActivated={revealProtectedMenu}>
              <span className="text-micro text-textDim select-none cursor-default">{sidebarCollapsed ? '' : '·'}</span>
            </HiddenTrigger>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className={`flex-1 pt-12 md:pt-0 min-h-screen flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'md:ml-14' : 'md:ml-64'}`}>
        {children}
      </div>

      <ToolSearch protectedVisible={protectedMenuVisible || isAuthenticated} />

      <AuthModal
        open={showAuthModal}
        onVerify={handleVerify}
        onClose={() => setShowAuthModal(false)}
        error={authError}
        loading={authLoading}
      />
    </div>
  );
}
