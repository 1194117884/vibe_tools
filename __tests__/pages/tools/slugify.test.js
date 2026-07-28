import { slugify } from '../../../pages/tools/slugify';

describe('slugify', () => {
  test('basic conversion', () => {
    expect(slugify('Hello, World!')).toBe('hello-world');
  });

  test('custom separator and casing', () => {
    expect(slugify('Foo Bar', { separator: '_', lowercase: false })).toBe('Foo_Bar');
  });

  test('strips accents and max length', () => {
    expect(slugify('Café au lait')).toBe('cafe-au-lait');
    expect(slugify('one two three four', { maxLength: 7 })).toBe('one-two');
  });

  test('empty input', () => {
    expect(slugify('')).toBe('');
    expect(slugify(null)).toBe('');
  });
});
