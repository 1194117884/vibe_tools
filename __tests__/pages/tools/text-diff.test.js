import { diffLines, summarizeDiff } from '../../../pages/tools/text-diff';

describe('diffLines', () => {
  test('detects equal, added, and removed lines', () => {
    const rows = diffLines('a\nb\nc', 'a\nx\nc');
    expect(rows.filter((r) => r.type === 'equal').map((r) => r.text)).toEqual(['a', 'c']);
    expect(rows.some((r) => r.type === 'remove' && r.text === 'b')).toBe(true);
    expect(rows.some((r) => r.type === 'add' && r.text === 'x')).toBe(true);
  });

  test('handles identical texts', () => {
    const rows = diffLines('one\ntwo', 'one\ntwo');
    expect(rows.every((r) => r.type === 'equal')).toBe(true);
    expect(summarizeDiff(rows)).toEqual({ added: 0, removed: 0, equal: 2 });
  });

  test('handles empty vs content', () => {
    const rows = diffLines('', 'hello');
    expect(rows.some((r) => r.type === 'add' && r.text === 'hello')).toBe(true);
  });
});
