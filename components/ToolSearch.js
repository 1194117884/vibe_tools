import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { filterTools, protectedTools, tools } from '../utils/tools';

function useIsMac() {
  const [isMac, setIsMac] = useState(false);
  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad|iPod/.test(navigator.platform));
  }, []);
  return isMac;
}

/**
 * Global tool search palette (Meta+K / Ctrl+K).
 * Searches tool name and description; navigates on Enter / click.
 */
export default function ToolSearch({ protectedVisible = false }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const isMac = useIsMac();

  const searchableTools = useMemo(() => {
    if (protectedVisible) {
      return [...tools, ...protectedTools];
    }
    return tools;
  }, [protectedVisible]);

  const results = useMemo(
    () => filterTools(searchableTools, query),
    [searchableTools, query]
  );

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setActiveIndex(0);
  }, []);

  const selectTool = useCallback(
    (tool) => {
      if (!tool) return;
      close();
      router.push(`/tools/${tool.id}`);
    },
    [close, router]
  );

  // Global Meta+K / Ctrl+K shortcut + custom open event from trigger buttons
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((prev) => {
          if (prev) {
            setQuery('');
            setActiveIndex(0);
            return false;
          }
          setQuery('');
          setActiveIndex(0);
          return true;
        });
      }
    };
    const onOpenEvent = () => {
      setQuery('');
      setActiveIndex(0);
      setOpen(true);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('vibe:open-tool-search', onOpenEvent);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('vibe:open-tool-search', onOpenEvent);
    };
  }, []);

  // Focus input when opened; Escape closes from anywhere while open
  useEffect(() => {
    if (!open) return undefined;
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    const onEscape = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener('keydown', onEscape);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', onEscape);
    };
  }, [open, close]);

  // Keep active index in range when results change
  useEffect(() => {
    setActiveIndex((i) => {
      if (results.length === 0) return 0;
      return Math.min(i, results.length - 1);
    });
  }, [results.length]);

  // Scroll active item into view
  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-index="${activeIndex}"]`);
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex, open]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (results.length ? (i + 1) % results.length : 0));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) =>
        results.length ? (i - 1 + results.length) % results.length : 0
      );
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      selectTool(results[activeIndex]);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center pt-[12vh] md:pt-[15vh] px-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search tools"
        className="w-full max-w-lg bg-background border border-border rounded-xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center gap-3 px-4 border-b border-border">
          <svg
            className="h-5 w-5 text-textDim flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search tools by name or description…"
            className="flex-1 h-12 bg-transparent text-[15px] text-text placeholder:text-textDim outline-none"
            aria-autocomplete="list"
            aria-controls="tool-search-results"
            aria-activedescendant={
              results[activeIndex]
                ? `tool-search-item-${results[activeIndex].id}`
                : undefined
            }
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded border border-border text-micro text-textDim font-sans">
            esc
          </kbd>
        </div>

        <ul
          id="tool-search-results"
          ref={listRef}
          role="listbox"
          className="max-h-[50vh] overflow-y-auto scrollbar-hide py-2"
        >
          {results.length === 0 ? (
            <li className="px-4 py-8 text-center text-control text-textMuted">
              No tools match “{query.trim()}”
            </li>
          ) : (
            results.map((tool, index) => {
              const active = index === activeIndex;
              return (
                <li
                  key={tool.id}
                  id={`tool-search-item-${tool.id}`}
                  data-index={index}
                  role="option"
                  aria-selected={active}
                >
                  <button
                    type="button"
                    onClick={() => selectTool(tool)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      active
                        ? 'bg-primary/10 text-primary'
                        : 'text-text hover:bg-surfaceHover'
                    }`}
                  >
                    <span className="text-base flex-shrink-0 w-6 text-center leading-none">
                      {tool.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-control font-medium truncate">
                        {tool.name}
                      </span>
                      {tool.desc && (
                        <span
                          className={`block text-micro truncate ${
                            active ? 'text-primary/70' : 'text-textMuted'
                          }`}
                        >
                          {tool.desc}
                        </span>
                      )}
                    </span>
                    {active && (
                      <kbd className="hidden sm:inline text-micro text-textDim">
                        ↵
                      </kbd>
                    )}
                  </button>
                </li>
              );
            })
          )}
        </ul>

        <div className="flex items-center justify-between px-4 py-2 border-t border-border text-micro text-textDim">
          <span>
            {results.length} tool{results.length === 1 ? '' : 's'}
          </span>
          <span className="hidden sm:inline">
            {isMac ? '⌘' : 'Ctrl'}K to toggle · ↑↓ navigate · ↵ open
          </span>
        </div>
      </div>
    </div>
  );
}

/** Dispatch open for the global ToolSearch instance. */
export function openToolSearch() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('vibe:open-tool-search'));
  }
}

/** Trigger button for sidebar / mobile header. */
export function ToolSearchTrigger({ className = '', collapsed = false }) {
  const isMac = useIsMac();

  return (
    <button
      type="button"
      onClick={openToolSearch}
      className={className}
      title={`Search tools (${isMac ? '⌘' : 'Ctrl'}K)`}
      aria-label="Search tools"
    >
      <svg
        className="h-4 w-4 flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
        />
      </svg>
      {!collapsed && (
        <>
          <span className="text-control">Search</span>
          <kbd className="ml-auto text-micro text-textDim font-sans opacity-70">
            {isMac ? '⌘K' : 'Ctrl+K'}
          </kbd>
        </>
      )}
    </button>
  );
}
