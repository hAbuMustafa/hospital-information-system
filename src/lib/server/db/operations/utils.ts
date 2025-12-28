import { db } from '$lib/server/db';
import {
  Diagnosis,
  current_inPatient_view,
} from '$lib/server/db/schema/entities/patients';
import { and, eq } from 'drizzle-orm';

export async function isAdmitted(idDocType: number, idDocNum: string) {
  const [foundAdmitted] = await db
    .select()
    .from(current_inPatient_view)
    .where(
      and(
        eq(current_inPatient_view.id_doc_type, idDocType),
        eq(current_inPatient_view.id_doc_number, idDocNum)
      )
    );
  return foundAdmitted;
}

export async function getDiagnoses() {
  const diagnoses_list = await db.select().from(Diagnosis);

  return diagnoses_list.map((d) => d.name) || [];
}
