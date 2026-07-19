import Head from 'next/head';
import Link from 'next/link';
import { tools } from '../utils/tools';

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
            {tools.length} simple utilities to format JSON, encode data, generate hashes,
            convert images, and more — all running locally in your browser.
            Press <kbd className="px-1.5 py-0.5 rounded border border-[#424245] text-[#a1a1a6] text-[13px] font-sans">⌘K</kbd> to search.
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
