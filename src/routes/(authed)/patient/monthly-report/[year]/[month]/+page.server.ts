import { ward_list } from '$server/db/menus.js';
import type {
  inPatient_view,
  transfers_view,
} from '$server/db/schema/entities/patients.js';

type MonthlyReportT = {
  admissions: (typeof inPatient_view.$inferSelect)[];
  discharges: App.Require<
    typeof inPatient_view.$inferSelect,
    'discharge_time' | 'discharge_reason'
  >[];
  transfers: (typeof transfers_view.$inferSelect)[];
};

export async function load({ params, fetch }) {
  const pageData = {
    title: `إحصائية الإشغال لشهر ${params.month.padStart(2, '0')} من العام ${
      params.year
    }`,
  };

  if (
    !/^20(2[4-9]|[3-9]\d)$/.test(params.year) ||
    !/^([1-9])|(0[1-9])|(1[0-2])$/.test(params.month)
  ) {
    return pageData;
  }

  const result: MonthlyReportT = await fetch(
    `/api/patients/monthly-report?year=${params.year}&month=${params.month}`
  ).then((r) => {
    if (r.ok) {
      return r.json();
    }
  });

  return {
    ...pageData,
    wards: ward_list,
    stats: result,
  };
}
