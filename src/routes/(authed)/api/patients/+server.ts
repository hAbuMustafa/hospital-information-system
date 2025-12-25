import { db } from '$lib/server/db';
import { People, Patients, Wards } from '$lib/server/db/schema/entities';
import { regexp } from '$lib/utils/drizzle';
import { regexifiedPersonName } from '$lib/utils/querying';
import { json } from '@sveltejs/kit';
import { and, desc, eq, isNotNull, isNull, like, or } from 'drizzle-orm';

export async function GET({ url }) {
  let query = url.searchParams.get('q') || '';
  let currentResidentsOnly = url.searchParams.get('cro') || '';

  query = query.trim();
  currentResidentsOnly = currentResidentsOnly.trim();

  if (query === '') return new Response('Bad request', { status: 401 });

  const isNumber = /\d/g.test(query);

  const matchedPeople = await db
    .select({
      id: Patients.id,
      name: People.name,
      id_doc_num: People.id_doc_num,
      admission_date: Patients.admission_date,
      discharge_date: Patients.discharge_date,
      recent_ward_id: Patients.recent_ward,
      recent_ward: Wards.name,
    })
    .from(Patients)
    .leftJoin(People, eq(Patients.person_id, People.id))
    .leftJoin(Wards, eq(Patients.recent_ward, Wards.id))
    .where(
      and(
        currentResidentsOnly ? isNull(Patients.discharge_date) : isNotNull(Patients.id),
        isNumber
          ? or(like(Patients.id, `%${query}%`), like(People.id_doc_num, `%${query}%`))
          : regexp(`"People"."name"`, regexifiedPersonName(query))
      )
    )
    .orderBy(desc(Patients.admission_date));

  return json(matchedPeople);
}
