import { db } from '$lib/server/db';
import {
  Diagnoses,
  Patient_Diagnoses,
  Patients,
  People,
  Wards,
} from '$lib/server/db/schema/entities';
import { json } from '@sveltejs/kit';
import { eq, isNull, sql } from 'drizzle-orm';

export async function GET() {
  const allPatients = await db
    .select({
      id: Patients.id,
      name: People.name,
      admission_date: Patients.admission_date,
      recent_ward: Patients.recent_ward,
      diagnosis: sql<string>`COALESCE(
        GROUP_CONCAT(${Diagnoses.name}, ' + '), 
        '<غير محدد>'
      )`.as('diagnosis'),
    })
    .from(Patients)
    .leftJoin(People, eq(Patients.person_id, People.id))
    .leftJoin(Wards, eq(Patients.recent_ward, Wards.id))
    .leftJoin(Patient_Diagnoses, eq(Patients.id, Patient_Diagnoses.patient_id))
    .leftJoin(Diagnoses, eq(Diagnoses.id, Patient_Diagnoses.diagnosis_id))
    .where(isNull(Patients.discharge_date))
    .orderBy(Patients.admission_date)
    .groupBy(Patients.id);

  return json(allPatients);
}
