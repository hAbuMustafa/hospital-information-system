import { generateKeyPairSync } from 'node:crypto';
import { PV_KEY_ENCR_KEY } from '$env/static/private';
import { Sec_pb_key, Sec_pv_key, User } from '$lib/server/db/schema/entities/system';
import bcrypt from 'bcryptjs';
import { db } from '$lib/server/db';
import { and, eq } from 'drizzle-orm';
import { people_view } from '../schema/entities/people';
import type { NewUserDataT } from './types';

const SALT_ROUNDS = 12;

export async function createUser(newUserData: NewUserDataT) {
  const passwordHash = await bcrypt.hash(newUserData.password, SALT_ROUNDS);

  const { publicKey: encryptedPbKey, privateKey: encryptedPvKey } = generateKeyPairSync(
    'rsa',
    {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        cipher: 'aes-256-cbc',
        passphrase: PV_KEY_ENCR_KEY,
      },
    }
  );

  try {
    const response = await db.transaction(async (tx) => {
      const [new_pb_key] = await tx
        .insert(Sec_pb_key)
        .values({ key: encryptedPbKey })
        .returning();

      const [new_pv_key] = await tx
        .insert(Sec_pv_key)
        .values({ key: encryptedPvKey })
        .returning();

      const [user] = await tx
        .insert(User)
        .values({
          hashed_pw: passwordHash,
          pb_key_id: new_pb_key.id,
          pv_key_id: new_pv_key.id,
          ...newUserData,
        })
        .returning();

      return user;
    });

    const { hashed_pw: droppedPwHash2, ...otherUserData } = response;

    return {
      success: true,
      data: otherUserData,
    };
  } catch (error) {
    return {
      error,
    };
  }
}

export async function updateUser(
  userId: number,
  values: Omit<Partial<typeof User.$inferSelect>, 'id'>
) {
  try {
    const [user] = await db
      .update(User)
      .set(values as any)
      .where(eq(User.id, userId))
      .returning();

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    return {
      error,
    };
  }
}

export async function isUniqueUsername(username: string) {
  const result = await db.$count(User, eq(User.username, username));

  return result === 0;
}

export async function isUniqueContactString(
  field: 'email' | 'phone_number',
  value: string
) {
  const result = await db.$count(
    people_view,
    and(eq(people_view.contact_type, field), eq(people_view.contact_string, value))
  );

  return result === 0;
}

export async function isUniqueNationalId(national_id: string) {
  const result = await db.$count(
    people_view,
    and(eq(people_view.id_doc_type, 'رقم قومي'), eq(people_view.id_doc_num, national_id))
  );

  return result === 0;
}

export async function changePassword(userId: number, newPassword: string) {
  const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

  const result = await updateUser(userId, {
    hashed_pw: newPasswordHash,
    password_reset_required: false,
  });

  return result;
}
