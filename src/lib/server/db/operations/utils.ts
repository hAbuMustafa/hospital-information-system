import { db } from '$lib/server/db';
import { InPatient, Diagnosis } from '$lib/server/db/schema/entities/patients';
import { Person } from '$lib/server/db/schema/entities/people';
import { Ward } from '$lib/server/db/schema/entities/hospital';
import { and, eq, isNull, like } from 'drizzle-orm';

export async function isAdmitted(idDocType: number, idDocNum: string) {
  const [foundAdmitted] = await db
    .select({
      name: Person.name,
      recent_ward_name: InPatient.recent_ward,
    })
    .from(InPatient)
    .leftJoin(Person, eq(InPatient.person_id, Person.id))
    .leftJoin(Ward, eq(InPatient.recent_ward, Ward.id))
    .where(
      and(
        eq(Person.id_doc_type, idDocType),
        eq(Person.id_doc_num, idDocNum),
        isNull(InPatient.discharge_date)
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
