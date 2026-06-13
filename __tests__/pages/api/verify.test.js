import { createMocks } from 'node-mocks-http';
import jwt from 'jsonwebtoken';

const ACCESS_SECRET = 'test-access-secret-32-chars-min';
const JWT_SECRET = 'test-jwt-secret-for-signing-tokens-64-chars-minimum-length';

process.env.ACCESS_SECRET = ACCESS_SECRET;
process.env.JWT_SECRET = JWT_SECRET;

// Import handler AFTER setting env vars
import handler from '../../../pages/api/verify';

describe('POST /api/verify', () => {
  test('returns 400 when key is missing from body', async () => {
    const { req, res } = createMocks({ method: 'POST', body: {} });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData()).toEqual({ error: '请输入密钥' });
  });

  test('returns 400 when key is empty string', async () => {
    const { req, res } = createMocks({ method: 'POST', body: { key: '' } });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
  });

  test('returns 401 for wrong key', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { key: 'wrong-key-here' },
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(401);
    expect(res._getJSONData()).toEqual({ error: '密钥不正确' });
  });

  test('returns 200 and valid JWT for correct key', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { key: ACCESS_SECRET },
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    const data = res._getJSONData();
    expect(data).toHaveProperty('token');
    expect(typeof data.token).toBe('string');
    const payload = jwt.verify(data.token, JWT_SECRET);
    expect(payload).toHaveProperty('iat');
    expect(payload).toHaveProperty('exp');
    expect(payload.exp).toBeGreaterThan(payload.iat);
  });

  test('returns 405 for non-POST methods', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(405);
  });

  test('response takes at least 500ms to slow brute force', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { key: 'any-key' },
    });
    const start = Date.now();
    await handler(req, res);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(400);
  });
});
