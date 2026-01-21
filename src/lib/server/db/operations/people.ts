import { db } from '$lib/server/db';
import { and, eq } from 'drizzle-orm';
import {
  Contact_type,
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
  values: Omit<Partial<typeof Person.$inferInsert>, 'id'>,
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
  contact_string_id: number | null,
  new_contact_string: string,
  person_id: number,
  contact_type_tag: string,
) {
  try {
    let contact_string;
    if (contact_string_id) {
      [contact_string] = await db
        .update(People_contact_information)
        .set({ contact_string: new_contact_string })
        .where(eq(People_contact_information.id, contact_string_id))
        .returning();
    } else {
      contact_string = await db.transaction(async (tx) => {
        const [contact_type_id_row] = await tx
          .select()
          .from(Contact_type)
          .where(eq(Contact_type.tag, contact_type_tag));

        const [new_contact_row] = await tx
          .insert(People_contact_information)
          .values({
            contact_type: contact_type_id_row.id,
            contact_string: new_contact_string,
            person_id: person_id,
          })
          .returning();

        return new_contact_row;
      });
    }

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
  id_doc_id: number | null,
  new_id_doc: string,
  person_id: number,
  id_doc_type_id: number,
) {
  try {
    let id_doc_number;
    if (id_doc_id) {
      [id_doc_number] = await db
        .update(Person_IdDoc)
        .set({ document_number: new_id_doc, document_type: id_doc_type_id })
        .where(eq(Person_IdDoc.id, id_doc_id))
        .returning();
    } else {
      [id_doc_number] = await db
        .insert(Person_IdDoc)
        .values({
          person_id,
          document_type: id_doc_type_id,
          document_number: new_id_doc,
        })
        .returning();
    }

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

export async function updateIdDocNumberOfPerson(
  person_id: number,
  id_doc_type: number,
  id_doc_number: string,
) {
  try {
    const [id_doc_numberInsert] = await db
      .update(Person_IdDoc)
      .set({ document_type: id_doc_type, document_number: id_doc_number })
      .where(eq(Person_IdDoc.person_id, person_id))
      .returning();

    return {
      success: true,
      data: id_doc_numberInsert,
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
    and(eq(people_view.id_doc_type_id, type_id), eq(people_view.id_doc_number, num)),
  );

  return peopleCountWithSameNationalId === 0;
}

export async function createIdDocNumber(
  person_id: number,
  id_doc_type: number,
  id_doc_number: string,
) {
  try {
    const [idDocNumInsert] = await db
      .insert(Person_IdDoc)
      .values({ person_id, document_type: id_doc_type, document_number: id_doc_number })
      .returning();

    return {
      success: true,
      data: idDocNumInsert,
    };
  } catch (error) {
    console.error(error);
    return { error };
  }
}
