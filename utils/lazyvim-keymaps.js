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
export function getRandomKeymap(source, categories) {
  let pool = source;
  if (categories && categories.length > 0) {
    pool = source.filter((km) => categories.includes(km.category));
  }
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}