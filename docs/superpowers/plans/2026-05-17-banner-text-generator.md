# Banner Text Generator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a browser-based ASCII art text banner generator tool using FIGlet fonts, similar to TAAG.

**Architecture:** Two new files — a thin Next.js page that wraps a client-only dynamic import, and a BannerContent component with figlet. This avoids SSR issues since figlet requires browser APIs. Two existing files modified to register the tool in sidebar and homepage.

**Tech Stack:** Next.js 14 (Pages Router), React, Tailwind CSS, `figlet` npm package (browser-compatible, `textSync` API, 25 pre-bundled fonts)

---

### Task 1: Install figlet dependency

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install figlet**

Run: `npm install figlet`

Expected: figlet added to `node_modules` and `package.json`.

- [ ] **Step 2: Verify fonts are available**

Run: `ls node_modules/figlet/importable-fonts/Standard.js`

Expected: file exists.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add figlet dependency for banner text generator"
```

---

### Task 2: Create the Banner tool page and component

**Files:**
- Create: `pages/tools/banner/index.js`
- Create: `pages/tools/banner/BannerContent.js`

- [ ] **Step 1: Create the thin page wrapper**

Create `pages/tools/banner/index.js`:

```js
import Head from 'next/head';
import dynamic from 'next/dynamic';

const BannerContent = dynamic(() => import('./BannerContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-body text-textDim">Loading…</p>
    </div>
  ),
});

export default function BannerPage() {
  return (
    <>
      <Head>
        <title>Banner Text Generator - Vibe Tools</title>
        <meta name="description" content="Generate ASCII art text banners with FIGlet fonts" />
      </Head>
      <BannerContent />
    </>
  );
}
```

- [ ] **Step 2: Create the BannerContent component with font imports and rendering logic**

Create `pages/tools/banner/BannerContent.js`:

```js
import { useState, useEffect, useRef, useCallback } from 'react';
import figlet from 'figlet';

// Import and register all 25 fonts
import StandardFont from 'figlet/importable-fonts/Standard';
import BigFont from 'figlet/importable-fonts/Big';
import SlantFont from 'figlet/importable-fonts/Slant';
import SmallFont from 'figlet/importable-fonts/Small';
import BannerFont from 'figlet/importable-fonts/Banner';
import Banner3DFont from 'figlet/importable-fonts/Banner3-D';
import BloodyFont from 'figlet/importable-fonts/Bloody';
import BulbheadFont from 'figlet/importable-fonts/Bulbhead';
import CalvinSFont from 'figlet/importable-fonts/Calvin S';
import CrawfordFont from 'figlet/importable-fonts/Crawford';
import DeltaCorpsPriest1Font from 'figlet/importable-fonts/Delta Corps Priest 1';
import DoomFont from 'figlet/importable-fonts/Doom';
import ElectronicFont from 'figlet/importable-fonts/Electronic';
import EliteFont from 'figlet/importable-fonts/Elite';
import EpicFont from 'figlet/importable-fonts/Epic';
import FrakturFont from 'figlet/importable-fonts/Fraktur';
import GraffitiFont from 'figlet/importable-fonts/Graffiti';
import JSBracketLettersFont from 'figlet/importable-fonts/JS Bracket Letters';
import Larry3DFont from 'figlet/importable-fonts/Larry 3D';
import NancyjFont from 'figlet/importable-fonts/Nancyj';
import OgreFont from 'figlet/importable-fonts/Ogre';
import RectanglesFont from 'figlet/importable-fonts/Rectangles';
import ShadowFont from 'figlet/importable-fonts/Shadow';
import UniversFont from 'figlet/importable-fonts/Univers';
import WeirdFont from 'figlet/importable-fonts/Weird';

import { Button } from '../../../components/ui/button';

figlet.parseFont('Standard', StandardFont);
figlet.parseFont('Big', BigFont);
figlet.parseFont('Slant', SlantFont);
figlet.parseFont('Small', SmallFont);
figlet.parseFont('Banner', BannerFont);
figlet.parseFont('Banner3-D', Banner3DFont);
figlet.parseFont('Bloody', BloodyFont);
figlet.parseFont('Bulbhead', BulbheadFont);
figlet.parseFont('Calvin S', CalvinSFont);
figlet.parseFont('Crawford', CrawfordFont);
figlet.parseFont('Delta Corps Priest 1', DeltaCorpsPriest1Font);
figlet.parseFont('Doom', DoomFont);
figlet.parseFont('Electronic', ElectronicFont);
figlet.parseFont('Elite', EliteFont);
figlet.parseFont('Epic', EpicFont);
figlet.parseFont('Fraktur', FrakturFont);
figlet.parseFont('Graffiti', GraffitiFont);
figlet.parseFont('JS Bracket Letters', JSBracketLettersFont);
figlet.parseFont('Larry 3D', Larry3DFont);
figlet.parseFont('Nancyj', NancyjFont);
figlet.parseFont('Ogre', OgreFont);
figlet.parseFont('Rectangles', RectanglesFont);
figlet.parseFont('Shadow', ShadowFont);
figlet.parseFont('Univers', UniversFont);
figlet.parseFont('Weird', WeirdFont);

const FONTS = [
  'Standard', 'Big', 'Slant', 'Small', 'Banner', 'Banner3-D',
  'Bloody', 'Bulbhead', 'Calvin S', 'Crawford', 'Delta Corps Priest 1',
  'Doom', 'Electronic', 'Elite', 'Epic', 'Fraktur', 'Graffiti',
  'JS Bracket Letters', 'Larry 3D', 'Nancyj', 'Ogre', 'Rectangles',
  'Shadow', 'Univers', 'Weird',
];

export default function BannerContent() {
  const [input, setInput] = useState('');
  const [font, setFont] = useState('Standard');
  const [width, setWidth] = useState(80);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const debounceRef = useRef(null);

  const renderBanner = useCallback(() => {
    if (!input.trim()) {
      setOutput('');
      setError('');
      return;
    }
    try {
      const result = figlet.textSync(input, { font, width });
      setOutput(result);
      setError('');
    } catch (e) {
      setError(e.message);
      setOutput('');
    }
  }, [input, font, width]);

  // Debounced render on input change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(renderBanner, 300);
    return () => clearTimeout(debounceRef.current);
  }, [input, renderBanner]);

  // Immediate render on font or width change
  useEffect(() => {
    if (input.trim()) {
      try {
        const result = figlet.textSync(input, { font, width });
        setOutput(result);
        setError('');
      } catch (e) {
        setError(e.message);
        setOutput('');
      }
    }
  }, [font, width]); // eslint-disable-line

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border py-10">
        <div className="max-w-4xl mx-auto px-6 md:px-10">
          <h1 className="text-hero font-semibold tracking-tight text-text">
            Banner Text Generator
          </h1>
          <p className="mt-2 text-body text-textDim">
            Generate ASCII art text banners with FIGlet fonts
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 md:px-10 py-8 space-y-5">
        {/* Input */}
        <div>
          <label className="block text-control text-text mb-2">Input text</label>
          <textarea
            className="w-full h-24 px-4 py-3 bg-input border border-border rounded-lg text-control font-mono text-text placeholder:text-textDim focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 resize-y"
            placeholder="Type your message here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-control text-text mb-2">Font</label>
            <select
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-control text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
              value={font}
              onChange={(e) => setFont(e.target.value)}
            >
              {FONTS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-control text-text mb-2">Width</label>
            <input
              type="number"
              className="w-24 px-3 py-2 bg-input border border-border rounded-lg text-control text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
              value={width}
              min={20}
              max={200}
              onChange={(e) => setWidth(parseInt(e.target.value, 10) || 80)}
            />
          </div>
          <Button variant="outline" onClick={renderBanner}>Refresh</Button>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-control text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Output */}
        {output && (
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="bg-surface px-4 py-2.5 border-b border-border flex justify-between items-center">
              <h3 className="text-body-emphasis text-text">Result</h3>
              <Button variant="ghost" size="sm" onClick={handleCopy}>Copy</Button>
            </div>
            <pre className="p-4 text-control font-mono text-text whitespace-pre overflow-x-auto bg-input max-h-[600px] overflow-y-auto">
              {output}
            </pre>
          </div>
        )}

        {/* Empty state */}
        {!output && !error && (
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="bg-surface px-4 py-2.5 border-b border-border">
              <h3 className="text-body-emphasis text-text">Result</h3>
            </div>
            <div className="p-8 text-center text-textDim">
              <p className="text-body">Type something above to generate your banner</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add pages/tools/banner/
git commit -m "feat: add Banner Text Generator tool page"
```

---

### Task 3: Register tool in sidebar navigation

**Files:**
- Modify: `components/SidebarLayout.js:6-22`

- [ ] **Step 1: Add banner entry to tools array**

In `components/SidebarLayout.js`, add to the `tools` array between `morse` and `jsformat`:

Old:
```js
  { id: 'morse', name: 'Morse Code', icon: '🌳' },
  { id: 'jsformat', name: 'JS Formatter', icon: '📐' },
];
```

New:
```js
  { id: 'morse', name: 'Morse Code', icon: '🌳' },
  { id: 'banner', name: 'Banner Text', icon: '🔤' },
  { id: 'jsformat', name: 'JS Formatter', icon: '📐' },
];
```

- [ ] **Step 2: Commit**

```bash
git add components/SidebarLayout.js
git commit -m "feat: add Banner Text to sidebar navigation"
```

---

### Task 4: Register tool on homepage grid

**Files:**
- Modify: `pages/index.js:4-20`

- [ ] **Step 1: Add banner entry to tools array**

In `pages/index.js`, add to the `tools` array between `morse` and `jsformat`:

Old:
```js
  { id: 'morse', name: 'Morse Code', desc: 'Interactive Morse tree translator', icon: '🌳' },
  { id: 'jsformat', name: 'JS Formatter', desc: 'Format & minify JavaScript', icon: '📐' },
];
```

New:
```js
  { id: 'morse', name: 'Morse Code', desc: 'Interactive Morse tree translator', icon: '🌳' },
  { id: 'banner', name: 'Banner Text', desc: 'Generate ASCII art text banners', icon: '🔤' },
  { id: 'jsformat', name: 'JS Formatter', desc: 'Format & minify JavaScript', icon: '📐' },
];
```

- [ ] **Step 2: Also update the hero text to say "sixteen" instead of "fifteen"**

In `pages/index.js` line 40, change:
```
Fifteen simple utilities
```
to:
```
Sixteen simple utilities
```

- [ ] **Step 3: Commit**

```bash
git add pages/index.js
git commit -m "feat: add Banner Text to homepage tool grid"
```

---

### Task 5: Test the tool

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`
Expected: server starts on `http://localhost:3000`

- [ ] **Step 2: Navigate to the Banner tool**

Open `http://localhost:3000/tools/banner` in a browser.

- [ ] **Step 3: Test basic text input**

Type "Hello" in the textarea. After 300ms debounce, verify:
- Output appears in the Result panel
- ASCII art "Hello" is displayed in the Standard font

- [ ] **Step 4: Test font switching**

Change font to "Doom". Verify:
- Output updates immediately without waiting for debounce
- The ASCII art style changes to match Doom font

- [ ] **Step 5: Test width control**

Set width to 40. Verify:
- Output re-renders with narrower width
- Long lines wrap at column 40

- [ ] **Step 6: Test Copy button**

Click the "Copy" button. Paste into a text editor. Verify:
- The full ASCII art was copied to clipboard

- [ ] **Step 7: Test Refresh button**

Clear the output (refresh page), type text, click "Refresh". Verify:
- Output re-renders immediately

- [ ] **Step 8: Test empty state**

Clear the input textarea. Verify:
- Output panel shows "Type something above to generate your banner" placeholder text
- No error shown

- [ ] **Step 9: Test navigation**

- Click "Banner Text" in the sidebar → page loads correctly
- Click "Banner Text" card on homepage → page loads correctly
- Active state in sidebar highlights for `/tools/banner` route

- [ ] **Step 10: Test mobile responsive**

Open the page at mobile viewport width (375px). Verify:
- Layout stacks vertically
- Mobile menu includes "Banner Text" link
- All controls accessible

- [ ] **Step 11: Commit any fixes if needed**
