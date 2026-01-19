import { ward_list } from '$server/db/menus';
import type { inPatient_view } from '$server/db/schema/entities/patients';

export async function load({ fetch }) {
  const currentInpatient: (typeof inPatient_view.$inferSelect)[] = await fetch(
    '/api/patients/current-inpatient'
  ).then((d) => d.json());

  const icuWard_ids = ward_list
    .filter((w) => w.tags.some((t) => t === 'icu'))
    .map((w) => w.id);

  return {
    title: 'بيان الرعاية المركزة',
    patients: currentInpatient.filter((p) =>
      icuWard_ids.some((w_id) => w_id === p.recent_ward_id)
    ),
    wards: ward_list.filter((w) => icuWard_ids.some((w_id) => w_id === w.id)),
  };
}
