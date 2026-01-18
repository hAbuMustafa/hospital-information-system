import { db } from '$server/db/index.js';
import { transfers_view } from '$server/db/schema/entities/patients';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export async function GET({ params }) {
  const patient_query = params.patient_id;

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
    .from(transfers_view)
    .where(eq(transfers_view.patient_id, patient_id));

  return json(diagnoses);
}
