# LazyVim Learn Tool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an interactive browser-based LazyVim keymap learning tool with reference, practice, and sandbox modes.

**Architecture:** A Next.js page at `pages/tools/lazyvim-learn/index.js` with three tab modes. Keymap data lives in `utils/lazyvim-keymaps.js`. A virtual editor engine in `utils/lazyvim-engine.js` simulates Vim buffer behavior. Tests in `__tests__/utils/lazyvim-engine.test.js` and `__tests__/utils/lazyvim-keymaps.test.js`.

**Tech Stack:** Next.js 14, React 18, Tailwind CSS 3, Jest + React Testing Library

---

### Task 1: Create the keymap data file

**Files:**
- Create: `utils/lazyvim-keymaps.js`

- [ ] **Step 1: Write the keymap data file**

```js
/**
 * LazyVim keymap reference data.
 * Each entry maps a key sequence to a human-readable description and an engine action.
 *
 * Field reference:
 *   id            - unique identifier
 *   keys          - key sequence (e.g., "dd", "ciw", "<leader>ff")
 *   description   - human-readable action description
 *   category      - movement | editing | visual | window | search | telescope | lsp | git | ui
 *   tags          - search keywords
 *   engineAction  - method name on LazyVimEngine
 *   engineArgs    - optional arguments object passed to engineAction
 */

export const KEYMAP_CATEGORIES = [
  { id: 'movement', label: 'Movement' },
  { id: 'editing', label: 'Editing' },
  { id: 'visual', label: 'Visual' },
  { id: 'window', label: 'Window' },
  { id: 'search', label: 'Search' },
  { id: 'telescope', label: 'Telescope' },
  { id: 'lsp', label: 'LSP' },
  { id: 'git', label: 'Git' },
  { id: 'ui', label: 'UI' },
];

export const keymaps = [
  // ── Movement ──────────────────────────────────────────────
  { id: 'move-left',        keys: 'h',          description: 'Move cursor left',                          category: 'movement',   tags: ['left', 'cursor', 'navigation'], engineAction: 'moveCursor',          engineArgs: { direction: 'left' } },
  { id: 'move-down',        keys: 'j',          description: 'Move cursor down',                          category: 'movement',   tags: ['down', 'cursor', 'navigation'], engineAction: 'moveCursor',          engineArgs: { direction: 'down' } },
  { id: 'move-up',          keys: 'k',          description: 'Move cursor up',                            category: 'movement',   tags: ['up', 'cursor', 'navigation'],   engineAction: 'moveCursor',          engineArgs: { direction: 'up' } },
  { id: 'move-right',       keys: 'l',          description: 'Move cursor right',                         category: 'movement',   tags: ['right', 'cursor', 'navigation'], engineAction: 'moveCursor',        engineArgs: { direction: 'right' } },
  { id: 'move-word',        keys: 'w',          description: 'Jump to start of next word',                category: 'movement',   tags: ['word', 'jump', 'forward'],       engineAction: 'moveWord',            engineArgs: { direction: 'forward' } },
  { id: 'move-word-back',   keys: 'b',          description: 'Jump to start of previous word',            category: 'movement',   tags: ['word', 'jump', 'backward'],      engineAction: 'moveWord',            engineArgs: { direction: 'backward' } },
  { id: 'move-word-end',    keys: 'e',          description: 'Jump to end of next word',                  category: 'movement',   tags: ['word', 'jump', 'end'],           engineAction: 'moveWordEnd',          engineArgs: {} },
  { id: 'move-line-start',  keys: '0',          description: 'Move to start of line',                     category: 'movement',   tags: ['line', 'start', 'beginning'],    engineAction: 'moveToLineStart',      engineArgs: {} },
  { id: 'move-line-end',    keys: '$',          description: 'Move to end of line',                       category: 'movement',   tags: ['line', 'end'],                   engineAction: 'moveToLineEnd',        engineArgs: {} },
  { id: 'move-file-start',  keys: 'gg',         description: 'Move to top of file',                       category: 'movement',   tags: ['file', 'top', 'start'],          engineAction: 'moveToFileStart',      engineArgs: {} },
  { id: 'move-file-end',    keys: 'G',          description: 'Move to bottom of file',                    category: 'movement',   tags: ['file', 'bottom', 'end'],         engineAction: 'moveToFileEnd',        engineArgs: {} },
  { id: 'move-paragraph',   keys: '}',          description: 'Jump to next paragraph/blank line',         category: 'movement',   tags: ['paragraph', 'jump', 'block'],    engineAction: 'moveParagraph',        engineArgs: { direction: 'forward' } },
  { id: 'move-paragraph-prev', keys: '{',       description: 'Jump to previous paragraph/blank line',     category: 'movement',   tags: ['paragraph', 'jump', 'block'],    engineAction: 'moveParagraph',        engineArgs: { direction: 'backward' } },
  { id: 'move-half-down',   keys: '<C-d>',      description: 'Scroll half page down',                     category: 'movement',   tags: ['scroll', 'page', 'down'],        engineAction: 'scrollHalfPage',       engineArgs: { direction: 'down' } },
  { id: 'move-half-up',     keys: '<C-u>',      description: 'Scroll half page up',                       category: 'movement',   tags: ['scroll', 'page', 'up'],          engineAction: 'scrollHalfPage',       engineArgs: { direction: 'up' } },
  { id: 'move-match',       keys: '%',          description: 'Jump to matching bracket/paren',            category: 'movement',   tags: ['match', 'bracket', 'paren'],     engineAction: 'jumpToMatch',          engineArgs: {} },

  // ── Editing ────────────────────────────────────────────────
  { id: 'insert-before',    keys: 'i',          description: 'Enter insert mode before cursor',           category: 'editing',  tags: ['insert', 'mode', 'cursor'],       engineAction: 'enterInsert',         engineArgs: { position: 'cursor' } },
  { id: 'insert-after',     keys: 'a',          description: 'Enter insert mode after cursor',            category: 'editing',  tags: ['insert', 'mode', 'append'],       engineAction: 'enterInsert',         engineArgs: { position: 'after' } },
  { id: 'insert-line-below', keys: 'o',         description: 'Open new line below and enter insert mode', category: 'editing',  tags: ['insert', 'line', 'below'],        engineAction: 'openLineBelow',       engineArgs: {} },
  { id: 'insert-line-above', keys: 'O',         description: 'Open new line above and enter insert mode', category: 'editing',  tags: ['insert', 'line', 'above'],        engineAction: 'openLineAbove',       engineArgs: {} },
  { id: 'insert-line-start', keys: 'I',         description: 'Enter insert mode at start of line',        category: 'editing',  tags: ['insert', 'line', 'start'],        engineAction: 'enterInsert',         engineArgs: { position: 'lineStart' } },
  { id: 'insert-line-end',  keys: 'A',          description: 'Enter insert mode at end of line',          category: 'editing',  tags: ['insert', 'line', 'end'],          engineAction: 'enterInsert',         engineArgs: { position: 'lineEnd' } },
  { id: 'delete-char',      keys: 'x',          description: 'Delete character under cursor',             category: 'editing',  tags: ['delete', 'char', 'cut'],          engineAction: 'deleteChar',          engineArgs: {} },
  { id: 'delete-line',      keys: 'dd',         description: 'Delete (cut) current line',                 category: 'editing',  tags: ['delete', 'line', 'cut'],          engineAction: 'deleteLine',          engineArgs: {} },
  { id: 'yank-line',        keys: 'yy',         description: 'Yank (copy) current line',                  category: 'editing',  tags: ['copy', 'line', 'yank'],           engineAction: 'yankLine',            engineArgs: {} },
  { id: 'paste-after',      keys: 'p',          description: 'Paste after cursor',                        category: 'editing',  tags: ['paste', 'put', 'after'],          engineAction: 'paste',               engineArgs: { after: true } },
  { id: 'paste-before',     keys: 'P',          description: 'Paste before cursor',                       category: 'editing',  tags: ['paste', 'put', 'before'],         engineAction: 'paste',               engineArgs: { after: false } },
  { id: 'change-inner-word', keys: 'ciw',       description: 'Change inner word',                         category: 'editing',  tags: ['change', 'word', 'replace'],      engineAction: 'changeInnerWord',     engineArgs: {} },
  { id: 'delete-inner-word', keys: 'diw',       description: 'Delete inner word',                         category: 'editing',  tags: ['delete', 'word', 'cut'],          engineAction: 'deleteInnerWord',     engineArgs: {} },
  { id: 'undo',             keys: 'u',          description: 'Undo last change',                          category: 'editing',  tags: ['undo', 'revert'],                 engineAction: 'undo',                engineArgs: {} },
  { id: 'redo',             keys: '<C-r>',      description: 'Redo last undone change',                   category: 'editing',  tags: ['redo', 'repeat'],                 engineAction: 'redo',                engineArgs: {} },
  { id: 'indent',           keys: '>>',         description: 'Indent current line',                       category: 'editing',  tags: ['indent', 'shift', 'right'],       engineAction: 'indentLine',          engineArgs: {} },
  { id: 'outdent',          keys: '<<',         description: 'Outdent current line',                      category: 'editing',  tags: ['outdent', 'shift', 'left'],       engineAction: 'outdentLine',         engineArgs: {} },

  // ── Visual ─────────────────────────────────────────────────
  { id: 'visual-char',      keys: 'v',          description: 'Enter visual mode (character-wise)',        category: 'visual',   tags: ['visual', 'select', 'char'],        engineAction: 'enterVisual',         engineArgs: { type: 'char' } },
  { id: 'visual-line',      keys: 'V',          description: 'Enter visual mode (line-wise)',             category: 'visual',   tags: ['visual', 'select', 'line'],        engineAction: 'enterVisual',         engineArgs: { type: 'line' } },
  { id: 'visual-block',     keys: '<C-v>',      description: 'Enter visual block mode',                   category: 'visual',   tags: ['visual', 'select', 'block'],       engineAction: 'enterVisual',         engineArgs: { type: 'block' } },
  { id: 'visual-indent',    keys: '>',          description: 'Indent visual selection',                   category: 'visual',   tags: ['indent', 'visual', 'shift'],       engineAction: 'indentSelection',     engineArgs: {} },
  { id: 'visual-outdent',   keys: '<',          description: 'Outdent visual selection',                  category: 'visual',   tags: ['outdent', 'visual', 'shift'],      engineAction: 'outdentSelection',    engineArgs: {} },

  // ── Window ─────────────────────────────────────────────────
  { id: 'window-split-v',   keys: '<leader>wv',  description: 'Split window vertically',                 category: 'window',   tags: ['split', 'vertical', 'pane'],       engineAction: 'noop', engineArgs: {} },
  { id: 'window-split-h',   keys: '<leader>ws',  description: 'Split window horizontally',                category: 'window',   tags: ['split', 'horizontal', 'pane'],     engineAction: 'noop', engineArgs: {} },
  { id: 'window-close',     keys: '<leader>wd',  description: 'Close current window',                     category: 'window',   tags: ['close', 'delete', 'pane'],         engineAction: 'noop', engineArgs: {} },
  { id: 'window-left',      keys: '<C-w>h',      description: 'Move to window on the left',               category: 'window',   tags: ['focus', 'left', 'pane'],           engineAction: 'noop', engineArgs: {} },
  { id: 'window-down',      keys: '<C-w>j',      description: 'Move to window below',                     category: 'window',   tags: ['focus', 'down', 'pane'],           engineAction: 'noop', engineArgs: {} },
  { id: 'window-up',        keys: '<C-w>k',      description: 'Move to window above',                     category: 'window',   tags: ['focus', 'up', 'pane'],             engineAction: 'noop', engineArgs: {} },
  { id: 'window-right',     keys: '<C-w>l',      description: 'Move to window on the right',              category: 'window',   tags: ['focus', 'right', 'pane'],          engineAction: 'noop', engineArgs: {} },
  { id: 'window-equal',     keys: '<leader>we',  description: 'Equalize window sizes',                    category: 'window',   tags: ['equal', 'size', 'layout'],         engineAction: 'noop', engineArgs: {} },

  // ── Search ─────────────────────────────────────────────────
  { id: 'search-forward',   keys: '/',          description: 'Search forward in file',                    category: 'search',   tags: ['search', 'find', 'forward'],       engineAction: 'noop', engineArgs: {} },
  { id: 'search-backward',  keys: '?',          description: 'Search backward in file',                   category: 'search',   tags: ['search', 'find', 'backward'],      engineAction: 'noop', engineArgs: {} },
  { id: 'search-next',      keys: 'n',          description: 'Go to next search match',                   category: 'search',   tags: ['next', 'match', 'repeat'],         engineAction: 'noop', engineArgs: {} },
  { id: 'search-prev',      keys: 'N',          description: 'Go to previous search match',               category: 'search',   tags: ['prev', 'match', 'repeat'],         engineAction: 'noop', engineArgs: {} },
  { id: 'search-word',      keys: '*',          description: 'Search forward for word under cursor',      category: 'search',   tags: ['word', 'cursor', 'forward'],       engineAction: 'noop', engineArgs: {} },
  { id: 'search-word-back', keys: '#',          description: 'Search backward for word under cursor',     category: 'search',   tags: ['word', 'cursor', 'backward'],      engineAction: 'noop', engineArgs: {} },

  // ── Telescope ──────────────────────────────────────────────
  { id: 'telescope-files',  keys: '<leader>ff',  description: 'Find files (Telescope)',                   category: 'telescope', tags: ['find', 'files', 'fuzzy'],          engineAction: 'noop', engineArgs: {} },
  { id: 'telescope-grep',   keys: '<leader>fg',  description: 'Live grep (Telescope)',                    category: 'telescope', tags: ['grep', 'search', 'project'],       engineAction: 'noop', engineArgs: {} },
  { id: 'telescope-buffers', keys: '<leader>fb', description: 'List open buffers (Telescope)',            category: 'telescope', tags: ['buffers', 'list', 'open'],          engineAction: 'noop', engineArgs: {} },
  { id: 'telescope-help',   keys: '<leader>fh',  description: 'Find help tags (Telescope)',               category: 'telescope', tags: ['help', 'tags', 'docs'],             engineAction: 'noop', engineArgs: {} },
  { id: 'telescope-resume', keys: '<leader>fr',  description: 'Resume last Telescope picker',             category: 'telescope', tags: ['resume', 'last', 'picker'],         engineAction: 'noop', engineArgs: {} },

  // ── LSP ────────────────────────────────────────────────────
  { id: 'lsp-hover',        keys: 'K',          description: 'Show hover documentation (LSP)',            category: 'lsp',  tags: ['hover', 'docs', 'info'],             engineAction: 'noop', engineArgs: {} },
  { id: 'lsp-definition',   keys: 'gd',         description: 'Go to definition (LSP)',                    category: 'lsp',  tags: ['definition', 'goto', 'jump'],        engineAction: 'noop', engineArgs: {} },
  { id: 'lsp-references',   keys: 'gr',         description: 'Go to references (LSP)',                    category: 'lsp',  tags: ['references', 'goto', 'usages'],      engineAction: 'noop', engineArgs: {} },
  { id: 'lsp-next-diag',    keys: ']d',         description: 'Go to next diagnostic (LSP)',               category: 'lsp',  tags: ['diagnostic', 'next', 'error'],       engineAction: 'noop', engineArgs: {} },
  { id: 'lsp-prev-diag',    keys: '[d',         description: 'Go to previous diagnostic (LSP)',           category: 'lsp',  tags: ['diagnostic', 'prev', 'error'],       engineAction: 'noop', engineArgs: {} },
  { id: 'lsp-code-action',  keys: '<leader>ca', description: 'Show code actions (LSP)',                   category: 'lsp',  tags: ['code', 'action', 'fix'],             engineAction: 'noop', engineArgs: {} },
  { id: 'lsp-rename',       keys: '<leader>rn', description: 'Rename symbol (LSP)',                       category: 'lsp',  tags: ['rename', 'symbol', 'refactor'],      engineAction: 'noop', engineArgs: {} },

  // ── Git ────────────────────────────────────────────────────
  { id: 'git-lazygit',      keys: '<leader>gg', description: 'Open Lazygit',                              category: 'git',   tags: ['lazygit', 'ui', 'status'],          engineAction: 'noop', engineArgs: {} },
  { id: 'git-blame',        keys: '<leader>gb', description: 'Git blame current line',                    category: 'git',   tags: ['blame', 'line', 'author'],           engineAction: 'noop', engineArgs: {} },
  { id: 'git-hunk-preview', keys: '<leader>gh', description: 'Preview git hunk',                          category: 'git',   tags: ['hunk', 'diff', 'preview'],           engineAction: 'noop', engineArgs: {} },
  { id: 'git-next-hunk',    keys: ']h',         description: 'Go to next git hunk',                       category: 'git',   tags: ['hunk', 'next', 'change'],            engineAction: 'noop', engineArgs: {} },
  { id: 'git-prev-hunk',    keys: '[h',         description: 'Go to previous git hunk',                   category: 'git',   tags: ['hunk', 'prev', 'change'],            engineAction: 'noop', engineArgs: {} },

  // ── UI ─────────────────────────────────────────────────────
  { id: 'ui-explorer',      keys: '<leader>e',  description: 'Toggle file explorer',                      category: 'ui',     tags: ['explorer', 'toggle', 'files'],       engineAction: 'noop', engineArgs: {} },
  { id: 'ui-theme',         keys: '<leader>th', description: 'Change color theme',                        category: 'ui',     tags: ['theme', 'color', 'style'],           engineAction: 'noop', engineArgs: {} },
  { id: 'ui-bufdelete',     keys: '<leader>bd', description: 'Delete current buffer',                     category: 'ui',     tags: ['buffer', 'delete', 'close'],         engineAction: 'noop', engineArgs: {} },
  { id: 'ui-lazygit-toggle', keys: '<leader>gg', description: 'Toggle Lazygit UI',                        category: 'ui',     tags: ['lazygit', 'toggle', 'git'],          engineAction: 'noop', engineArgs: {} },
];

/**
 * Filter keymaps by search query (matches id, keys, description, tags).
 * Empty query returns all keymaps.
 */
export function filterKeymaps(keymaps, query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return keymaps;
  return keymaps.filter((km) => {
    return (
      km.id.toLowerCase().includes(q) ||
      km.keys.toLowerCase().includes(q) ||
      km.description.toLowerCase().includes(q) ||
      km.tags.some((t) => t.toLowerCase().includes(q))
    );
  });
}

/**
 * Filter keymaps by category.
 */
export function filterKeymapsByCategory(keymaps, category) {
  if (!category) return keymaps;
  return keymaps.filter((km) => km.category === category);
}

/**
 * Get a random keymap from the list, optionally filtered by categories.
 */
export function getRandomKeymap(keymaps, categories) {
  let pool = keymaps;
  if (categories && categories.length > 0) {
    pool = keymaps.filter((km) => categories.includes(km.category));
  }
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}
```

- [ ] **Step 2: Commit**

```bash
git add utils/lazyvim-keymaps.js
git commit -m "feat: add LazyVim keymap data file with ~67 initial entries"
```

---

### Task 2: Create the virtual editor engine

**Files:**
- Create: `utils/lazyvim-engine.js`

- [ ] **Step 1: Write the engine class**

```js
/**
 * LazyVimEngine — a virtual editor buffer that simulates Vim keybindings.
 *
 * Usage:
 *   const engine = new LazyVimEngine(['line 1', 'line 2', 'line 3']);
 *   engine.registerKeymaps(keymaps);
 *   const result = engine.handleKey('j');
 *   // result = { type: 'action', description: 'Move cursor down', buffer: [...], cursor: {...}, mode: 'normal', actionLog: [...] }
 */

const INITIAL_BUFFER = [
  'Welcome to LazyVim Learn!',
  '',
  'Try these keys:',
  '  h/j/k/l  — move cursor',
  '  i        — enter insert mode',
  '  dd       — delete a line',
  '  yy / p   — copy and paste',
  '  u        — undo',
  '  ciw      — change inner word',
  '',
  'Press <Esc> to return to normal mode.',
];

export class LazyVimEngine {
  constructor(initialBuffer) {
    this.buffer = Array.isArray(initialBuffer) && initialBuffer.length > 0
      ? initialBuffer.map((l) => String(l))
      : INITIAL_BUFFER.map((l) => l);
    this.cursor = { row: 0, col: 0 };
    this.mode = 'normal'; // 'normal' | 'insert' | 'visual'
    this.visualType = null; // 'char' | 'line' | 'block'
    this.visualAnchor = null; // { row, col } — start of visual selection
    this.keyBuffer = [];
    this.keyBufferTimer = null;
    this.keymapMap = new Map();   // key sequence → keymap entry
    this.keyPrefixes = new Set(); // partial key sequences
    this.actionLog = [];
    this.yankRegister = '';      // yanked text
    this.undoStack = [];
    this.clipboard = '';         // for insert mode text
    this.insertCol = 0;          // column where insert mode was entered
  }

  /**
   * Register keymap entries so the engine can resolve key sequences.
   */
  registerKeymaps(keymaps) {
    this.keymapMap.clear();
    this.keyPrefixes.clear();
    for (const km of keymaps) {
      if (!km.keys || !km.engineAction) continue;
      this.keymapMap.set(km.keys, km);
      // Build prefix set: "ciw" → prefixes "c", "ci"
      for (let i = 1; i < km.keys.length; i++) {
        this.keyPrefixes.add(km.keys.slice(0, i));
      }
    }
  }

  /**
   * Handle a single key press. Returns a result object.
   */
  handleKey(key) {
    // In insert mode, keys are typed into the buffer
    if (this.mode === 'insert') {
      return this.handleInsertKey(key);
    }

    // In visual mode, movement keys extend selection
    if (this.mode === 'visual') {
      return this.handleVisualKey(key);
    }

    // Normal mode: accumulate key sequence
    this.keyBuffer.push(key);
    const sequence = this.keyBuffer.join('');

    // Exact match
    if (this.keymapMap.has(sequence)) {
      const keymap = this.keymapMap.get(sequence);
      this.keyBuffer = [];
      if (this.keyBufferTimer) {
        clearTimeout(this.keyBufferTimer);
        this.keyBufferTimer = null;
      }
      return this.executeAction(keymap);
    }

    // Partial match — wait for more keys
    if (this.keyPrefixes.has(sequence)) {
      return { type: 'waiting', sequence };
    }

    // No match — clear buffer
    this.keyBuffer = [];
    if (this.keyBufferTimer) {
      clearTimeout(this.keyBufferTimer);
      this.keyBufferTimer = null;
    }
    return { type: 'no-mapping', keys: sequence };
  }

  // ── Insert Mode ──────────────────────────────────────────

  handleInsertKey(key) {
    if (key === 'Escape') {
      this.mode = 'normal';
      // Move cursor left one position (like real Vim)
      if (this.cursor.col > 0) {
        this.cursor.col -= 1;
      }
      return this.makeResult('escapeNormal', 'Return to normal mode');
    }
    if (key === 'Enter') {
      return this.insertNewline();
    }
    if (key === 'Backspace') {
      return this.insertBackspace();
    }
    if (key === 'Tab') {
      return this.insertText('  ');
    }
    // Printable character
    if (key.length === 1) {
      return this.insertText(key);
    }
    return this.makeResult('noop', `Insert mode: ignored ${key}`);
  }

  insertText(char) {
    this.saveUndo();
    const line = this.buffer[this.cursor.row];
    this.buffer[this.cursor.row] = line.slice(0, this.cursor.col) + char + line.slice(this.cursor.col);
    this.cursor.col += 1;
    return this.makeResult('insertText', `Inserted "${char}"`);
  }

  insertNewline() {
    this.saveUndo();
    const line = this.buffer[this.cursor.row];
    const before = line.slice(0, this.cursor.col);
    const after = line.slice(this.cursor.col);
    this.buffer[this.cursor.row] = before;
    this.buffer.splice(this.cursor.row + 1, 0, after);
    this.cursor.row += 1;
    this.cursor.col = 0;
    return this.makeResult('insertNewline', 'Inserted newline');
  }

  insertBackspace() {
    this.saveUndo();
    if (this.cursor.col > 0) {
      const line = this.buffer[this.cursor.row];
      this.buffer[this.cursor.row] = line.slice(0, this.cursor.col - 1) + line.slice(this.cursor.col);
      this.cursor.col -= 1;
      return this.makeResult('insertBackspace', 'Deleted character');
    }
    if (this.cursor.row > 0) {
      // Join with previous line
      const prevLen = this.buffer[this.cursor.row - 1].length;
      this.buffer[this.cursor.row - 1] += this.buffer[this.cursor.row];
      this.buffer.splice(this.cursor.row, 1);
      this.cursor.row -= 1;
      this.cursor.col = prevLen;
      return this.makeResult('insertBackspace', 'Joined lines');
    }
    return this.makeResult('noop', 'Nothing to delete');
  }

  // ── Visual Mode ──────────────────────────────────────────

  handleVisualKey(key) {
    if (key === 'Escape') {
      this.mode = 'normal';
      this.visualType = null;
      this.visualAnchor = null;
      return this.makeResult('escapeNormal', 'Return to normal mode');
    }
    // Movement keys extend selection
    const movementMap = {
      h: { action: 'moveCursor', args: { direction: 'left' } },
      j: { action: 'moveCursor', args: { direction: 'down' } },
      k: { action: 'moveCursor', args: { direction: 'up' } },
      l: { action: 'moveCursor', args: { direction: 'right' } },
      w: { action: 'moveWord', args: { direction: 'forward' } },
      b: { action: 'moveWord', args: { direction: 'backward' } },
      '$': { action: 'moveToLineEnd', args: {} },
      '0': { action: 'moveToLineStart', args: {} },
      'G': { action: 'moveToFileEnd', args: {} },
      'gg': { action: 'moveToFileStart', args: {} },
    };
    const mapping = movementMap[key];
    if (mapping) {
      return this[mapping.action](mapping.args);
    }
    // Fall through to keymapMap for non-movement keys (e.g., >, < in visual mode)
    if (this.keymapMap.has(key)) {
      return this.executeAction(this.keymapMap.get(key));
    }
    return this.makeResult('noop', `Visual mode: no mapping for "${key}"`);
  }

  // ── Action Execution ─────────────────────────────────────

  executeAction(keymap) {
    if (keymap.engineAction === 'noop') {
      return this.makeResult('noop', keymap.description);
    }
    const method = this[keymap.engineAction];
    if (typeof method !== 'function') {
      return this.makeResult('noop', `Unknown action: ${keymap.engineAction}`);
    }
    return method.call(this, keymap.engineArgs || {});
  }

  makeResult(action, description) {
    this.actionLog.push({
      action,
      description,
      keys: this.keyBuffer.length > 0 ? this.keyBuffer.join('') : '',
      timestamp: Date.now(),
    });
    // Keep only last 50 log entries
    if (this.actionLog.length > 50) {
      this.actionLog = this.actionLog.slice(-50);
    }
    return {
      type: 'action',
      action,
      description,
      buffer: [...this.buffer],
      cursor: { ...this.cursor },
      mode: this.mode,
      visualType: this.visualType,
      visualAnchor: this.visualAnchor ? { ...this.visualAnchor } : null,
      actionLog: [...this.actionLog],
    };
  }

  // ── Undo Stack ───────────────────────────────────────────

  saveUndo() {
    this.undoStack.push({
      buffer: [...this.buffer],
      cursor: { ...this.cursor },
      mode: this.mode,
    });
    // Keep only last 100 undo entries
    if (this.undoStack.length > 100) {
      this.undoStack.shift();
    }
  }

  // ── Movement Actions ─────────────────────────────────────

  moveCursor({ direction = 'down', count = 1 } = {}) {
    for (let i = 0; i < count; i++) {
      switch (direction) {
        case 'left':
          if (this.cursor.col > 0) {
            this.cursor.col -= 1;
          } else if (this.cursor.row > 0) {
            this.cursor.row -= 1;
            this.cursor.col = this.buffer[this.cursor.row].length;
          }
          break;
        case 'right':
          if (this.cursor.col < this.buffer[this.cursor.row].length) {
            this.cursor.col += 1;
          } else if (this.cursor.row < this.buffer.length - 1) {
            this.cursor.row += 1;
            this.cursor.col = 0;
          }
          break;
        case 'up':
          if (this.cursor.row > 0) {
            this.cursor.row -= 1;
            this.cursor.col = Math.min(this.cursor.col, this.buffer[this.cursor.row].length);
          }
          break;
        case 'down':
          if (this.cursor.row < this.buffer.length - 1) {
            this.cursor.row += 1;
            this.cursor.col = Math.min(this.cursor.col, this.buffer[this.cursor.row].length);
          }
          break;
      }
    }
    return this.makeResult('moveCursor', `Moved cursor ${direction}`);
  }

  moveWord({ direction = 'forward' } = {}) {
    if (direction === 'forward') {
      const line = this.buffer[this.cursor.row];
      let col = this.cursor.col;
      // Skip current word characters
      while (col < line.length && /\w/.test(line[col])) col++;
      // Skip whitespace
      while (col < line.length && /\s/.test(line[col])) col++;
      this.cursor.col = Math.min(col, line.length);
    } else {
      const line = this.buffer[this.cursor.row];
      let col = this.cursor.col - 1;
      // Skip whitespace going left
      while (col >= 0 && /\s/.test(line[col])) col--;
      // Skip to start of word
      while (col >= 0 && /\w/.test(line[col])) col--;
      this.cursor.col = Math.max(0, col + 1);
    }
    return this.makeResult('moveWord', `Moved to ${direction} word`);
  }

  moveWordEnd() {
    const line = this.buffer[this.cursor.row];
    let col = this.cursor.col;
    // Skip current word
    while (col < line.length && /\w/.test(line[col])) col++;
    // Move back one to land on last char of current word, or skip whitespace and find next word end
    if (col > this.cursor.col && col < line.length && /\s/.test(line[col])) {
      this.cursor.col = col - 1;
    } else {
      // Skip whitespace
      while (col < line.length && /\s/.test(line[col])) col++;
      // Find end of next word
      while (col < line.length && /\w/.test(line[col])) col++;
      this.cursor.col = Math.min(col - 1, Math.max(0, line.length - 1));
    }
    return this.makeResult('moveWordEnd', 'Moved to word end');
  }

  moveToLineStart() {
    this.cursor.col = 0;
    return this.makeResult('moveToLineStart', 'Moved to line start');
  }

  moveToLineEnd() {
    this.cursor.col = this.buffer[this.cursor.row].length;
    return this.makeResult('moveToLineEnd', 'Moved to line end');
  }

  moveToFileStart() {
    this.cursor.row = 0;
    this.cursor.col = 0;
    return this.makeResult('moveToFileStart', 'Moved to file start');
  }

  moveToFileEnd() {
    this.cursor.row = this.buffer.length - 1;
    this.cursor.col = this.buffer[this.cursor.row].length;
    return this.makeResult('moveToFileEnd', 'Moved to file end');
  }

  moveParagraph({ direction = 'forward' } = {}) {
    if (direction === 'forward') {
      for (let r = this.cursor.row + 1; r < this.buffer.length; r++) {
        if (this.buffer[r].trim() === '') {
          this.cursor.row = Math.min(r + 1, this.buffer.length - 1);
          this.cursor.col = 0;
          break;
        }
      }
    } else {
      for (let r = this.cursor.row - 1; r >= 0; r--) {
        if (this.buffer[r].trim() === '') {
          this.cursor.row = Math.max(r - 1, 0);
          this.cursor.col = 0;
          break;
        }
      }
    }
    return this.makeResult('moveParagraph', `Moved to ${direction} paragraph`);
  }

  scrollHalfPage({ direction = 'down' } = {}) {
    const half = Math.max(1, Math.floor(this.buffer.length / 2));
    if (direction === 'down') {
      this.cursor.row = Math.min(this.cursor.row + half, this.buffer.length - 1);
    } else {
      this.cursor.row = Math.max(this.cursor.row - half, 0);
    }
    this.cursor.col = Math.min(this.cursor.col, this.buffer[this.cursor.row].length);
    return this.makeResult('scrollHalfPage', `Scrolled ${direction}`);
  }

  jumpToMatch() {
    const line = this.buffer[this.cursor.row];
    const pairs = { '(': ')', ')': '(', '[': ']', ']': '[', '{': '}', '}': '{' };
    const ch = line[this.cursor.col];
    const match = pairs[ch];
    if (!match) {
      return this.makeResult('noop', 'No matching bracket under cursor');
    }
    const isOpen = '([{'.includes(ch);
    const search = isOpen ? match : ch;
    const target = isOpen ? ch : match;
    if (isOpen) {
      let depth = 0;
      for (let c = this.cursor.col; c < line.length; c++) {
        if (line[c] === target) depth++;
        else if (line[c] === search) depth--;
        if (depth === 0) {
          this.cursor.col = c;
          return this.makeResult('jumpToMatch', `Jumped to matching ${search}`);
        }
      }
    } else {
      let depth = 0;
      for (let c = this.cursor.col; c >= 0; c--) {
        if (line[c] === target) depth++;
        else if (line[c] === search) depth--;
        if (depth === 0) {
          this.cursor.col = c;
          return this.makeResult('jumpToMatch', `Jumped to matching ${search}`);
        }
      }
    }
    return this.makeResult('noop', 'No matching bracket found');
  }

  // ── Editing Actions ──────────────────────────────────────

  enterInsert({ position = 'cursor' } = {}) {
    this.saveUndo();
    this.mode = 'insert';
    this.insertCol = this.cursor.col;
    switch (position) {
      case 'after':
        if (this.cursor.col < this.buffer[this.cursor.row].length) {
          this.cursor.col += 1;
        }
        break;
      case 'lineStart':
        this.cursor.col = 0;
        break;
      case 'lineEnd':
        this.cursor.col = this.buffer[this.cursor.row].length;
        break;
      // 'cursor' — stay at current position
    }
    return this.makeResult('enterInsert', 'Entered insert mode');
  }

  openLineBelow() {
    this.saveUndo();
    this.buffer.splice(this.cursor.row + 1, 0, '');
    this.cursor.row += 1;
    this.cursor.col = 0;
    this.mode = 'insert';
    return this.makeResult('openLineBelow', 'Opened line below');
  }

  openLineAbove() {
    this.saveUndo();
    this.buffer.splice(this.cursor.row, 0, '');
    this.cursor.col = 0;
    this.mode = 'insert';
    return this.makeResult('openLineAbove', 'Opened line above');
  }

  deleteChar() {
    this.saveUndo();
    const line = this.buffer[this.cursor.row];
    if (this.cursor.col < line.length) {
      this.buffer[this.cursor.row] = line.slice(0, this.cursor.col) + line.slice(this.cursor.col + 1);
      return this.makeResult('deleteChar', 'Deleted character');
    }
    // Join with next line
    if (this.cursor.row < this.buffer.length - 1) {
      this.buffer[this.cursor.row] += this.buffer[this.cursor.row + 1];
      this.buffer.splice(this.cursor.row + 1, 1);
      return this.makeResult('deleteChar', 'Joined lines');
    }
    return this.makeResult('noop', 'Nothing to delete');
  }

  deleteLine() {
    this.saveUndo();
    this.yankRegister = this.buffer[this.cursor.row];
    if (this.buffer.length === 1) {
      this.buffer[0] = '';
      this.cursor.col = 0;
    } else {
      this.buffer.splice(this.cursor.row, 1);
      if (this.cursor.row >= this.buffer.length) {
        this.cursor.row = this.buffer.length - 1;
      }
    }
    this.cursor.col = Math.min(this.cursor.col, this.buffer[this.cursor.row].length);
    return this.makeResult('deleteLine', 'Deleted line');
  }

  yankLine() {
    this.yankRegister = this.buffer[this.cursor.row];
    return this.makeResult('yankLine', 'Yanked line');
  }

  paste({ after = true } = {}) {
    if (!this.yankRegister) {
      return this.makeResult('noop', 'Nothing to paste (yank register is empty)');
    }
    this.saveUndo();
    const insertRow = after ? this.cursor.row + 1 : this.cursor.row;
    this.buffer.splice(insertRow, 0, this.yankRegister);
    this.cursor.row = insertRow;
    this.cursor.col = 0;
    return this.makeResult('paste', 'Pasted line');
  }

  getWordBounds(row, col) {
    const line = this.buffer[row];
    if (!line || col >= line.length) return { start: col, end: col };
    const isWord = /\w/.test(line[col]);
    let start = col;
    let end = col;
    if (isWord) {
      while (start > 0 && /\w/.test(line[start - 1])) start--;
      while (end < line.length && /\w/.test(line[end])) end++;
    } else {
      // Non-word character — delete just that char
      end = col + 1;
    }
    return { start, end };
  }

  changeInnerWord() {
    this.saveUndo();
    const { start, end } = this.getWordBounds(this.cursor.row, this.cursor.col);
    this.buffer[this.cursor.row] = this.buffer[this.cursor.row].slice(0, start) + this.buffer[this.cursor.row].slice(end);
    this.cursor.col = start;
    this.mode = 'insert';
    return this.makeResult('changeInnerWord', 'Changed inner word');
  }

  deleteInnerWord() {
    this.saveUndo();
    const { start, end } = this.getWordBounds(this.cursor.row, this.cursor.col);
    this.buffer[this.cursor.row] = this.buffer[this.cursor.row].slice(0, start) + this.buffer[this.cursor.row].slice(end);
    this.cursor.col = start;
    if (this.cursor.col >= this.buffer[this.cursor.row].length) {
      this.cursor.col = Math.max(0, this.buffer[this.cursor.row].length);
    }
    return this.makeResult('deleteInnerWord', 'Deleted inner word');
  }

  undo() {
    if (this.undoStack.length === 0) {
      return this.makeResult('noop', 'Nothing to undo');
    }
    const state = this.undoStack.pop();
    this.buffer = state.buffer;
    this.cursor = state.cursor;
    this.mode = state.mode;
    return this.makeResult('undo', 'Undid last change');
  }

  redo() {
    // Simplified: redo is not implemented in v1 (undo stack is linear)
    return this.makeResult('noop', 'Redo not available in sandbox');
  }

  indentLine() {
    this.saveUndo();
    this.buffer[this.cursor.row] = '  ' + this.buffer[this.cursor.row];
    this.cursor.col += 2;
    return this.makeResult('indentLine', 'Indented line');
  }

  outdentLine() {
    this.saveUndo();
    const line = this.buffer[this.cursor.row];
    if (line.startsWith('  ')) {
      this.buffer[this.cursor.row] = line.slice(2);
      this.cursor.col = Math.max(0, this.cursor.col - 2);
    } else if (line.startsWith(' ')) {
      this.buffer[this.cursor.row] = line.slice(1);
      this.cursor.col = Math.max(0, this.cursor.col - 1);
    }
    return this.makeResult('outdentLine', 'Outdented line');
  }

  // ── Visual Mode Actions ──────────────────────────────────

  enterVisual({ type = 'char' } = {}) {
    this.mode = 'visual';
    this.visualType = type;
    this.visualAnchor = { ...this.cursor };
    return this.makeResult('enterVisual', `Entered visual ${type} mode`);
  }

  indentSelection() {
    this.saveUndo();
    const range = this.getVisualRange();
    for (let r = range.start; r <= range.end; r++) {
      this.buffer[r] = '  ' + this.buffer[r];
    }
    this.mode = 'normal';
    this.visualType = null;
    this.visualAnchor = null;
    return this.makeResult('indentSelection', 'Indented selection');
  }

  outdentSelection() {
    this.saveUndo();
    const range = this.getVisualRange();
    for (let r = range.start; r <= range.end; r++) {
      if (this.buffer[r].startsWith('  ')) {
        this.buffer[r] = this.buffer[r].slice(2);
      } else if (this.buffer[r].startsWith(' ')) {
        this.buffer[r] = this.buffer[r].slice(1);
      }
    }
    this.mode = 'normal';
    this.visualType = null;
    this.visualAnchor = null;
    return this.makeResult('outdentSelection', 'Outdented selection');
  }

  getVisualRange() {
    if (!this.visualAnchor) return { start: this.cursor.row, end: this.cursor.row };
    return {
      start: Math.min(this.visualAnchor.row, this.cursor.row),
      end: Math.max(this.visualAnchor.row, this.cursor.row),
    };
  }

  // ── Utility ──────────────────────────────────────────────

  /** Reset engine to initial state with given buffer. */
  reset(buffer) {
    this.buffer = (buffer && buffer.length > 0)
      ? buffer.map((l) => String(l))
      : INITIAL_BUFFER.map((l) => l);
    this.cursor = { row: 0, col: 0 };
    this.mode = 'normal';
    this.visualType = null;
    this.visualAnchor = null;
    this.keyBuffer = [];
    this.actionLog = [];
    this.yankRegister = '';
    this.undoStack = [];
    this.insertCol = 0;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add utils/lazyvim-engine.js
git commit -m "feat: add LazyVimEngine virtual editor buffer"
```

---

### Task 3: Write engine unit tests

**Files:**
- Create: `__tests__/utils/lazyvim-engine.test.js`

- [ ] **Step 1: Write the test file**

```js
import { LazyVimEngine } from '../../utils/lazyvim-engine';
import { keymaps } from '../../utils/lazyvim-keymaps';

function makeEngine(buffer) {
  const engine = new LazyVimEngine(buffer);
  engine.registerKeymaps(keymaps);
  return engine;
}

describe('LazyVimEngine — constructor', () => {
  test('initializes with default buffer when no argument given', () => {
    const engine = new LazyVimEngine();
    expect(engine.buffer.length).toBeGreaterThan(0);
    expect(engine.cursor).toEqual({ row: 0, col: 0 });
    expect(engine.mode).toBe('normal');
  });

  test('initializes with custom buffer', () => {
    const engine = new LazyVimEngine(['hello', 'world']);
    expect(engine.buffer).toEqual(['hello', 'world']);
  });

  test('falls back to default buffer when given empty array', () => {
    const engine = new LazyVimEngine([]);
    expect(engine.buffer.length).toBeGreaterThan(0);
  });
});

describe('LazyVimEngine — registerKeymaps', () => {
  test('registers keymaps and builds prefix set', () => {
    const engine = new LazyVimEngine();
    engine.registerKeymaps(keymaps);
    expect(engine.keymapMap.has('j')).toBe(true);
    expect(engine.keymapMap.has('dd')).toBe(true);
    expect(engine.keymapMap.has('ciw')).toBe(true);
    // Prefixes
    expect(engine.keyPrefixes.has('c')).toBe(true);
    expect(engine.keyPrefixes.has('ci')).toBe(true);
    expect(engine.keyPrefixes.has('d')).toBe(true);
  });
});

describe('LazyVimEngine — movement', () => {
  test('j moves cursor down', () => {
    const engine = makeEngine(['line 1', 'line 2', 'line 3']);
    const result = engine.handleKey('j');
    expect(result.type).toBe('action');
    expect(result.cursor.row).toBe(1);
    expect(result.cursor.col).toBe(0);
  });

  test('k moves cursor up', () => {
    const engine = makeEngine(['line 1', 'line 2', 'line 3']);
    engine.handleKey('j');
    const result = engine.handleKey('k');
    expect(result.cursor.row).toBe(0);
  });

  test('h moves cursor left', () => {
    const engine = makeEngine(['hello']);
    engine.cursor.col = 2;
    const result = engine.handleKey('h');
    expect(result.cursor.col).toBe(1);
  });

  test('l moves cursor right', () => {
    const engine = makeEngine(['hello']);
    const result = engine.handleKey('l');
    expect(result.cursor.col).toBe(1);
  });

  test('h at col 0 does not go negative', () => {
    const engine = makeEngine(['hello']);
    engine.cursor.col = 0;
    const result = engine.handleKey('h');
    expect(result.cursor.col).toBe(0);
  });

  test('l at end of line does not go past length', () => {
    const engine = makeEngine(['hi']);
    engine.cursor.col = 2;
    const result = engine.handleKey('l');
    expect(result.cursor.col).toBe(2);
  });

  test('k at row 0 does not go negative', () => {
    const engine = makeEngine(['line 1', 'line 2']);
    const result = engine.handleKey('k');
    expect(result.cursor.row).toBe(0);
  });

  test('j at last row does not go past end', () => {
    const engine = makeEngine(['line 1', 'line 2']);
    engine.cursor.row = 1;
    const result = engine.handleKey('j');
    expect(result.cursor.row).toBe(1);
  });

  test('w moves to next word', () => {
    const engine = makeEngine(['hello world foo']);
    engine.cursor.col = 0;
    const result = engine.handleKey('w');
    expect(result.cursor.col).toBe(6);
  });

  test('b moves to previous word', () => {
    const engine = makeEngine(['hello world']);
    engine.cursor.col = 7;
    const result = engine.handleKey('b');
    expect(result.cursor.col).toBe(6);
  });

  test('e moves to word end', () => {
    const engine = makeEngine(['hello world']);
    engine.cursor.col = 0;
    const result = engine.handleKey('e');
    expect(result.cursor.col).toBe(4);
  });

  test('0 moves to line start', () => {
    const engine = makeEngine(['hello']);
    engine.cursor.col = 3;
    const result = engine.handleKey('0');
    expect(result.cursor.col).toBe(0);
  });

  test('$ moves to line end', () => {
    const engine = makeEngine(['hello world']);
    const result = engine.handleKey('$');
    expect(result.cursor.col).toBe(11);
  });

  test('gg moves to file start', () => {
    const engine = makeEngine(['a', 'b', 'c']);
    engine.cursor.row = 2;
    const result = engine.handleKey('gg');
    expect(result.cursor.row).toBe(0);
    expect(result.cursor.col).toBe(0);
  });

  test('G moves to file end', () => {
    const engine = makeEngine(['a', 'b', 'c']);
    const result = engine.handleKey('G');
    expect(result.cursor.row).toBe(2);
  });

  test('} moves to next paragraph', () => {
    const engine = makeEngine(['line 1', 'line 2', '', 'line 3']);
    const result = engine.handleKey('}');
    expect(result.cursor.row).toBe(3);
  });

  test('{ moves to previous paragraph', () => {
    const engine = makeEngine(['line 1', '', 'line 2', 'line 3']);
    engine.cursor.row = 3;
    const result = engine.handleKey('{');
    expect(result.cursor.row).toBe(0);
  });

  test('j moves cursor and clamps column to shorter line', () => {
    const engine = makeEngine(['long line here', 'hi', 'another long line']);
    engine.cursor = { row: 0, col: 10 };
    const result = engine.handleKey('j');
    expect(result.cursor.row).toBe(1);
    expect(result.cursor.col).toBe(2); // clamped to 'hi'.length
  });
});

describe('LazyVimEngine — editing', () => {
  test('i enters insert mode at cursor', () => {
    const engine = makeEngine(['hello']);
    engine.cursor.col = 2;
    const result = engine.handleKey('i');
    expect(result.mode).toBe('insert');
    expect(result.cursor.col).toBe(2);
  });

  test('a enters insert mode after cursor', () => {
    const engine = makeEngine(['hello']);
    engine.cursor.col = 2;
    const result = engine.handleKey('a');
    expect(result.mode).toBe('insert');
    expect(result.cursor.col).toBe(3);
  });

  test('I enters insert mode at line start', () => {
    const engine = makeEngine(['hello']);
    engine.cursor.col = 3;
    const result = engine.handleKey('I');
    expect(result.mode).toBe('insert');
    expect(result.cursor.col).toBe(0);
  });

  test('A enters insert mode at line end', () => {
    const engine = makeEngine(['hello']);
    engine.cursor.col = 2;
    const result = engine.handleKey('A');
    expect(result.mode).toBe('insert');
    expect(result.cursor.col).toBe(5);
  });

  test('o opens line below and enters insert mode', () => {
    const engine = makeEngine(['line 1']);
    const result = engine.handleKey('o');
    expect(result.mode).toBe('insert');
    expect(result.cursor.row).toBe(1);
    expect(result.cursor.col).toBe(0);
    expect(engine.buffer).toEqual(['line 1', '']);
  });

  test('O opens line above and enters insert mode', () => {
    const engine = makeEngine(['line 1']);
    const result = engine.handleKey('O');
    expect(result.mode).toBe('insert');
    expect(result.cursor.row).toBe(0);
    expect(result.cursor.col).toBe(0);
    expect(engine.buffer).toEqual(['', 'line 1']);
  });

  test('x deletes character under cursor', () => {
    const engine = makeEngine(['hello']);
    engine.cursor.col = 1;
    const result = engine.handleKey('x');
    expect(engine.buffer[0]).toBe('hllo');
    expect(result.cursor.col).toBe(1);
  });

  test('dd deletes current line', () => {
    const engine = makeEngine(['line 1', 'line 2', 'line 3']);
    engine.cursor.row = 1;
    const result = engine.handleKey('dd');
    expect(engine.buffer).toEqual(['line 1', 'line 3']);
    expect(result.cursor.row).toBe(1);
  });

  test('dd on last line moves cursor up', () => {
    const engine = makeEngine(['line 1', 'line 2']);
    engine.cursor.row = 1;
    engine.handleKey('dd');
    expect(engine.cursor.row).toBe(0);
  });

  test('dd on single line clears it', () => {
    const engine = makeEngine(['only line']);
    engine.handleKey('dd');
    expect(engine.buffer).toEqual(['']);
    expect(engine.cursor.row).toBe(0);
  });

  test('yy yanks current line', () => {
    const engine = makeEngine(['line 1', 'line 2']);
    engine.cursor.row = 1;
    engine.handleKey('yy');
    expect(engine.yankRegister).toBe('line 2');
  });

  test('p pastes yanked line after cursor', () => {
    const engine = makeEngine(['line 1', 'line 2']);
    engine.cursor.row = 0;
    engine.handleKey('yy');
    const result = engine.handleKey('p');
    expect(engine.buffer).toEqual(['line 1', 'line 1', 'line 2']);
    expect(result.cursor.row).toBe(1);
  });

  test('P pastes yanked line before cursor', () => {
    const engine = makeEngine(['line 1', 'line 2']);
    engine.cursor.row = 1;
    engine.handleKey('yy');
    engine.handleKey('P');
    expect(engine.buffer).toEqual(['line 1', 'line 2', 'line 2']);
  });

  test('p with empty yank register does nothing', () => {
    const engine = makeEngine(['line 1']);
    const result = engine.handleKey('p');
    expect(result.type).toBe('action');
    expect(result.description).toContain('Nothing to paste');
    expect(engine.buffer).toEqual(['line 1']);
  });

  test('ciw changes inner word', () => {
    const engine = makeEngine(['hello world']);
    engine.cursor.col = 1;
    const result = engine.handleKey('ciw');
    expect(result.mode).toBe('insert');
    expect(engine.buffer[0]).toBe(' world');
  });

  test('diw deletes inner word', () => {
    const engine = makeEngine(['hello world']);
    engine.cursor.col = 1;
    engine.handleKey('diw');
    expect(engine.buffer[0]).toBe(' world');
    expect(engine.mode).toBe('normal');
  });

  test('u undoes last change', () => {
    const engine = makeEngine(['hello world']);
    engine.cursor.col = 0;
    engine.handleKey('x');
    expect(engine.buffer[0]).toBe('ello world');
    engine.handleKey('u');
    expect(engine.buffer[0]).toBe('hello world');
  });

  test('u with nothing to undo is a noop', () => {
    const engine = makeEngine(['hello']);
    const result = engine.handleKey('u');
    expect(result.description).toContain('Nothing to undo');
  });

  test('>> indents current line', () => {
    const engine = makeEngine(['hello']);
    engine.handleKey('>>');
    expect(engine.buffer[0]).toBe('  hello');
  });

  test('<< outdents current line', () => {
    const engine = makeEngine(['  hello']);
    engine.cursor.col = 2;
    engine.handleKey('<<');
    expect(engine.buffer[0]).toBe('hello');
  });
});

describe('LazyVimEngine — insert mode', () => {
  test('typing in insert mode adds characters', () => {
    const engine = makeEngine(['hello']);
    engine.handleKey('i');
    engine.handleKey('X');
    engine.handleKey('Y');
    expect(engine.buffer[0]).toBe('XYhello');
    expect(engine.cursor.col).toBe(2);
  });

  test('Escape exits insert mode', () => {
    const engine = makeEngine(['hello']);
    engine.handleKey('i');
    engine.handleKey('X');
    const result = engine.handleKey('Escape');
    expect(result.mode).toBe('normal');
  });

  test('Enter in insert mode splits line', () => {
    const engine = makeEngine(['hello']);
    engine.handleKey('i');
    engine.handleKey('Enter');
    // buffer should be split at cursor position (0)
    // Since we inserted at cursor position 0, Enter splits: '' + 'hello'
    // Actually let me check: engine started at col 0, 'i' doesn't move cursor.
    // So Enter at col 0 splits before 'hello' → ['', 'hello']
    expect(engine.buffer.length).toBe(2);
  });

  test('Backspace in insert mode deletes characters', () => {
    const engine = makeEngine(['hello']);
    engine.handleKey('i');
    engine.handleKey('X');
    engine.handleKey('Backspace');
    expect(engine.buffer[0]).toBe('hello');
  });
});

describe('LazyVimEngine — visual mode', () => {
  test('v enters visual character mode', () => {
    const engine = makeEngine(['hello']);
    const result = engine.handleKey('v');
    expect(result.mode).toBe('visual');
    expect(result.visualType).toBe('char');
  });

  test('V enters visual line mode', () => {
    const engine = makeEngine(['hello']);
    const result = engine.handleKey('V');
    expect(result.mode).toBe('visual');
    expect(result.visualType).toBe('line');
  });

  test('Escape exits visual mode', () => {
    const engine = makeEngine(['hello']);
    engine.handleKey('v');
    const result = engine.handleKey('Escape');
    expect(result.mode).toBe('normal');
  });

  test('> in visual mode indents selection', () => {
    const engine = makeEngine(['a', 'b', 'c']);
    engine.handleKey('V'); // visual line mode
    engine.handleKey('j'); // extend down
    engine.handleKey('>');
    expect(engine.buffer[0]).toBe('  a');
    expect(engine.buffer[1]).toBe('  b');
    expect(engine.mode).toBe('normal');
  });
});

describe('LazyVimEngine — key buffering', () => {
  test('multi-key sequence resolves correctly (dd)', () => {
    const engine = makeEngine(['line 1', 'line 2']);
    const result1 = engine.handleKey('d');
    expect(result1.type).toBe('waiting');
    const result2 = engine.handleKey('d');
    expect(result2.type).toBe('action');
    expect(result2.action).toBe('deleteLine');
  });

  test('multi-key sequence resolves correctly (ciw)', () => {
    const engine = makeEngine(['hello world']);
    engine.cursor.col = 1;
    engine.handleKey('c');
    engine.handleKey('i');
    const result = engine.handleKey('w');
    expect(result.type).toBe('action');
    expect(result.action).toBe('changeInnerWord');
  });

  test('unknown key sequence returns no-mapping', () => {
    const engine = makeEngine(['hello']);
    const result = engine.handleKey('z'); // no mapping for 'z'
    expect(result.type).toBe('no-mapping');
  });

  test('partial match then unknown key clears buffer', () => {
    const engine = makeEngine(['hello']);
    engine.handleKey('d'); // partial — waiting
    const result = engine.handleKey('z'); // 'dz' is not a prefix or match
    expect(result.type).toBe('no-mapping');
  });
});

describe('LazyVimEngine — noop actions', () => {
  test('noop keymaps return success with description', () => {
    const engine = makeEngine(['hello']);
    engine.registerKeymaps([
      { id: 'test', keys: '<leader>ff', description: 'Find files', category: 'telescope', tags: [], engineAction: 'noop', engineArgs: {} },
    ]);
    const result = engine.handleKey('<leader>ff');
    expect(result.type).toBe('action');
    expect(result.action).toBe('noop');
    expect(result.description).toBe('Find files');
  });
});

describe('LazyVimEngine — reset', () => {
  test('reset restores initial state', () => {
    const engine = makeEngine(['line 1', 'line 2']);
    engine.handleKey('j');
    engine.handleKey('dd');
    engine.handleKey('i');
    engine.reset(['fresh']);
    expect(engine.buffer).toEqual(['fresh']);
    expect(engine.cursor).toEqual({ row: 0, col: 0 });
    expect(engine.mode).toBe('normal');
    expect(engine.yankRegister).toBe('');
    expect(engine.undoStack).toEqual([]);
  });
});

describe('LazyVimEngine — action log', () => {
  test('actions are logged', () => {
    const engine = makeEngine(['hello']);
    const result = engine.handleKey('j');
    expect(result.actionLog.length).toBe(1);
    expect(result.actionLog[0].action).toBe('moveCursor');
  });

  test('action log is capped at 50 entries', () => {
    const engine = makeEngine(Array.from({ length: 60 }, (_, i) => `line ${i}`));
    for (let i = 0; i < 55; i++) {
      engine.handleKey('j');
    }
    expect(engine.actionLog.length).toBeLessThanOrEqual(50);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail (engine not yet wired to keymaps)**

```bash
npx jest __tests__/utils/lazyvim-engine.test.js --no-coverage 2>&1 | tail -20
```

Expected: Some tests pass (constructor, registerKeymaps), some may pass or fail depending on engine completeness. The key point is confirming the test file runs.

- [ ] **Step 3: Run tests to verify they all pass**

```bash
npx jest __tests__/utils/lazyvim-engine.test.js --no-coverage 2>&1 | tail -10
```

Expected: All tests PASS.

- [ ] **Step 4: Commit**

```bash
git add __tests__/utils/lazyvim-engine.test.js
git commit -m "test: add LazyVimEngine unit tests"
```

---

### Task 4: Write keymap data validation tests

**Files:**
- Create: `__tests__/utils/lazyvim-keymaps.test.js`

- [ ] **Step 1: Write the test file**

```js
import { keymaps, filterKeymaps, filterKeymapsByCategory, getRandomKeymap, KEYMAP_CATEGORIES } from '../../utils/lazyvim-keymaps';

describe('keymaps data', () => {
  test('every keymap has required fields', () => {
    for (const km of keymaps) {
      expect(km).toHaveProperty('id');
      expect(km).toHaveProperty('keys');
      expect(km).toHaveProperty('description');
      expect(km).toHaveProperty('category');
      expect(km).toHaveProperty('tags');
      expect(km).toHaveProperty('engineAction');
      expect(typeof km.id).toBe('string');
      expect(typeof km.keys).toBe('string');
      expect(typeof km.description).toBe('string');
      expect(typeof km.category).toBe('string');
      expect(Array.isArray(km.tags)).toBe(true);
      expect(typeof km.engineAction).toBe('string');
    }
  });

  test('no duplicate ids', () => {
    const ids = keymaps.map((km) => km.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('all categories are valid', () => {
    const validCategories = KEYMAP_CATEGORIES.map((c) => c.id);
    for (const km of keymaps) {
      expect(validCategories).toContain(km.category);
    }
  });

  test('all categories have at least one keymap', () => {
    const covered = new Set(keymaps.map((km) => km.category));
    for (const cat of KEYMAP_CATEGORIES) {
      expect(covered.has(cat.id)).toBe(true);
    }
  });
});

describe('filterKeymaps', () => {
  test('returns all keymaps for empty query', () => {
    expect(filterKeymaps(keymaps, '')).toEqual(keymaps);
    expect(filterKeymaps(keymaps, '   ')).toEqual(keymaps);
    expect(filterKeymaps(keymaps, undefined)).toEqual(keymaps);
  });

  test('matches by id', () => {
    const result = filterKeymaps(keymaps, 'move-left');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('move-left');
  });

  test('matches by keys', () => {
    const result = filterKeymaps(keymaps, 'ciw');
    expect(result.some((km) => km.id === 'change-inner-word')).toBe(true);
  });

  test('matches by description', () => {
    const result = filterKeymaps(keymaps, 'cursor left');
    expect(result.some((km) => km.id === 'move-left')).toBe(true);
  });

  test('matches by tags', () => {
    const result = filterKeymaps(keymaps, 'yank');
    expect(result.some((km) => km.id === 'yank-line')).toBe(true);
  });

  test('case insensitive', () => {
    const result = filterKeymaps(keymaps, 'CURSOR LEFT');
    expect(result.some((km) => km.id === 'move-left')).toBe(true);
  });

  test('returns empty array for no match', () => {
    expect(filterKeymaps(keymaps, 'zzzznothing')).toEqual([]);
  });
});

describe('filterKeymapsByCategory', () => {
  test('returns only matching category', () => {
    const result = filterKeymapsByCategory(keymaps, 'movement');
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((km) => km.category === 'movement')).toBe(true);
  });

  test('returns all for null/undefined category', () => {
    expect(filterKeymapsByCategory(keymaps, null)).toEqual(keymaps);
    expect(filterKeymapsByCategory(keymaps, undefined)).toEqual(keymaps);
  });
});

describe('getRandomKeymap', () => {
  test('returns a keymap object', () => {
    const km = getRandomKeymap(keymaps);
    expect(km).toBeTruthy();
    expect(km).toHaveProperty('id');
    expect(km).toHaveProperty('keys');
  });

  test('respects category filter', () => {
    const km = getRandomKeymap(keymaps, ['editing']);
    expect(km).toBeTruthy();
    expect(km.category).toBe('editing');
  });

  test('returns null for empty pool', () => {
    expect(getRandomKeymap(keymaps, [])).toBeNull();
  });

  test('returns null when no keymaps match categories', () => {
    expect(getRandomKeymap(keymaps, ['nonexistent'])).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npx jest __tests__/utils/lazyvim-keymaps.test.js --no-coverage 2>&1 | tail -10
```

Expected: All tests PASS.

- [ ] **Step 3: Commit**

```bash
git add __tests__/utils/lazyvim-keymaps.test.js
git commit -m "test: add keymap data validation tests"
```

---

### Task 5: Create the page shell with tab navigation

**Files:**
- Create: `pages/tools/lazyvim-learn/index.js`

- [ ] **Step 1: Write the page shell**

```js
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
```

- [ ] **Step 2: Verify the page renders**

```bash
npx next dev -p 3001 &
sleep 3
curl -s http://localhost:3001/tools/lazyvim-learn 2>&1 | head -5
kill %1 2>/dev/null
```

Expected: HTML response with "LazyVim Learn" content.

- [ ] **Step 3: Commit**

```bash
git add pages/tools/lazyvim-learn/index.js
git commit -m "feat: add LazyVim Learn page shell with tab navigation"
```

---

### Task 6: Build the Reference tab

**Files:**
- Modify: `pages/tools/lazyvim-learn/index.js`

- [ ] **Step 1: Replace the reference tab placeholder with the full component**

In `pages/tools/lazyvim-learn/index.js`, add imports at the top:

```js
import { useState, useMemo } from 'react';
import Head from 'next/head';
import { keymaps, KEYMAP_CATEGORIES, filterKeymaps, filterKeymapsByCategory } from '../../../utils/lazyvim-keymaps';
```

Replace the `activeTab === 'reference'` block with:

```js
{activeTab === 'reference' && (
  <ReferenceTab keymaps={keymaps} categories={KEYMAP_CATEGORIES} />
)}
```

Add the ReferenceTab component at the bottom of the file (before the closing of the default export is fine, or as a separate function above):

```js
function ReferenceTab({ keymaps, categories }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const filtered = useMemo(() => {
    let result = keymaps;
    if (selectedCategory) {
      result = filterKeymapsByCategory(result, selectedCategory);
    }
    if (search.trim()) {
      result = filterKeymaps(result, search);
    }
    return result;
  }, [keymaps, search, selectedCategory]);

  return (
    <div className="px-6 md:px-10 py-6">
      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search keymaps…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2.5 rounded-lg border border-[#d2d2d7] dark:border-[#424245] bg-[#ffffff] dark:bg-[#1d1d1f] text-[17px] text-[#1d1d1f] dark:text-[#f5f5f7] placeholder-[#86868b] focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition-colors"
        />
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1.5 rounded-full text-[14px] font-medium leading-[1.29] transition-colors ${
            selectedCategory === null
              ? 'bg-[#0071e3] text-white'
              : 'bg-[#f5f5f7] dark:bg-[#272729] text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-[#e8e8ed] dark:hover:bg-[#3a3a3c]'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
            className={`px-3 py-1.5 rounded-full text-[14px] font-medium leading-[1.29] transition-colors ${
              selectedCategory === cat.id
                ? 'bg-[#0071e3] text-white'
                : 'bg-[#f5f5f7] dark:bg-[#272729] text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-[#e8e8ed] dark:hover:bg-[#3a3a3c]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-[14px] text-[#6e6e73] mb-4">
        {filtered.length} keymap{filtered.length !== 1 ? 's' : ''}
        {selectedCategory && ` in ${categories.find((c) => c.id === selectedCategory)?.label || selectedCategory}`}
      </p>

      {/* Keymap list */}
      <div className="space-y-1">
        {filtered.map((km) => {
          const isExpanded = expandedId === km.id;
          return (
            <div
              key={km.id}
              className="border border-[#d2d2d7] dark:border-[#424245] rounded-lg overflow-hidden transition-colors"
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : km.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#f5f5f7] dark:hover:bg-[#1d1d1f] transition-colors"
              >
                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#f5f5f7] dark:bg-[#272729] text-[#1d1d1f] dark:text-[#f5f5f7] font-mono text-[14px] font-semibold leading-[1.29] min-w-[48px] justify-center">
                  {km.keys}
                </span>
                <span className="text-[17px] leading-[1.47] text-[#1d1d1f] dark:text-[#f5f5f7] flex-1">
                  {km.description}
                </span>
                <span className="text-[12px] text-[#86868b] uppercase tracking-wide">
                  {km.category}
                </span>
                <svg className={`w-4 h-4 text-[#86868b] transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-[#d2d2d7] dark:border-[#424245] pt-3">
                  <div className="text-[14px] leading-[1.47] text-[#6e6e73]">
                    <p className="mb-2"><strong className="text-[#1d1d1f] dark:text-[#f5f5f7]">Keys:</strong> <code className="font-mono bg-[#f5f5f7] dark:bg-[#272729] px-1.5 py-0.5 rounded">{km.keys}</code></p>
                    <p className="mb-2"><strong className="text-[#1d1d1f] dark:text-[#f5f5f7]">Category:</strong> {km.category}</p>
                    <p><strong className="text-[#1d1d1f] dark:text-[#f5f5f7]">Tags:</strong> {km.tags.join(', ')}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-[17px] text-[#6e6e73] text-center py-12">
          No keymaps found for "{search}".
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify the page renders with reference data**

```bash
npx next dev -p 3001 &
sleep 3
curl -s http://localhost:3001/tools/lazyvim-learn 2>&1 | grep -c "keymap"
kill %1 2>/dev/null
```

Expected: Response contains keymap references.

- [ ] **Step 3: Commit**

```bash
git add pages/tools/lazyvim-learn/index.js
git commit -m "feat: add Reference tab with search, category filter, and expandable keymap list"
```

---

### Task 7: Build the Practice tab — flashcard mode

**Files:**
- Modify: `pages/tools/lazyvim-learn/index.js`

- [ ] **Step 1: Add the Practice tab component**

Replace the `activeTab === 'practice'` placeholder block with:

```js
{activeTab === 'practice' && (
  <PracticeTab keymaps={keymaps} categories={KEYMAP_CATEGORIES} />
)}
```

Add the PracticeTab component above the default export:

```js
function PracticeTab({ keymaps, categories }) {
  const [mode, setMode] = useState('flashcard'); // 'flashcard' | 'speedrun'
  const [selectedCategories, setSelectedCategories] = useState(null); // null = all
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [inputBuffer, setInputBuffer] = useState('');
  const [feedback, setFeedback] = useState(null); // { correct: boolean, expected: string }
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [speedrunResults, setSpeedrunResults] = useState(null);
  const inputRef = useRef(null);

  // Pick a new question
  const nextQuestion = useCallback(() => {
    const pool = selectedCategories || categories.map((c) => c.id);
    const km = getRandomKeymap(keymaps, pool);
    setCurrentQuestion(km);
    setInputBuffer('');
    setFeedback(null);
  }, [keymaps, selectedCategories, categories]);

  // Start flashcard session
  const startFlashcard = () => {
    setStarted(true);
    setFinished(false);
    setScore(0);
    setStreak(0);
    setTotalAttempts(0);
    nextQuestion();
  };

  // Start speedrun
  const startSpeedrun = () => {
    setMode('speedrun');
    setStarted(true);
    setFinished(false);
    setScore(0);
    setStreak(0);
    setTotalAttempts(0);
    setTimeLeft(60);
    setSpeedrunResults(null);
    nextQuestion();
  };

  // Speedrun timer
  useEffect(() => {
    if (mode !== 'speedrun' || !started || finished) return;
    if (timeLeft <= 0) {
      finishSpeedrun();
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [mode, started, finished, timeLeft]);

  const finishSpeedrun = () => {
    setFinished(true);
    setSpeedrunResults({
      score,
      totalAttempts,
      accuracy: totalAttempts > 0 ? Math.round((score / totalAttempts) * 100) : 0,
    });
  };

  // Handle key input for practice
  const handlePracticeKey = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      checkAnswer();
      return;
    }
    if (e.key === 'Escape') {
      setInputBuffer('');
      return;
    }
    if (e.key === 'Backspace') {
      setInputBuffer((prev) => prev.slice(0, -1));
      return;
    }
    // Accumulate single characters
    if (e.key.length === 1) {
      setInputBuffer((prev) => prev + e.key);
    }
  };

  const checkAnswer = () => {
    if (!currentQuestion) return;
    const isCorrect = inputBuffer.trim() === currentQuestion.keys;
    setTotalAttempts((t) => t + 1);
    if (isCorrect) {
      setScore((s) => s + 1);
      setStreak((s) => s + 1);
      setFeedback({ correct: true, expected: currentQuestion.keys });
    } else {
      setStreak(0);
      setFeedback({ correct: false, expected: currentQuestion.keys });
    }
  };

  const handleNext = () => {
    if (mode === 'speedrun' && timeLeft <= 0) {
      finishSpeedrun();
      return;
    }
    nextQuestion();
    // Focus input for next question
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // Category toggle
  const toggleCategory = (catId) => {
    setSelectedCategories((prev) => {
      if (prev === null) {
        // All currently selected — deselect all except this one
        return [catId];
      }
      if (prev.includes(catId)) {
        const next = prev.filter((c) => c !== catId);
        return next.length === 0 ? null : next;
      }
      return [...prev, catId];
    });
  };

  // ── Setup screen ──
  if (!started) {
    return (
      <div className="px-6 md:px-10 py-8 max-w-xl mx-auto">
        <h2 className="text-[28px] leading-[1.14] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-4">
          Practice Mode
        </h2>
        <p className="text-[17px] leading-[1.47] text-[#6e6e73] mb-6">
          Choose your mode and categories to practice.
        </p>

        {/* Mode selection */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => { setMode('flashcard'); startFlashcard(); }}
            className="flex-1 px-5 py-4 rounded-xl border border-[#d2d2d7] dark:border-[#424245] hover:border-[#0071e3] transition-colors text-left"
          >
            <div className="text-[17px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">Flashcard</div>
            <div className="text-[14px] text-[#6e6e73]">Study at your own pace with immediate feedback</div>
          </button>
          <button
            onClick={startSpeedrun}
            className="flex-1 px-5 py-4 rounded-xl border border-[#d2d2d7] dark:border-[#424245] hover:border-[#0071e3] transition-colors text-left"
          >
            <div className="text-[17px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">Speedrun ⚡</div>
            <div className="text-[14px] text-[#6e6e73]">60-second timed challenge</div>
          </button>
        </div>

        {/* Category filter */}
        <div className="mb-4">
          <p className="text-[14px] font-semibold text-[#6e6e73] mb-2">Categories (optional filter)</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const isSelected = selectedCategories === null || selectedCategories.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-[14px] font-medium transition-colors ${
                    isSelected
                      ? 'bg-[#0071e3] text-white'
                      : 'bg-[#f5f5f7] dark:bg-[#272729] text-[#86868b]'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── Speedrun results screen ──
  if (finished && speedrunResults) {
    return (
      <div className="px-6 md:px-10 py-8 max-w-xl mx-auto text-center">
        <h2 className="text-[28px] leading-[1.14] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">
          Time's Up!
        </h2>
        <div className="grid grid-cols-3 gap-4 my-8">
          <div className="bg-[#f5f5f7] dark:bg-[#272729] rounded-xl p-4">
            <div className="text-[32px] font-semibold text-[#0071e3]">{speedrunResults.score}</div>
            <div className="text-[12px] text-[#6e6e73]">Correct</div>
          </div>
          <div className="bg-[#f5f5f7] dark:bg-[#272729] rounded-xl p-4">
            <div className="text-[32px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{speedrunResults.accuracy}%</div>
            <div className="text-[12px] text-[#6e6e73]">Accuracy</div>
          </div>
          <div className="bg-[#f5f5f7] dark:bg-[#272729] rounded-xl p-4">
            <div className="text-[32px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{speedrunResults.totalAttempts}</div>
            <div className="text-[12px] text-[#6e6e73]">Attempted</div>
          </div>
        </div>
        <button
          onClick={startSpeedrun}
          className="px-6 py-3 rounded-full bg-[#0071e3] text-white text-[17px] font-semibold hover:bg-[#0066cc] transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // ── Active practice ──
  return (
    <div className="px-6 md:px-10 py-8 max-w-xl mx-auto">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="text-[14px] text-[#6e6e73]">
            Score: <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{score}</span>
          </div>
          {streak > 1 && (
            <div className="text-[14px] text-[#ff9f0a]">
              🔥 {streak} streak
            </div>
          )}
        </div>
        {mode === 'speedrun' && (
          <div className={`text-[17px] font-semibold ${timeLeft <= 10 ? 'text-[#ff3b30]' : 'text-[#1d1d1f] dark:text-[#f5f5f7]'}`}>
            {timeLeft}s
          </div>
        )}
        <button
          onClick={() => { setStarted(false); setFinished(false); }}
          className="text-[14px] text-[#0071e3] hover:underline"
        >
          Exit
        </button>
      </div>

      {/* Question */}
      {currentQuestion && (
        <>
          <div className="bg-[#f5f5f7] dark:bg-[#272729] rounded-xl p-6 mb-6">
            <p className="text-[12px] text-[#86868b] uppercase tracking-wide mb-2">{currentQuestion.category}</p>
            <p className="text-[21px] leading-[1.38] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
              {currentQuestion.description}
            </p>
          </div>

          {/* Input area */}
          {!feedback ? (
            <div
              className="relative"
              onClick={() => inputRef.current?.focus()}
            >
              <div className="px-4 py-3 rounded-lg border-2 border-[#0071e3] bg-[#ffffff] dark:bg-[#1d1d1f] min-h-[48px] flex items-center cursor-text">
                <span className="font-mono text-[21px] text-[#1d1d1f] dark:text-[#f5f5f7]">
                  {inputBuffer || <span className="text-[#86868b]">Type the key sequence…</span>}
                </span>
                <span className="inline-block w-0.5 h-5 bg-[#0071e3] ml-0.5 animate-pulse" />
              </div>
              <input
                ref={inputRef}
                type="text"
                value=""
                onKeyDown={handlePracticeKey}
                onChange={() => {}} // controlled but via keydown
                className="sr-only"
                autoFocus
              />
              <button
                onClick={checkAnswer}
                disabled={!inputBuffer.trim()}
                className="mt-3 px-5 py-2 rounded-full bg-[#0071e3] text-white text-[14px] font-semibold hover:bg-[#0066cc] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Check (Enter)
              </button>
            </div>
          ) : (
            <div>
              <div className={`px-4 py-3 rounded-lg mb-3 ${
                feedback.correct
                  ? 'bg-[#30d158]/10 border border-[#30d158]/30'
                  : 'bg-[#ff3b30]/10 border border-[#ff3b30]/30'
              }`}>
                <p className={`text-[17px] font-semibold mb-1 ${feedback.correct ? 'text-[#30d158]' : 'text-[#ff3b30]'}`}>
                  {feedback.correct ? '✓ Correct!' : '✗ Incorrect'}
                </p>
                <p className="text-[14px] text-[#6e6e73]">
                  Answer: <code className="font-mono font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] bg-[#f5f5f7] dark:bg-[#272729] px-2 py-0.5 rounded">{feedback.expected}</code>
                </p>
              </div>
              <button
                onClick={handleNext}
                className="px-5 py-2 rounded-full bg-[#0071e3] text-white text-[14px] font-semibold hover:bg-[#0066cc] transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

Add `useRef, useCallback, useEffect` to the React import at the top:
```js
import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
```

Add the `getRandomKeymap` import:
```js
import { keymaps, KEYMAP_CATEGORIES, filterKeymaps, filterKeymapsByCategory, getRandomKeymap } from '../../../utils/lazyvim-keymaps';
```

- [ ] **Step 2: Verify the page renders**

```bash
npx next dev -p 3001 &
sleep 3
curl -s http://localhost:3001/tools/lazyvim-learn 2>&1 | grep -c "Practice"
kill %1 2>/dev/null
```

Expected: Response contains "Practice".

- [ ] **Step 3: Commit**

```bash
git add pages/tools/lazyvim-learn/index.js
git commit -m "feat: add Practice tab with flashcard and speedrun modes"
```

---

### Task 8: Build the Sandbox tab

**Files:**
- Modify: `pages/tools/lazyvim-learn/index.js`

- [ ] **Step 1: Add the Sandbox tab component**

Replace the `activeTab === 'sandbox'` placeholder block with:

```js
{activeTab === 'sandbox' && (
  <SandboxTab keymaps={keymaps} />
)}
```

Add the SandboxTab component above the default export:

```js
function SandboxTab({ keymaps }) {
  const [engine, setEngine] = useState(null);
  const [buffer, setBuffer] = useState([]);
  const [cursor, setCursor] = useState({ row: 0, col: 0 });
  const [mode, setMode] = useState('normal');
  const [visualType, setVisualType] = useState(null);
  const [visualAnchor, setVisualAnchor] = useState(null);
  const [actionLog, setActionLog] = useState([]);
  const [lastAction, setLastAction] = useState(null);
  const [waitingSeq, setWaitingSeq] = useState('');
  const sandboxRef = useRef(null);

  // Initialize engine
  useEffect(() => {
    const eng = new LazyVimEngine();
    eng.registerKeymaps(keymaps);
    setEngine(eng);
    setBuffer(eng.buffer);
  }, [keymaps]);

  // Focus the sandbox container for keyboard capture
  useEffect(() => {
    sandboxRef.current?.focus();
  }, []);

  const handleSandboxKey = (e) => {
    if (!engine) return;

    // Map browser key events to engine key names
    let key = e.key;
    if (e.ctrlKey && key !== 'Control') {
      key = `<C-${key}>`;
    }

    // Only prevent default for recognized Vim keys
    const vimKeys = ['h', 'j', 'k', 'l', 'w', 'b', 'e', 'i', 'a', 'o', 'O', 'I', 'A',
      'x', 'd', 'y', 'p', 'P', 'u', 'v', 'V', '0', '$', 'gg', 'G', '{', '}', '%',
      '/', '?', 'n', 'N', '*', '#', '>', '<', 'Escape', 'Enter', 'Backspace', 'Tab',
      'c', 'K', 'g', '[', ']', 'z'];
    if (vimKeys.includes(e.key) || e.ctrlKey) {
      e.preventDefault();
    }

    const result = engine.handleKey(key);
    setBuffer([...engine.buffer]);
    setCursor({ ...engine.cursor });
    setMode(engine.mode);
    setVisualType(engine.visualType);
    setVisualAnchor(engine.visualAnchor ? { ...engine.visualAnchor } : null);
    setActionLog([...engine.actionLog]);
    setLastAction(result);

    if (result.type === 'waiting') {
      setWaitingSeq(result.sequence);
    } else {
      setWaitingSeq('');
    }
  };

  const handleReset = () => {
    if (!engine) return;
    engine.reset();
    setBuffer([...engine.buffer]);
    setCursor({ ...engine.cursor });
    setMode(engine.mode);
    setVisualType(null);
    setVisualAnchor(null);
    setActionLog([]);
    setLastAction(null);
    setWaitingSeq('');
  };

  const getVisualRange = () => {
    if (!visualAnchor || mode !== 'visual') return null;
    return {
      start: Math.min(visualAnchor.row, cursor.row),
      end: Math.max(visualAnchor.row, cursor.row),
    };
  };

  const visualRange = getVisualRange();

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-220px)] min-h-[500px]">
      {/* Editor pane */}
      <div
        ref={sandboxRef}
        tabIndex={0}
        onKeyDown={handleSandboxKey}
        className="flex-1 bg-[#1d1d1f] text-[#f5f5f7] font-mono text-[15px] leading-[1.6] p-4 overflow-auto focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#0071e3] rounded-lg lg:rounded-r-none"
      >
        {/* Click to focus hint */}
        <div className="text-[12px] text-[#6e6e73] mb-3 select-none">
          Click here and start typing Vim keys…
        </div>

        {/* Buffer display */}
        {buffer.map((line, rowIdx) => {
          const isSelected = visualRange && rowIdx >= visualRange.start && rowIdx <= visualRange.end;
          const isCursorRow = cursor.row === rowIdx;

          return (
            <div
              key={rowIdx}
              className={`flex ${isSelected ? 'bg-[#0071e3]/20' : ''}`}
            >
              {/* Line number */}
              <span className="text-[#6e6e73] text-[12px] w-8 text-right mr-3 select-none flex-shrink-0 leading-[1.6]">
                {rowIdx + 1}
              </span>

              {/* Line content */}
              <span className="flex-1 whitespace-pre">
                {isCursorRow && mode !== 'visual' ? (
                  <>
                    <span>{line.slice(0, cursor.col)}</span>
                    <span className="inline-block w-1.5 h-[1.1em] bg-[#0071e3] align-middle mx-[-1px] animate-pulse" />
                    <span>{line.slice(cursor.col)}</span>
                  </>
                ) : isCursorRow && mode === 'visual' ? (
                  <>
                    <span>{line.slice(0, cursor.col)}</span>
                    <span className="inline-block w-1.5 h-[1.1em] bg-[#ff9f0a] align-middle mx-[-1px]" />
                    <span>{line.slice(cursor.col)}</span>
                  </>
                ) : (
                  <span>{line || ' '}</span>
                )}
              </span>
            </div>
          );
        })}

        {/* Statusline */}
        <div className="mt-4 pt-2 border-t border-[#424245] flex items-center justify-between text-[12px]">
          <div className="flex items-center gap-3">
            <span className={`px-2 py-0.5 rounded font-semibold ${
              mode === 'normal' ? 'bg-[#0071e3] text-white' :
              mode === 'insert' ? 'bg-[#30d158] text-black' :
              'bg-[#ff9f0a] text-black'
            }`}>
              {mode === 'normal' ? 'NORMAL' : mode === 'insert' ? 'INSERT' : mode.toUpperCase()}
            </span>
            {waitingSeq && (
              <span className="text-[#86868b]">waiting: {waitingSeq}</span>
            )}
          </div>
          <div className="text-[#6e6e73]">
            Ln {cursor.row + 1}, Col {cursor.col + 1}
          </div>
        </div>
      </div>

      {/* Key inspector sidebar */}
      <div className="lg:w-80 bg-[#f5f5f7] dark:bg-[#272729] border-t lg:border-t-0 lg:border-l border-[#d2d2d7] dark:border-[#424245] p-4 overflow-auto rounded-lg lg:rounded-l-none mt-4 lg:mt-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[14px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
            Key Inspector
          </h3>
          <button
            onClick={handleReset}
            className="text-[12px] text-[#0071e3] hover:underline"
          >
            Reset Buffer
          </button>
        </div>

        {lastAction && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-[#0071e3]/10 border border-[#0071e3]/20">
            <p className="text-[14px] font-semibold text-[#0071e3]">Last action</p>
            <p className="text-[14px] text-[#1d1d1f] dark:text-[#f5f5f7]">{lastAction.description}</p>
          </div>
        )}

        <div className="space-y-1.5">
          {[...actionLog].reverse().slice(0, 20).map((entry, i) => (
            <div
              key={i}
              className={`px-2.5 py-1.5 rounded text-[13px] leading-[1.4] ${
                i === 0
                  ? 'bg-[#0071e3]/10 text-[#0071e3] font-medium'
                  : 'text-[#6e6e73]'
              }`}
            >
              <span className="font-mono font-semibold">{entry.action}</span>
              <span className="mx-1.5">—</span>
              {entry.description}
            </div>
          ))}
        </div>

        {actionLog.length === 0 && (
          <p className="text-[13px] text-[#86868b] italic">
            Press keys to see their actions appear here.
          </p>
        )}
      </div>
    </div>
  );
}
```

Add the `LazyVimEngine` import at the top:
```js
import { LazyVimEngine } from '../../../utils/lazyvim-engine';
```

- [ ] **Step 2: Verify the sandbox renders**

```bash
npx next dev -p 3001 &
sleep 3
curl -s http://localhost:3001/tools/lazyvim-learn 2>&1 | grep -c "Key Inspector"
kill %1 2>/dev/null
```

Expected: Response contains "Key Inspector".

- [ ] **Step 3: Commit**

```bash
git add pages/tools/lazyvim-learn/index.js
git commit -m "feat: add Sandbox tab with virtual editor and key inspector"
```

---

### Task 9: Register the tool in the sidebar

**Files:**
- Modify: `utils/tools.js`

- [ ] **Step 1: Add the tool entry**

In `utils/tools.js`, add the lazyvim-learn entry to the tools array. Place it in the "Other" category section (before the closing `];` of the tools array):

```js
  { id: 'lazyvim-learn', name: 'LazyVim Learn', desc: 'Learn and practice LazyVim keymaps', icon: '⌨️', category: 'other' },
```

- [ ] **Step 2: Verify it appears in the sidebar and home page**

```bash
npx jest __tests__/utils/tools.test.js --no-coverage 2>&1 | tail -10
```

Expected: All tests PASS (the tool count might change, but the groupByCategory and filterTools tests should still pass since they're dynamic).

- [ ] **Step 3: Commit**

```bash
git add utils/tools.js
git commit -m "feat: register LazyVim Learn in tool sidebar"
```

---

### Task 10: Run all tests and do final verification

**Files:**
- No new files — verification step

- [ ] **Step 1: Run all tests**

```bash
npx jest --no-coverage 2>&1 | tail -20
```

Expected: All tests PASS.

- [ ] **Step 2: Run the dev server and verify the full page loads**

```bash
npx next dev -p 3001 &
sleep 4
curl -s http://localhost:3001/tools/lazyvim-learn 2>&1 | grep -c "LazyVim Learn"
kill %1 2>/dev/null
```

Expected: Returns a count > 0 (the page has the title).

- [ ] **Step 3: Verify the build works**

```bash
npx next build 2>&1 | tail -20
```

Expected: Build succeeds without errors.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: final verification — all tests pass, build succeeds"
```

---

### Task 11: Mobile support

**Files:**
- Modify: `pages/tools/lazyvim-learn/index.js`

- [ ] **Step 1: Add touch detection and mobile sandbox keys**

Add a touch detection hook at the top of the file (after imports):

```js
function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);
  return isTouch;
}
```

Add the mobile key grid to the SandboxTab. After the editor pane div (before the key inspector sidebar), add:

```js
{/* Mobile on-screen key grid */}
{isTouch && (
  <div className="lg:hidden mt-3 grid grid-cols-8 gap-1.5">
    {['h','j','k','l','w','b','e','i','a','o','x','dd','yy','p','u','Escape'].map((k) => (
      <button
        key={k}
        onPointerDown={(e) => {
          e.preventDefault();
          if (!engine) return;
          for (const ch of k) {
            const result = engine.handleKey(ch);
            setBuffer([...engine.buffer]);
            setCursor({ ...engine.cursor });
            setMode(engine.mode);
            setVisualType(engine.visualType);
            setVisualAnchor(engine.visualAnchor ? { ...engine.visualAnchor } : null);
            setActionLog([...engine.actionLog]);
            setLastAction(result);
            setWaitingSeq(result.type === 'waiting' ? result.sequence : '');
          }
        }}
        className="px-2 py-2.5 rounded-lg bg-[#f5f5f7] dark:bg-[#272729] text-[#1d1d1f] dark:text-[#f5f5f7] font-mono text-[13px] font-semibold text-center active:bg-[#0071e3] active:text-white transition-colors select-none touch-manipulation"
      >
        {k}
      </button>
    ))}
  </div>
)}
```

Add the `isTouch` variable in SandboxTab:
```js
const isTouch = useIsTouchDevice();
```

For the Practice tab on mobile, add multiple-choice buttons. After the question display (after the `<p>` that shows `currentQuestion.description`), add:

```js
{/* Mobile: multiple choice */}
{isTouch && !feedback && (
  <div className="grid grid-cols-2 gap-2 mt-4">
    {(() => {
      const correct = currentQuestion.keys;
      const wrongPool = keymaps
        .filter((km) => km.keys !== correct && km.category === currentQuestion.category)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((km) => km.keys);
      const options = [...wrongPool, correct].sort(() => Math.random() - 0.5);
      return options.map((opt) => (
        <button
          key={opt}
          onClick={() => {
            setInputBuffer(opt);
            // Trigger check after a tick
            setTimeout(() => {
              const isCorrect = opt === correct;
              setTotalAttempts((t) => t + 1);
              if (isCorrect) {
                setScore((s) => s + 1);
                setStreak((s) => s + 1);
                setFeedback({ correct: true, expected: correct });
              } else {
                setStreak(0);
                setFeedback({ correct: false, expected: correct });
              }
            }, 100);
          }}
          className="px-3 py-2.5 rounded-lg border border-[#d2d2d7] dark:border-[#424245] font-mono text-[14px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] hover:border-[#0071e3] active:bg-[#0071e3]/10 transition-colors"
        >
          {opt}
        </button>
      ));
    })()}
  </div>
)}
```

Add the `isTouch` variable in PracticeTab:
```js
const isTouch = useIsTouchDevice();
```

- [ ] **Step 2: Verify mobile layout**

```bash
npx next dev -p 3001 &
sleep 3
curl -s http://localhost:3001/tools/lazyvim-learn 2>&1 | grep -c "touch-manipulation"
kill %1 2>/dev/null
```

Expected: Returns count > 0 (mobile key grid classes present).

- [ ] **Step 3: Commit**

```bash
git add pages/tools/lazyvim-learn/index.js
git commit -m "feat: add mobile touch support — on-screen key grid and multiple-choice practice"
```