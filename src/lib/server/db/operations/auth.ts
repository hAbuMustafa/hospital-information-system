import bcrypt from 'bcryptjs';
import { db } from '$lib/server/db';
import { RefreshToken, User } from '$lib/server/db/schema/entities/system';
import { and, eq, gt, lt } from 'drizzle-orm';
import { getGravatarLinkFromUserRecord } from '$lib/utils/gravatar';
import {
  generateTokenId,
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  verifyRefreshToken,
  type RefreshTokenPayload,
  type AccessTokenPayload,
} from '$lib/utils/auth/jwt';

export async function validateLogin(username: string, password: string) {
  const [user] = await db.select().from(User).where(eq(User.username, username));

  if (!user) {
    return null;
  }

  const isValid = await bcrypt.compare(password, user.hashed_pw);

  if (!isValid) {
    return null;
  }

  const { hashed_pw: droppedPwHash, ...otherUserData } = user;

  return otherUserData;
}

export async function createTokens(
  userData: NonNullable<App.Locals['user']>,
  sessionMaxAge: Date
) {
  const tokenId = generateTokenId();

  const refreshPayload: RefreshTokenPayload = {
    userId: userData.id,
    tokenId,
  };

  const accessToken = await generateAccessToken(userData);
  const refreshToken = await generateRefreshToken(refreshPayload, sessionMaxAge);

  await db.insert(RefreshToken).values({
    id: tokenId,
    user_id: userData.id,
    token_hash: hashToken(refreshToken),
    expires_at: sessionMaxAge,
  });

  return {
    success: true,
    accessToken,
    refreshToken,
  };
}

export async function refreshAccessToken(refreshToken: string) {
  const refreshTokenPayload = await verifyRefreshToken(refreshToken);

  if (!refreshTokenPayload) {
    throw new Error('Invalid refresh token');
  }

  const tokenHash = hashToken(refreshToken);
  const tokenRecord = await db.query.RefreshToken.findFirst({
    where: and(
      eq(RefreshToken.id, refreshTokenPayload.tokenId),
      eq(RefreshToken.user_id, refreshTokenPayload.userId),
      eq(RefreshToken.token_hash, tokenHash),
      gt(RefreshToken.expires_at, new Date())
    ),
    with: {
      User: true,
    },
  });

  if (!tokenRecord) {
    throw new Error('Refresh token not found or expired');
  }

  await db
    .update(RefreshToken)
    .set({
      last_used_at: new Date(),
    })
    .where(eq(RefreshToken.id, refreshTokenPayload.tokenId));

  const accessPayload: AccessTokenPayload = {
    id: refreshTokenPayload.userId,
    username: tokenRecord.User.username,
    name: tokenRecord.User.name,
    created_at: tokenRecord.User.created_at,
    password_reset_required: tokenRecord.User.password_reset_required,
    phone_number: tokenRecord.User.phone_number,
    national_id: tokenRecord.User.national_id,
    role: tokenRecord.User.role,
    last_login: tokenRecord.User.last_login,
    gravatar: getGravatarLinkFromUserRecord(tokenRecord.User),
    email: tokenRecord.User.email,
  };

  const newAccessToken = await generateAccessToken(accessPayload);

  return {
    accessToken: newAccessToken,
    user: accessPayload,
  };
}

export async function logoutUser(refreshToken: string) {
  const payload = await verifyRefreshToken(refreshToken);
  if (!payload) {
    return;
  }
  await db.delete(RefreshToken).where(eq(RefreshToken.id, payload.tokenId));
}

export async function logoutAllDevices(userId: number) {
  await db.delete(RefreshToken).where(eq(RefreshToken.user_id, userId));
}

export async function rotateRefreshToken(oldRefreshToken: string, sessionMaxAge: Date) {
  const payload = await verifyRefreshToken(oldRefreshToken);
  if (!payload) {
    throw new Error('Invalid refresh token');
  }

  await db.delete(RefreshToken).where(eq(RefreshToken.id, payload.tokenId));

  const user = await db.query.User.findFirst({ where: eq(User.id, payload.userId) });

  if (!user) {
    throw new Error('User not found');
  }

  const userData = {
    ...user,
    gravatar: getGravatarLinkFromUserRecord(user),
  };

  return await createTokens(userData, sessionMaxAge);
}

async function deleteAllExpiredRefreshTokens() {
  console.log('CLEANED EXPIRED REFRESH TOKENS');
  await db.delete(RefreshToken).where(lt(RefreshToken.expires_at, new Date()));
}

setInterval(deleteAllExpiredRefreshTokens, 24 * 60 * 60 * 1000);
