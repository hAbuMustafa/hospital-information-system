import { db } from '$lib/server/db';
import { inPatient_view } from '$server/db/schema/entities/patients';
import { json } from '@sveltejs/kit';
import { isNull } from 'drizzle-orm';

export async function GET() {
  const allPatients = await db
    .select()
    .from(inPatient_view)
    .where(isNull(inPatient_view.discharge_time));
  return json(allPatients);
}
