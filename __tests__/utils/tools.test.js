import { filterTools, protectedTools, tools } from '../../utils/tools';

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
