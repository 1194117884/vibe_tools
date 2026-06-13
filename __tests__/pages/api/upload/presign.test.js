import { createMocks } from 'node-mocks-http';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'test-jwt-secret-for-signing-tokens-64-chars-minimum-length';
process.env.JWT_SECRET = JWT_SECRET;
process.env.ACCESS_SECRET = 'test-access-secret';
process.env.R2_ACCOUNT_ID = 'test-account-id';
process.env.R2_ACCESS_KEY_ID = 'test-access-key';
process.env.R2_SECRET_ACCESS_KEY = 'test-secret-key';
process.env.R2_BUCKET_NAME = 'test-bucket';
process.env.R2_PUBLIC_URL = 'https://pub-test.r2.dev';

// Mock the S3 client
jest.mock('@aws-sdk/client-s3', () => {
  const actual = jest.requireActual('@aws-sdk/client-s3');
  return {
    ...actual,
    S3Client: jest.fn().mockImplementation(() => ({
      send: jest.fn(),
    })),
  };
});

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('https://test-bucket.r2.dev/presigned-upload-url'),
}));

// Import handler AFTER mocks
import handler from '../../../../pages/api/upload/presign';

function makeValidToken() {
  return jwt.sign({}, JWT_SECRET, { expiresIn: '1h' });
}

function makeExpiredToken() {
  return jwt.sign({}, JWT_SECRET, { expiresIn: '0s' });
}

describe('POST /api/upload/presign', () => {
  test('returns 401 when no Authorization header', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      headers: {},
      body: { fileName: 'test.pdf', fileSize: 1000, contentType: 'application/pdf' },
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(401);
    expect(res._getJSONData()).toEqual({ error: '会话已过期，请重新验证' });
  });

  test('returns 401 with invalid JWT', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      headers: { authorization: 'Bearer not.a.valid.token' },
      body: { fileName: 'test.pdf', fileSize: 1000, contentType: 'application/pdf' },
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(401);
  });

  test('returns 401 with expired JWT', async () => {
    const expired = makeExpiredToken();
    await new Promise((r) => setTimeout(r, 1100));
    const { req, res } = createMocks({
      method: 'POST',
      headers: { authorization: `Bearer ${expired}` },
      body: { fileName: 'test.pdf', fileSize: 1000, contentType: 'application/pdf' },
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(401);
  });

  test('returns 400 when fileName is missing', async () => {
    const token = makeValidToken();
    const { req, res } = createMocks({
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
      body: { fileSize: 1000, contentType: 'application/pdf' },
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
  });

  test('returns 413 when file size exceeds limit', async () => {
    const token = makeValidToken();
    const { req, res } = createMocks({
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
      body: { fileName: 'big.zip', fileSize: 52428801, contentType: 'application/zip' },
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(413);
    expect(res._getJSONData().error).toBe('File exceeds 50MB limit');
  });

  test('returns 415 for unsupported content type', async () => {
    const token = makeValidToken();
    const { req, res } = createMocks({
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
      body: { fileName: 'virus.exe', fileSize: 1000, contentType: 'application/x-msdownload' },
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(415);
    expect(res._getJSONData().error).toBe('Unsupported file type');
  });

  test('returns 200 with uploadUrl and publicUrl for valid request', async () => {
    const token = makeValidToken();
    const { req, res } = createMocks({
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
      body: { fileName: 'photo.jpg', fileSize: 5000000, contentType: 'image/jpeg' },
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    const data = res._getJSONData();
    expect(data).toHaveProperty('uploadUrl');
    expect(data).toHaveProperty('publicUrl');
    expect(data).toHaveProperty('key');
    expect(data.publicUrl).toContain('https://pub-test.r2.dev');
    expect(data.key).toMatch(/^[a-f0-9-]{36}_photo\.jpg$/);
  });

  test('returns 405 for non-POST methods', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(405);
  });
});
