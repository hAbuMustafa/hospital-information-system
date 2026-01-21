import { SignJWT, jwtVerify } from 'jose';
import { dev } from '$app/environment';
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } from '$env/static/private';
import { randomBytes, createHash } from 'crypto';

const ACCESS_TOKEN_SECRET = new TextEncoder().encode(JWT_ACCESS_SECRET);
const REFRESH_TOKEN_SECRET = new TextEncoder().encode(JWT_REFRESH_SECRET);

const ACCESS_TOKEN_EXPIRY = '3m';

export const ACCESS_TOKEN_MAX_AGE = 3 * 60;

export const ACCESS_COOKIE_NAME = 'access_token';
export const REFRESH_COOKIE_NAME = 'refresh_token';

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: !dev,
  sameSite: 'lax' as const,
  path: '/',
};

export type AccessTokenPayload = {
  userId: number;
};

export type RefreshTokenPayload = {
  userId: number;
  tokenId: string;
};

export async function generateAccessToken(payload: AccessTokenPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(ACCESS_TOKEN_SECRET);
}

export async function generateRefreshToken(
  payload: RefreshTokenPayload,
  sessionMaxAge: Date
): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(sessionMaxAge)
    .sign(REFRESH_TOKEN_SECRET);
}

export async function verifyAccessToken(
  token: string | undefined
): Promise<AccessTokenPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, ACCESS_TOKEN_SECRET);
    return payload as AccessTokenPayload;
  } catch (error) {
    return null;
  }
}

export async function verifyRefreshToken(
  token: string
): Promise<RefreshTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, REFRESH_TOKEN_SECRET);
    return payload as RefreshTokenPayload;
  } catch (error) {
    return null;
  }
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function generateTokenId(): string {
  return randomBytes(32).toString('hex');
}
