import { db } from '$lib/server/db/';
import { Patient_wards, Patients } from '$lib/server/db/schema/entities';
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

  const admissions = await db.query.Patients.findMany({
    with: {
      Person: true,
    },
    where: between(
      Patients.admission_date,
      new Date(castYear, castMonth - 1, 1),
      new Date(castYear, castMonth, 0)
    ),
  });

  const discharges = await db.query.Patients.findMany({
    with: {
      Person: true,
      Patient_discharge_reason: true,
    },
    where: between(
      Patients.discharge_date,
      new Date(castYear, castMonth - 1, 1),
      new Date(castYear, castMonth, 0)
    ),
  });

  const transfers = await db.query.Patient_wards.findMany({
    with: {
      Patient: true,
    },
    where: between(
      Patient_wards.timestamp,
      new Date(castYear, castMonth - 1, 1),
      new Date(castYear, castMonth, 0)
    ),
  });

  return json({ admissions, discharges, transfers });
}
