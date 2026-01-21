import { ward_list } from '$lib/server/db/menus';
import type { inPatient_view } from '$server/db/schema/entities/patients';

export async function load({ fetch }) {
  const currentInpatient: (typeof inPatient_view.$inferSelect)[] = await fetch(
    '/api/patients/current-inpatient'
  ).then((d) => d.json());

  return {
    title: 'بيان الإشغال',
    wards: ward_list,
    patients: currentInpatient,
  };
}
