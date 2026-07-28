import { webcrypto } from 'crypto';
import { TextEncoder, TextDecoder } from 'util';
import { computeHmac } from '../../../pages/tools/hmac';

// jsdom environment may lack TextEncoder
if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = TextEncoder;
  globalThis.TextDecoder = TextDecoder;
}

describe('computeHmac', () => {
  test('produces stable hex for known input', async () => {
    // HMAC-SHA256("hello", "secret") — standard test vector
    const result = await computeHmac('hello', 'secret', 'SHA-256', webcrypto);
    expect(result.hex).toBe(
      '88aab3ede8d3adf94d26ab90d3bafd4a2083070c3bcce9c014ee04a443847c0b'
    );
    expect(result.base64).toBeTruthy();
    expect(result.base64.length).toBeGreaterThan(10);
  });

  test('different secrets produce different signatures', async () => {
    const a = await computeHmac('msg', 'key1', 'SHA-256', webcrypto);
    const b = await computeHmac('msg', 'key2', 'SHA-256', webcrypto);
    expect(a.hex).not.toBe(b.hex);
  });
});
