import { parseUrl } from '../../../pages/tools/url-parser';

describe('parseUrl', () => {
  test('parses a full URL with auth, port, query, hash', () => {
    const data = parseUrl(
      'https://user:pass@example.com:8443/path?foo=1&bar=hi&foo=2#top'
    );
    expect(data.protocol).toBe('https');
    expect(data.username).toBe('user');
    expect(data.password).toBe('pass');
    expect(data.hostname).toBe('example.com');
    expect(data.port).toBe('8443');
    expect(data.pathname).toBe('/path');
    expect(data.hash).toBe('#top');
    expect(data.query).toEqual([
      { key: 'foo', value: '1' },
      { key: 'bar', value: 'hi' },
      { key: 'foo', value: '2' },
    ]);
  });

  test('prefixes https for bare host', () => {
    const data = parseUrl('example.com/x');
    expect(data.protocol).toBe('https');
    expect(data.hostname).toBe('example.com');
    expect(data.pathname).toBe('/x');
  });

  test('throws on empty or invalid', () => {
    expect(() => parseUrl('')).toThrow(/enter/i);
    expect(() => parseUrl('://')).toThrow(/invalid/i);
  });
});
