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
    this.keymapMap = new Map();   // key sequence → keymap entry
    this.keyPrefixes = new Set(); // partial key sequences
    this.actionLog = [];
    this.yankRegister = '';      // yanked text
    this.undoStack = [];
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
      return this.executeAction(keymap);
    }

    // Partial match — wait for more keys
    if (this.keyPrefixes.has(sequence)) {
      return { type: 'waiting', sequence };
    }

    // No match — clear buffer
    this.keyBuffer = [];
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

    if (/\w/.test(line[col])) {
      // On a word character: skip to end of this word, then back one
      while (col < line.length && /\w/.test(line[col])) col++;
      this.cursor.col = col - 1;
    } else {
      // On a non-word character: skip non-word chars, skip whitespace, find next word end
      while (col < line.length && !/\w/.test(line[col]) && !/\s/.test(line[col])) col++;
      while (col < line.length && /\s/.test(line[col])) col++;
      while (col < line.length && /\w/.test(line[col])) col++;
      this.cursor.col = Math.max(0, col - 1);
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
    return this.makeResult('noop', 'Redo not implemented');
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
  }
}
