import { formatSqlQuery, minifySql } from '../../../pages/tools/sql';

describe('SQL formatter helpers', () => {
  test('formats a basic select', () => {
    const out = formatSqlQuery('select id,name from users where active=1');
    expect(out.toUpperCase()).toContain('SELECT');
    expect(out).toMatch(/FROM/i);
    expect(out.split('\n').length).toBeGreaterThan(1);
  });

  test('minify collapses whitespace', () => {
    expect(minifySql('select   *\nfrom   t')).toBe('select * from t');
  });

  test('empty input throws', () => {
    expect(() => formatSqlQuery('  ')).toThrow(/enter/i);
    expect(() => minifySql('')).toThrow(/enter/i);
  });
});
