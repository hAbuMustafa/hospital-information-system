import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import {
  People_contact_information,
  Person,
  Person_IdDoc,
} from '../schema/entities/people';

export async function updatePerson(
  personId: number,
  values: Omit<Partial<typeof Person.$inferSelect>, 'id'>
) {
  try {
    const [person] = await db
      .update(Person)
      .set(values)
      .where(eq(Person.id, personId))
      .returning();

    return {
      success: true,
      data: person,
    };
  } catch (error) {
    return {
      error,
    };
  }
}

export async function updateContactInfo(
  old_contact_string: string,
  new_contact_string: string
) {
  try {
    const [contact_string] = await db
      .update(People_contact_information)
      .set({ contact_string: new_contact_string })
      .where(eq(People_contact_information.contact_string, old_contact_string))
      .returning();

    return {
      success: true,
      data: contact_string,
    };
  } catch (error) {
    return {
      error,
    };
  }
}

export async function updateIdDocNumber(
  old_id_doc_number: string,
  new_id_doc_number: string
) {
  try {
    const [id_doc_number] = await db
      .update(Person_IdDoc)
      .set({ document_number: new_id_doc_number })
      .where(eq(Person_IdDoc.document_number, old_id_doc_number))
      .returning();

    return {
      success: true,
      data: id_doc_number,
    };
  } catch (error) {
    return {
      error,
    };
  }
}
