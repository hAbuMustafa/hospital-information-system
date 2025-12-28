import { ward_list } from '$lib/server/db/menus';

export async function load({ fetch }) {
  const currentInpatient = await fetch('/api/patients/current-inpatient').then((d) =>
    d.json()
  );

  return {
    title: 'بيان الإشغال',
    wards: ward_list,
    patients: currentInpatient.map(
      (p: {
        id: string;
        name: string;
        admission_date: string;
        recent_ward: number;
        diagnosis: string;
      }) => ({
        ...p,
        admission_date: new Date(p.admission_date),
      })
    ),
  };
}
