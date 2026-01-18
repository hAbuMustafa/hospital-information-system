import { db } from '$server/db/index.js';
import { diagnosis_view } from '$server/db/schema/entities/patients';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export async function GET({ url }) {
  const patient_query = url.searchParams.get('patient_id');
  if (patient_query === '') return new Response('Bad request', { status: 401 });

  if (patient_query && !/\d+/.test(patient_query))
    return new Response('Bad request', { status: 401 });

  let patient_id;

  try {
    patient_id = Number(patient_query);
  } catch (error) {
    console.error(error);
    return new Response('Bad request', { status: 401 });
  }

  const diagnoses = await db
    .select()
    .from(diagnosis_view)
    .where(eq(diagnosis_view.patient_id, patient_id));

  return json(diagnoses);
}
