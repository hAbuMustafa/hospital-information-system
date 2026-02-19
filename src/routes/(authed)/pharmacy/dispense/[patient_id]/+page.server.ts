import type { inPatient_view } from '$server/db/schema/entities/patients';

export async function load({ params, fetch }) {
  const pageProps = {
    title: 'صرف لمريض',
  };

  if (!/^\d+$/.test(params.patient_id)) {
    return { ...pageProps, message: 'رقم المريض غير صحيح' };
  }

  const patientData: typeof inPatient_view.$inferSelect = await fetch(
    `/api/patients/${params.patient_id}`
  ).then((r) => {
    if (r.ok) {
      return r.json();
    }
  });

  if (!patientData)
    return {
      ...pageProps,
      message: `لا يوجد مريض بالرقم ${params.patient_id}`,
    };

  if (patientData.discharge_time)
    return {
      title: `صرف للمريض ${patientData.full_name}`,
      message: `المريض ${patientData.full_name} غير مقيم بالمستشفى`,
    };

  return {
    title: `صرف للمريض: ${patientData.full_name}`,

    patient: patientData,
  };
}
