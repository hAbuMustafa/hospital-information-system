import { db } from '$lib/server/db/';
import { inPatient_view } from '$lib/server/db/schema/entities/patients';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

function getPatientQuery(id: number) {
  return db.select().from(inPatient_view).where(eq(inPatient_view.patient_id, id));
}

export async function GET({ params }) {
  const patient_query = params.patient_id;

  if (patient_query && !/^\d+$/.test(patient_query))
    return new Response('Bad Request', { status: 401 });

  let patient_id;

  try {
    patient_id = Number(patient_query);
  } catch (error) {
    console.error(error);
    return new Response('Bad Request', { status: 401 });
  }

  const [patient_data] = await getPatientQuery(patient_id).execute();

  if (!patient_data) return new Response('Bad Request', { status: 401 });

  return json(patient_data);
}
