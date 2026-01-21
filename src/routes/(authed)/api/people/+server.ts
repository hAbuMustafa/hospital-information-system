import { db } from '$lib/server/db/';
import { inPatient_view } from '$lib/server/db/schema/entities/patients.js';
import { regexp } from '$lib/utils/drizzle';
import { regexifiedPersonName } from '$lib/utils/querying';
import { json } from '@sveltejs/kit';
import { like } from 'drizzle-orm';

export async function GET({ url }) {
  // receive patient name in a request
  let query = url.searchParams.get('q') || '';
  query = query.trim();

  if (query === '') return new Response('Bad request', { status: 401 });

  const isIdNumber = /\d/g.test(query);

  try {
    const matchedPeople = await db
      .selectDistinctOn([inPatient_view.person_id])
      .from(inPatient_view)
      .where(
        isIdNumber
          ? like(inPatient_view.id_doc_number, `%${query}%`)
          : regexp('full_name', regexifiedPersonName(query))
      );

    // return people data
    return json(matchedPeople);
  } catch (error) {
    console.error(error);
  }
}
