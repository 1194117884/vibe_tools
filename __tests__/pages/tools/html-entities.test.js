import { escapeHtml, unescapeHtml } from '../../../pages/tools/html-entities';

describe('HTML entities', () => {
  test('escapes special characters', () => {
    expect(escapeHtml(`<a href="x">it's &</a>`)).toBe(
      '&lt;a href=&quot;x&quot;&gt;it&#39;s &amp;&lt;/a&gt;'
    );
  });

  test('unescapes named and numeric entities', () => {
    expect(unescapeHtml('&lt;div&gt; &amp; &#39; &#x41;')).toBe(`<div> & ' A`);
  });

  test('round-trip', () => {
    const src = `<p class="x">A & B</p>`;
    expect(unescapeHtml(escapeHtml(src))).toBe(src);
  });
});
