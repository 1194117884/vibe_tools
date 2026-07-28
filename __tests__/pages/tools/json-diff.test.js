import { diffJson } from '../../../pages/tools/json-diff';

describe('diffJson', () => {
  test('detects no changes for equal values', () => {
    expect(diffJson({ a: 1 }, { a: 1 })).toEqual([]);
  });

  test('detects added, removed, and changed paths', () => {
    const changes = diffJson(
      { name: 'old', keep: true, gone: 1 },
      { name: 'new', keep: true, extra: 2 }
    );
    const byPath = Object.fromEntries(changes.map((c) => [c.path, c]));
    expect(byPath['$.name'].type).toBe('changed');
    expect(byPath['$.gone'].type).toBe('removed');
    expect(byPath['$.extra'].type).toBe('added');
  });

  test('diffs arrays by index', () => {
    const changes = diffJson([1, 2], [1, 3, 4]);
    expect(changes.some((c) => c.path === '$[1]' && c.type === 'changed')).toBe(true);
    expect(changes.some((c) => c.path === '$[2]' && c.type === 'added')).toBe(true);
  });
});
