import type { inPatient_view } from '$server/db/schema/entities/patients.js';

export async function load({ fetch, params }) {
  const patientId = params.id;

  if (!patientId) {
    return { message: 'برجاء اختيار مريض أولا' };
  }

  if (!/^\d+$/.test(patientId)) {
    return { message: 'برجاء إدخال أرقام صحيحة' };
  }

  if (Number(patientId) < 1) {
    return { message: 'المريض غير موجود' };
  }

  const patientData: typeof inPatient_view.$inferSelect = await fetch(
    `/api/patients/patient?patient_id=${patientId}`
  ).then((r) => {
    if (r.ok) {
      return r.json();
    }
  });

  if (!patientData)
    return {
      title: `لا يوجد مريض بالرقم ${patientId}`,
    };

  return {
    title: patientData.full_name,
    patient: patientData,
  };
}
