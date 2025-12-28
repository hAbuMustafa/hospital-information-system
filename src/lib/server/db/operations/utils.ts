import { db } from '$lib/server/db';
import {
  InPatient,
  Diagnosis,
  current_inPatient,
} from '$lib/server/db/schema/entities/patients';
import { and, eq, like } from 'drizzle-orm';

export async function isAdmitted(idDocType: number, idDocNum: string) {
  const [foundAdmitted] = await db
    .select()
    .from(current_inPatient)
    .where(
      and(
        eq(current_inPatient.id_doc_type, idDocType),
        eq(current_inPatient.id_doc_number, idDocNum)
      )
    );
  return foundAdmitted;
}

export async function getLastMedicalNumber() {
  const num = (
    await db
      .select({ mId: InPatient.id })
      .from(InPatient)
      .where(like(InPatient.id, `${new Date().getFullYear().toString().slice(2, 4)}/%`))
  )
    .map((mn) => Number(mn?.mId.split('/')[1] || '0'))
    .sort((a, b) => a - b)
    .pop();

  return num || 0;
}

export async function getDiagnoses() {
  const diagnoses_list = await db.select().from(Diagnosis);

  return diagnoses_list.map((d) => d.name) || [];
}
