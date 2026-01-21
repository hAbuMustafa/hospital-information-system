import { db } from '$lib/server/db/';
import { inPatient_view, transfers_view } from '$server/db/schema/entities/patients';
import { json } from '@sveltejs/kit';
import { between } from 'drizzle-orm';

export async function GET({ url }) {
  const year = url.searchParams.get('year');
  const month = url.searchParams.get('month');

  if (!month || !year) {
    return new Response('Bad Request', { status: 401 });
  }

  const castYear = Number(year);
  const castMonth = Number(month);

  const admissions = await db
    .select()
    .from(inPatient_view)
    .where(
      between(
        inPatient_view.admission_time,
        new Date(castYear, castMonth - 1, 1),
        new Date(castYear, castMonth, 0)
      )
    );

  const discharges = await db
    .select()
    .from(inPatient_view)
    .where(
      between(
        inPatient_view.discharge_time,
        new Date(castYear, castMonth - 1, 1),
        new Date(castYear, castMonth, 0)
      )
    );

  const transfers = await db
    .select()
    .from(transfers_view)
    .where(
      between(
        transfers_view.timestamp,
        new Date(castYear, castMonth - 1, 1),
        new Date(castYear, castMonth, 0)
      )
    );

  return json({ admissions, discharges, transfers });
}
