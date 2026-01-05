import { db } from '$lib/server/db';
import { Diagnosis, inPatient_view } from '$lib/server/db/schema/entities/patients';
import { and, eq, isNull } from 'drizzle-orm';
import { nationalIdPattern } from '$lib/stores/patterns';

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

export function getBirthdateFromNationalId(national_id: string) {
  if (!nationalIdPattern.test(national_id)) throw new Error('Wrong national id pattern.');

  const centuryIndex = Number(national_id[0]);

  const [yy, mm, dd] = national_id
    .slice(1, 7)
    .split(/(\d{2})/)
    .filter(Boolean)
    .map(Number);

  return new Date((centuryIndex - 2 + 19) * 100 + yy, mm, dd);
}

export function getGenderFromNationalId(national_id: string) {
  if (!nationalIdPattern.test(national_id)) throw new Error('Wrong national id pattern.');

  return Number(national_id.slice(12, 13)) % 2 === 1;
}
