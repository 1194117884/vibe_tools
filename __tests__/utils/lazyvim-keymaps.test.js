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