import { db } from '$lib/server/db';
import { and, eq } from 'drizzle-orm';
import {
  People_contact_information,
  people_view,
  Person,
  Person_IdDoc,
} from '../schema/entities/people';
import type { newPersonT } from './types';

export async function createPerson(person: newPersonT) {
  try {
    const resultingPerson = await db.transaction(async (tx) => {
      if (person.id_doc_type !== 6) {
        const [foundPerson] = await tx
          .select()
          .from(people_view)
          .where(eq(people_view.id_doc_number, person.id_doc_num));

        if (foundPerson) {
          return foundPerson;
        }
      }

      const [newPerson] = await tx.insert(Person).values(person).returning();

      if (person.id_doc_num) {
        const [newIdDoc] = await tx
          .insert(Person_IdDoc)
          .values({
            person_id: newPerson.id,
            document_type: person.id_doc_type,
            document_number: person.id_doc_num,
          })
          .returning();
      }

      const [insertPerson] = await tx
        .select()
        .from(people_view)
        .where(eq(people_view.person_id, newPerson.id));

      return insertPerson;
    });

    return {
      success: true,
      data: resultingPerson,
    };
  } catch (error) {
    return {
      error,
    };
  }
}

export async function getPerson(personId: number) {
  const [foundPerson] = await db
    .select()
    .from(people_view)
    .where(eq(people_view.person_id, personId));

  return foundPerson;
}

export async function updatePerson(
  personId: number,
  values: Omit<Partial<typeof Person.$inferInsert>, 'id'>
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

export async function isUniqueIdDocNumber(type_id: number, num: string) {
  const peopleCountWithSameNationalId = await db.$count(
    people_view,
    and(eq(people_view.id_doc_type_id, type_id), eq(people_view.id_doc_number, num))
  );

  return peopleCountWithSameNationalId === 0;
}
