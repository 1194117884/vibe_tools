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
    expect(result.cursor.col).toBe(2);
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
    const result = engine.handleKey('z');
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