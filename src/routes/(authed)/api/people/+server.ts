import { db } from '$lib/server/db/';
import { People } from '$lib/server/db/schema/entities';
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

  const matchedPeople = await db
    .select()
    .from(People)
    .where(
      isIdNumber
        ? like(People.id_doc_num, `%${query}%`)
        : regexp('name', regexifiedPersonName(query))
    );

  // return people data
  return json(matchedPeople);
}
