import { db } from '$server/db/index.js';
import { inPatient_view } from '$server/db/schema/entities/patients';
import { json } from '@sveltejs/kit';
import { and, eq, ne } from 'drizzle-orm';

export async function GET({ params, url }) {
  const person_query = url.searchParams.get('person_id');

  if (person_query && !/\d+/.test(person_query))
    return new Response('Bad request', { status: 401 });

  let person_id;
  let patient_id;

  try {
    person_id = Number(person_query);
    patient_id = Number(params.patient_id);
  } catch (error) {
    console.error(error);
    return new Response('Bad request', { status: 401 });
  }

  const diagnoses = await db
    .select()
    .from(inPatient_view)
    .where(
      and(
        eq(inPatient_view.person_id, person_id),
        ne(inPatient_view.patient_id, patient_id)
      )
    );

  return json(diagnoses);
}
