import {
  CATEGORIES,
  filterTools,
  groupToolsByCategory,
  protectedTools,
  tools,
} from '../../utils/tools';

describe('groupToolsByCategory', () => {
  test('returns non-empty groups in category order', () => {
    const groups = groupToolsByCategory(tools);
    expect(groups.length).toBeGreaterThan(0);
    expect(groups.every((g) => g.tools.length > 0)).toBe(true);
    // order matches CATEGORIES definition
    const order = groups.map((g) => g.id);
    const expected = CATEGORIES.map((c) => c.id).filter((id) => order.includes(id));
    expect(order).toEqual(expected);
  });

  test('includes every public tool exactly once', () => {
    const groups = groupToolsByCategory(tools);
    const ids = groups.flatMap((g) => g.tools.map((t) => t.id));
    expect(ids).toHaveLength(tools.length);
    expect(new Set(ids).size).toBe(tools.length);
  });

  test('groups protected tools under Private', () => {
    const groups = groupToolsByCategory(protectedTools);
    expect(groups).toHaveLength(1);
    expect(groups[0].id).toBe('private');
    expect(groups[0].label).toBe('Private');
  });

  test('unknown category falls back to other', () => {
    const groups = groupToolsByCategory([{ id: 'x', name: 'X', category: 'nope' }]);
    expect(groups.some((g) => g.id === 'other' && g.tools[0].id === 'x')).toBe(true);
  });
});

describe('filterTools', () => {
  test('returns all tools for empty query', () => {
    expect(filterTools(tools, '')).toEqual(tools);
    expect(filterTools(tools, '   ')).toEqual(tools);
    expect(filterTools(tools, undefined)).toEqual(tools);
  });

  test('matches by name (case-insensitive)', () => {
    const result = filterTools(tools, 'json');
    expect(result.some((t) => t.id === 'json')).toBe(true);
    expect(result.every((t) => t.name.toLowerCase().includes('json') || t.desc.toLowerCase().includes('json') || t.id.includes('json'))).toBe(true);
  });

  test('matches by description', () => {
    const result = filterTools(tools, 'minify');
    expect(result.some((t) => t.id === 'json')).toBe(true);
  });

  test('matches by id', () => {
    const result = filterTools(tools, 'md-pdf');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('md-pdf');
  });

  test('returns empty array when nothing matches', () => {
    expect(filterTools(tools, 'zzzz-not-a-tool')).toEqual([]);
  });

  test('includes protected tools when provided', () => {
    const all = [...tools, ...protectedTools];
    const result = filterTools(all, 'upload');
    expect(result.some((t) => t.id === 'upload')).toBe(true);
  });
});
