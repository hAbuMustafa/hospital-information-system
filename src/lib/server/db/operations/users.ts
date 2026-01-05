import { generateKeyPairSync } from 'node:crypto';
import { PV_KEY_ENCR_KEY } from '$env/static/private';
import {
  Sec_pb_key,
  Sec_pv_key,
  User,
  users_view,
} from '$lib/server/db/schema/entities/system';
import bcrypt from 'bcryptjs';
import { db } from '$lib/server/db';
import { and, eq } from 'drizzle-orm';
import {
  People_contact_information,
  people_view,
  Person,
  Person_IdDoc,
} from '../schema/entities/people';
import type { NewUserDataT } from './types';
import { getBirthdateFromNationalId, getGenderFromNationalId } from './utils';

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

      const [new_person] = await tx
        .insert(Person)
        .values({
          gender: getGenderFromNationalId(newUserData.national_id),
          birthdate: getBirthdateFromNationalId(newUserData.national_id),
          ...newUserData,
        })
        .returning();

      const [newIdDoc] = await tx
        .insert(Person_IdDoc)
        .values({
          person_id: new_person.id,
          document_type: 1,
          document_number: newUserData.national_id,
        })
        .returning();

      const [newEmail] = await tx
        .insert(People_contact_information)
        .values({
          person_id: new_person.id,
          contact_type: 3,
          contact_string: newUserData.email,
        })
        .returning();

      const [newPhoneNumber] = await tx
        .insert(People_contact_information)
        .values({
          person_id: new_person.id,
          contact_type: 1,
          contact_string: newUserData.phone_number,
        })
        .returning();

      const [user] = await tx
        .insert(User)
        .values({
          username: newUserData.username,
          hashed_pw: passwordHash,
          pb_key_id: new_pb_key.id,
          pv_key_id: new_pv_key.id,
          person_id: new_person.id,
          role: 0,
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
  const usersCountWithSameContact = await db.$count(
    users_view,
    and(eq(users_view.contact_type, field), eq(users_view.contact_string, value))
  );

  const peopleCountWithSameContact = await db.$count(
    people_view,
    and(eq(people_view.contact_type, field), eq(people_view.contact_string, value))
  );

  return {
    users: usersCountWithSameContact === 0,
    people: peopleCountWithSameContact === 0,
  };
}

export async function isUniqueNationalId(national_id: string) {
  const usersCountWithSameNationalId = await db.$count(
    users_view,
    and(eq(users_view.id_doc_type, 'رقم قومي'), eq(users_view.id_doc_num, national_id))
  );

  const peopleCountWithSameNationalId = await db.$count(
    people_view,
    and(eq(people_view.id_doc_type, 'رقم قومي'), eq(people_view.id_doc_num, national_id))
  );

  return {
    users: usersCountWithSameNationalId === 0,
    people: peopleCountWithSameNationalId === 0,
  };
}

export async function changePassword(userId: number, newPassword: string) {
  const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

  const result = await updateUser(userId, {
    hashed_pw: newPasswordHash,
    password_reset_required: false,
  });

  return result;
}
