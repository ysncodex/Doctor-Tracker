import jwt, { type SignOptions } from 'jsonwebtoken';

export interface AuthPayload {
  userId: string;
  role: 'admin';
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must contain at least 32 characters');
  }

  return secret;
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: (process.env.JWT_EXPIRES_IN || '1d') as SignOptions['expiresIn'],
  });
}

export function verifyToken(token: string): AuthPayload {
  const decoded = jwt.verify(token, getJwtSecret());

  if (
    typeof decoded === 'string' ||
    typeof decoded.userId !== 'string' ||
    decoded.role !== 'admin'
  ) {
    throw new Error('Invalid token payload');
  }

  return {
    userId: decoded.userId,
    role: 'admin',
  };
}
