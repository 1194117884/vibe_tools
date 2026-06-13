import { signToken } from '../../utils/auth';

const DELAY_MS = 500;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const start = Date.now();

  try {
    const { key } = req.body || {};

    if (!key || typeof key !== 'string' || key.trim() === '') {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, DELAY_MS - elapsed);
      await new Promise((r) => setTimeout(r, remaining));
      return res.status(400).json({ error: '请输入密钥' });
    }

    const accessSecret = process.env.ACCESS_SECRET;
    const jwtSecret = process.env.JWT_SECRET;

    if (!accessSecret || !jwtSecret) {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, DELAY_MS - elapsed);
      await new Promise((r) => setTimeout(r, remaining));
      return res.status(500).json({ error: 'Server configuration error' });
    }

    if (key !== accessSecret) {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, DELAY_MS - elapsed);
      await new Promise((r) => setTimeout(r, remaining));
      return res.status(401).json({ error: '密钥不正确' });
    }

    const token = signToken(jwtSecret, '24h');

    const elapsed = Date.now() - start;
    const remaining = Math.max(0, DELAY_MS - elapsed);
    await new Promise((r) => setTimeout(r, remaining));

    return res.status(200).json({ token });
  } catch (error) {
    console.error('Verify error:', error);
    return res.status(500).json({ error: '验证服务暂时不可用，请稍后再试' });
  }
}
