import crypto from 'crypto';
import jwt from 'jsonwebtoken';

/**
 * Sign a JWT token with the given secret and expiry.
 * Includes a unique jti claim so consecutive calls yield distinct tokens.
 * @param {string} secret - JWT signing secret
 * @param {string} expiresIn - Duration string (e.g. '24h', '1h')
 * @returns {string} Signed JWT
 */
export function signToken(secret, expiresIn) {
  return jwt.sign({ jti: crypto.randomUUID() }, secret, { expiresIn });
}

/**
 * Verify a JWT token and return its payload.
 * @param {string} token - JWT to verify
 * @param {string} secret - JWT signing secret
 * @returns {object} Decoded payload with iat and exp
 * @throws {Error} If token is invalid or expired
 */
export function verifyToken(token, secret) {
  if (!token || typeof token !== 'string') {
    throw new Error('Invalid token');
  }
  return jwt.verify(token, secret);
}
