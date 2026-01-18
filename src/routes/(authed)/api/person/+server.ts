import { db } from '$server/db/';
import { people_view } from '$server/db/schema/entities/people';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export async function GET({ url }) {
  const personId = url.searchParams.get('id');

  const [person] = await db
    .select()
    .from(people_view)
    .where(eq(people_view.person_id, Number(personId)));

  if (!person) return json({ message: 'No such person' }, { status: 404 });

  return json(person);
}
