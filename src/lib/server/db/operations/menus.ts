import { db } from '$lib/server/db';
import { Discharge_Reason, Diagnosis } from '$lib/server/db/schema/entities/patients';
import { Ward } from '$lib/server/db/schema/entities/hospital';

import { Contact_type, IdDoc_type } from '$lib/server/db/schema/entities/people';

export async function createIdDocType(docType: typeof IdDoc_type.$inferInsert) {
  try {
    const [new_id_doc_type] = await db.insert(IdDoc_type).values(docType).returning();

    return { success: true, data: new_id_doc_type };
  } catch (error) {
    return {
      error,
    };
  }
}

export async function createContactType(contactType: typeof Contact_type.$inferInsert) {
  try {
    const [new_contact_type] = await db
      .insert(Contact_type)
      .values(contactType)
      .returning();

    return { success: true, data: new_contact_type };
  } catch (error) {
    return {
      error,
    };
  }
}

export async function createWard(ward: typeof Ward.$inferInsert) {
  try {
    const { id, name, floor, capacity, tags } = ward;
    const [new_ward] = await db
      .insert(Ward)
      .values({ id, name, floor, capacity, tags: tags?.toString() })
      .returning();

    return {
      success: true,
      data: new_ward,
    };
  } catch (error) {
    return {
      error,
    };
  }
}

export async function createDischargeReason(
  dischargeReason: typeof Discharge_Reason.$inferInsert
) {
  try {
    const [new_discharge_reason] = await db
      .insert(Discharge_Reason)
      .values(dischargeReason)
      .returning();

    return {
      success: true,
      data: new_discharge_reason,
    };
  } catch (error) {
    return {
      error,
    };
  }
}

export async function createDiagnosis(
  diagnosis: string | { name: string; icd11: string },
  tx: any
) {
  const conn = tx || db;

  try {
    const [newDiagnosis] = await conn
      .insert(Diagnosis)
      .values(typeof diagnosis === 'string' ? { name: diagnosis } : diagnosis)
      .returning();

    return {
      success: true,
      data: newDiagnosis,
    };
  } catch (error) {
    return {
      error,
    };
  }
}
