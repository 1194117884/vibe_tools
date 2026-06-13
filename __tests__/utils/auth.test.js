import { signToken, verifyToken } from '../../utils/auth';

const SECRET = 'test-jwt-secret-key-64-chars-long';

describe('signToken', () => {
  test('returns a string token', () => {
    const token = signToken(SECRET, '24h');
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
  });

  test('creates tokens with different iat for sequential calls', () => {
    const token1 = signToken(SECRET, '24h');
    const token2 = signToken(SECRET, '24h');
    expect(token1).not.toBe(token2);
  });
});

describe('verifyToken', () => {
  test('accepts a valid token and returns payload', () => {
    const token = signToken(SECRET, '1h');
    const payload = verifyToken(token, SECRET);
    expect(payload).toHaveProperty('iat');
    expect(payload).toHaveProperty('exp');
    expect(payload.exp).toBeGreaterThan(payload.iat);
  });

  test('rejects an expired token', async () => {
    const token = signToken(SECRET, '0s');
    await new Promise((r) => setTimeout(r, 1100));
    expect(() => verifyToken(token, SECRET)).toThrow();
  });

  test('rejects a tampered token', () => {
    const token = signToken(SECRET, '1h');
    const parts = token.split('.');
    parts[1] = Buffer.from('{"iat":9999999999,"exp":9999999999}').toString('base64');
    const tampered = parts.join('.');
    expect(() => verifyToken(tampered, SECRET)).toThrow();
  });

  test('rejects a token signed with a different secret', () => {
    const token = signToken('wrong-secret-key', '1h');
    expect(() => verifyToken(token, SECRET)).toThrow();
  });

  test('rejects null/undefined/empty token', () => {
    expect(() => verifyToken(null, SECRET)).toThrow();
    expect(() => verifyToken(undefined, SECRET)).toThrow();
    expect(() => verifyToken('', SECRET)).toThrow();
  });
});
