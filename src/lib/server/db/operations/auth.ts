import bcrypt from 'bcryptjs';
import { db } from '$lib/server/db';
import { RefreshToken, users_view } from '$lib/server/db/schema/entities/system';
import { and, eq, gt, lt } from 'drizzle-orm';
import {
  generateTokenId,
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  verifyRefreshToken,
  type RefreshTokenPayload,
  type AccessTokenPayload,
} from '$lib/utils/auth/jwt';

export async function getUserById(user_id: number) {
  const [user] = await db
    .select()
    .from(users_view)
    .where(eq(users_view.user_id, user_id));

  return user;
}

export async function validateLogin(username: string, password: string) {
  const [user] = await db
    .select()
    .from(users_view)
    .where(eq(users_view.username, username));

  if (!user) {
    return null;
  }

  const isValid = await bcrypt.compare(password, user.hashed_pw);

  if (!isValid) {
    return null;
  }

  return user;
}

export async function createTokens(
  userData: typeof users_view.$inferSelect,
  sessionMaxAge: Date
) {
  const tokenId = generateTokenId();

  const refreshPayload: RefreshTokenPayload = {
    userId: userData.user_id,
    tokenId,
  };

  const accessPayload: AccessTokenPayload = {
    userId: userData.user_id,
  };

  const accessToken = await generateAccessToken(accessPayload);
  const refreshToken = await generateRefreshToken(refreshPayload, sessionMaxAge);

  await db.insert(RefreshToken).values({
    id: tokenId,
    user_id: userData.user_id,
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
  const records = await db.transaction(async (tx) => {
    const [tokenRecord] = await tx
      .select()
      .from(RefreshToken)
      .where(
        and(
          eq(RefreshToken.id, refreshTokenPayload.tokenId),
          eq(RefreshToken.user_id, refreshTokenPayload.userId),
          eq(RefreshToken.token_hash, tokenHash),
          gt(RefreshToken.expires_at, new Date())
        )
      );

    const [userRecord] = await tx
      .select()
      .from(users_view)
      .where(eq(users_view.user_id, tokenRecord.user_id));

    return {
      token: tokenRecord,
      user: userRecord,
    };
  });

  if (!records.token) {
    throw new Error('Refresh token not found or expired');
  }

  await db
    .update(RefreshToken)
    .set({
      last_used_at: new Date(),
    })
    .where(eq(RefreshToken.id, refreshTokenPayload.tokenId));

  const accessPayload: AccessTokenPayload = {
    userId: records.user.user_id,
  };

  const newAccessToken = await generateAccessToken(accessPayload);

  return {
    accessToken: newAccessToken,
    user: records.user,
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

  const [user] = await db
    .select()
    .from(users_view)
    .where(eq(users_view.user_id, payload.userId));

  if (!user) {
    throw new Error('User not found');
  }

  return await createTokens(user, sessionMaxAge);
}

async function deleteAllExpiredRefreshTokens() {
  console.log('CLEANED EXPIRED REFRESH TOKENS');
  await db.delete(RefreshToken).where(lt(RefreshToken.expires_at, new Date()));
}

setInterval(deleteAllExpiredRefreshTokens, 24 * 60 * 60 * 1000);
