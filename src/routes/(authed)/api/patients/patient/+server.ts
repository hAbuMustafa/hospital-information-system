import { db } from '$lib/server/db/';
import { Patients } from '$lib/server/db/schema/entities';
import { json } from '@sveltejs/kit';
import { eq, ne } from 'drizzle-orm';

function getPatientQuery(patient_id: string) {
  return db.query.Patients.findFirst({
    with: {
      Person: {
        with: {
          Patient_id_doc_type: true,
          Patients: {
            with: {
              Patient_discharge_reason: true,
            },
            where: ne(Patients.id, patient_id),
          },
        },
      },
      Patient_wards: {
        with: {
          Ward: true,
        },
      },
      Patient_diagnoses: {
        with: {
          Diagnosis: true,
        },
      },
      Patient_discharge_reason: true,
    },
    where: eq(Patients.id, patient_id),
  });
}

export async function GET({ url }) {
  const patient_id = url.searchParams.get('id');

  if (!patient_id || !/^\d{2}\/\d{1,}$/.test(patient_id))
    return new Response('Bad Request', { status: 401 });

  const patient_data = await getPatientQuery(patient_id).execute();

  if (!patient_data) return new Response('Bad Request', { status: 401 });

  return json(patient_data);
}

export type PatientWithComprehensiveDataT = Awaited<ReturnType<typeof getPatientQuery>>;
