import { generateKeyPairSync } from 'node:crypto';
import { PV_KEY_ENCR_KEY } from '$env/static/private';
import { Sec_pb_key, Sec_pv_key, User } from '$lib/server/db/schema/entities/system';
import bcrypt from 'bcryptjs';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';

const SALT_ROUNDS = 12;

type NewUserDataT = {
  username: string;
  password: string;
  name: string;
  national_id: string;
  email: string;
  phone_number: string;
};

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

export async function isUniqueValue(
  field: keyof Omit<Partial<typeof User.$inferSelect>, 'id'>,
  value: string | number | Date | boolean
) {
  const result = await db.$count(User, eq(User[field], value));

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
