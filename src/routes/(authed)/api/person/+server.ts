import { db } from '$lib/server/db/';
import { People } from '$lib/server/db/schema/entities';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export async function GET({ url }) {
  const personId = url.searchParams.get('id');

  const [person] = await db
    .select()
    .from(People)
    .where(eq(People.id, Number(personId)));

  if (!person) return json({ message: 'No such person' }, { status: 404 });

  return json(person);
}
