import { db } from '$lib/server/db/';
import { inPatient_view } from '$lib/server/db/schema/entities/patients';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

function getPatientQuery(id: string) {
  const idIsNumber = /^\d+$/.test(id);

  return db
    .select()
    .from(inPatient_view)
    .where(
      idIsNumber
        ? eq(inPatient_view.patient_id, Number(id))
        : eq(inPatient_view.patient_file_number, id)
    );
}

export async function GET({ url }) {
  const patient_id = url.searchParams.get('patient_id');
  const patient_file_id = url.searchParams.get('patient_file_id');

  if (!patient_id && !patient_file_id)
    return new Response('Bad Request', { status: 401 });

  if (patient_id && patient_file_id) return new Response('Bad Request', { status: 401 });

  if (patient_file_id && !/^\d{2}\/\d{1,}$/.test(patient_file_id))
    return new Response('Bad Request', { status: 401 });

  if (patient_id && !/^\d+$/.test(patient_id))
    return new Response('Bad Request', { status: 401 });

  const [patient_data] = await getPatientQuery(
    (patient_id || patient_file_id)!
  ).execute();

  if (!patient_data) return new Response('Bad Request', { status: 401 });

  return json(patient_data);
}
