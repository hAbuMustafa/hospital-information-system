import { generateKeyPairSync } from 'node:crypto';
import { PV_KEY_ENCR_KEY } from '$env/static/private';
import { Sec_pb_key, Sec_pv_key, User } from '$lib/server/db/schema/entities/system';
import bcrypt from 'bcryptjs';
import { db } from '$lib/server/db';
import {
  People_contact_information,
  Person,
  Person_IdDoc,
} from '../../schema/entities/people';
import { Staff } from '../../schema/entities/hospital';
import { getBirthdateFromNationalId, getGenderFromNationalId } from '../utils';

const SALT_ROUNDS = 12;

type seedUserDataT = {
  id: number;
  first_name: string;
  father_name: string;
  grandfather_name: string;
  family_name: string;
  username: string;
  password: string;
  national_id: string;
  email: string;
  phone_number: string;
  role: number;
  password_reset_required: number;
};

export async function seedUser(newUserData: seedUserDataT) {
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

      const [newPerson] = await tx
        .insert(Person)
        .values({
          first_name: newUserData.first_name,
          father_name: newUserData.father_name,
          grandfather_name: newUserData.grandfather_name,
          family_name: newUserData.family_name,
          gender: getGenderFromNationalId(newUserData.national_id),
          birthdate: getBirthdateFromNationalId(newUserData.national_id),
        })
        .returning();

      if (newUserData.national_id) {
        const [newIdDoc] = await tx
          .insert(Person_IdDoc)
          .values({
            person_id: newPerson.id,
            document_type: 1,
            document_number: newUserData.national_id,
          })
          .returning();
      }

      if (newUserData.email) {
        const [newEmail] = await tx
          .insert(People_contact_information)
          .values({
            person_id: newPerson.id,
            contact_type: 3,
            contact_string: newUserData.email,
          })
          .returning();
      }

      if (newUserData.phone_number) {
        const [newPhone] = await tx
          .insert(People_contact_information)
          .values({
            person_id: newPerson.id,
            contact_type: 1,
            contact_string: newUserData.phone_number,
          })
          .returning();
      }

      const [newStaff] = await tx
        .insert(Staff)
        .values({
          person_id: newPerson.id,
        })
        .returning();

      const [user] = await tx
        .insert(User)
        .values({
          ...newUserData,
          person_id: newPerson.id,
          hashed_pw: passwordHash,
          pb_key_id: new_pb_key.id,
          pv_key_id: new_pv_key.id,
          password_reset_required: Boolean(newUserData.password_reset_required),
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
