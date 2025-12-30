import { db } from '$lib/server/db';
import { Diagnosis, inPatient_view } from '$lib/server/db/schema/entities/patients';
import { and, eq, isNull } from 'drizzle-orm';

export async function isAdmitted(idDocType: number, idDocNum: string) {
  const [foundAdmitted] = await db
    .select()
    .from(inPatient_view)
    .where(
      and(
        eq(inPatient_view.id_doc_type, idDocType),
        eq(inPatient_view.id_doc_number, idDocNum),
        isNull(inPatient_view.discharge_time)
      )
    );
  return foundAdmitted;
}

export async function getDiagnoses() {
  const diagnoses_list = await db.select().from(Diagnosis);

  return diagnoses_list.map((d) => d.name) || [];
}
