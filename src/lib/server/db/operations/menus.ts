import { db } from '$lib/server/db';
import { Discharge_Reason, Diagnosis } from '$lib/server/db/schema/entities/patients';
import { Ward } from '$lib/server/db/schema/entities/hospital';

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
