import { db } from '$lib/server/db';
import { inPatient_view } from '$lib/server/db/schema/entities/patients';
import { regexp } from '$lib/utils/drizzle';
import { regexifiedPersonName } from '$lib/utils/querying';
import { json } from '@sveltejs/kit';
import { and, desc, isNotNull, isNull, like, or } from 'drizzle-orm';

export async function GET({ url }) {
  let query = url.searchParams.get('q') || '';
  let currentResidentsOnly = url.searchParams.get('cro') || '';

  query = query.trim();
  currentResidentsOnly = currentResidentsOnly.trim();

  if (query === '') return new Response('Bad request', { status: 401 });

  const isNumber = /\d/g.test(query);

  const matchedPeople = await db
    .select()
    .from(inPatient_view)
    .where(
      and(
        currentResidentsOnly
          ? isNull(inPatient_view.discharge_time)
          : isNotNull(inPatient_view.person_id),
        isNumber
          ? or(
              like(inPatient_view.patient_file_number, `%${query}%`),
              like(inPatient_view.id_doc_number, `%${query}%`)
            )
          : regexp(`full_name`, regexifiedPersonName(query))
      )
    )
    .orderBy(desc(inPatient_view.admission_time));

  return json(matchedPeople);
}
