import { generateUlid, generateUuidV4 } from '../../../pages/tools/uuid';

describe('UUID / ULID generators', () => {
  const fakeCrypto = {
    randomUUID: () => '550e8400-e29b-41d4-a716-446655440000',
    getRandomValues: (arr) => {
      for (let i = 0; i < arr.length; i += 1) arr[i] = (i * 17) % 256;
      return arr;
    },
  };

  test('generateUuidV4 uses randomUUID when available', () => {
    expect(generateUuidV4(fakeCrypto)).toBe('550e8400-e29b-41d4-a716-446655440000');
  });

  test('generateUuidV4 falls back to getRandomValues', () => {
    const noUuid = { getRandomValues: fakeCrypto.getRandomValues };
    const id = generateUuidV4(noUuid);
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );
  });

  test('generateUlid is 26 Crockford chars and sortable by time', () => {
    const a = generateUlid(1_700_000_000_000, fakeCrypto);
    const b = generateUlid(1_800_000_000_000, fakeCrypto);
    expect(a).toHaveLength(26);
    expect(b).toHaveLength(26);
    expect(a < b).toBe(true);
    expect(a).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/);
  });
});
