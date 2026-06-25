import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';

const BCRYPT_SALT_ROUNDS = 10;

// In production a real secret MUST be provided. For local/dev/test we fall back
// to a deterministic value so the app and tests run without extra setup.
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (secret && secret.length > 0) {
    return secret;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production');
  }

  return 'dev-insecure-jwt-secret-change-me';
}

const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ??
  '1d') as SignOptions['expiresIn'];

export interface JwtPayload {
  sub: string;
  email: string;
}

export function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, BCRYPT_SALT_ROUNDS);
}

export function comparePassword(
  plainPassword: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(plainPassword, passwordHash);
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, getJwtSecret()) as JwtPayload;
}
