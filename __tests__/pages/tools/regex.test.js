import { highlightMatches, runRegex } from '../../../pages/tools/regex';

describe('runRegex', () => {
  test('finds all matches with groups', () => {
    const { matches, error } = runRegex('(\\w+)@(\\w+)', 'i', 'a@b c@d');
    expect(error).toBeNull();
    expect(matches).toHaveLength(2);
    expect(matches[0].value).toBe('a@b');
    expect(matches[0].groups).toEqual(['a', 'b']);
  });

  test('returns error for invalid pattern', () => {
    const { matches, error } = runRegex('(', '', 'text');
    expect(matches).toEqual([]);
    expect(error).toBeTruthy();
  });

  test('empty pattern yields no matches', () => {
    expect(runRegex('', 'g', 'abc').matches).toEqual([]);
  });
});

describe('highlightMatches', () => {
  test('splits text around matches', () => {
    const parts = highlightMatches('hello world', [{ value: 'world', index: 6 }]);
    expect(parts).toEqual([
      { type: 'text', value: 'hello ' },
      { type: 'match', value: 'world' },
    ]);
  });
});
