import { useState } from 'react';
import Head from 'next/head';

const TABS = [
  { id: 'reference', label: 'Reference' },
  { id: 'practice', label: 'Practice' },
  { id: 'sandbox', label: 'Sandbox' },
];

export default function LazyVimLearn() {
  const [activeTab, setActiveTab] = useState('reference');

  return (
    <>
      <Head>
        <title>LazyVim Learn — Vibe Tools</title>
        <meta name="description" content="Learn and practice LazyVim keymaps" />
      </Head>

      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="bg-[#000000] text-[#f5f5f7]">
          <div className="px-6 md:px-10 py-8 md:py-10">
            <h1 className="font-display text-[40px] md:text-[48px] leading-[1.07] tracking-tight font-semibold mb-2">
              LazyVim Learn
            </h1>
            <p className="text-[19px] leading-[1.21] font-semibold text-[#86868b] max-w-xl">
              Master LazyVim keybindings through reference, practice, and hands-on simulation
            </p>
          </div>
        </div>

        {/* Tab bar */}
        <div className="bg-[#f5f5f7] dark:bg-[#1d1d1f] border-b border-[#d2d2d7] dark:border-[#424245]">
          <div className="px-6 md:px-10 flex gap-0">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 text-[14px] font-semibold leading-[1.29] transition-colors duration-150 border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? 'text-[#0071e3] border-[#0071e3]'
                    : 'text-[#6e6e73] border-transparent hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 bg-[#ffffff] dark:bg-[#000000]">
          {activeTab === 'reference' && (
            <div className="px-6 md:px-10 py-8">
              <p className="text-[17px] text-[#6e6e73]">Reference tab — coming up next.</p>
            </div>
          )}
          {activeTab === 'practice' && (
            <div className="px-6 md:px-10 py-8">
              <p className="text-[17px] text-[#6e6e73]">Practice tab — coming up next.</p>
            </div>
          )}
          {activeTab === 'sandbox' && (
            <div className="px-6 md:px-10 py-8">
              <p className="text-[17px] text-[#6e6e73]">Sandbox tab — coming up next.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}