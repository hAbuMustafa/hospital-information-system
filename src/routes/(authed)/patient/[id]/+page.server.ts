import type {
  diagnosis_view,
  inPatient_view,
  transfers_view,
} from '$server/db/schema/entities/patients.js';

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
    `/api/patients/${patientId}`
  ).then((r) => {
    if (r.ok) {
      return r.json();
    }
  });

  if (!patientData)
    return {
      title: `لا يوجد مريض بالرقم ${patientId}`,
    };

  const patientDiagnoses: (typeof diagnosis_view.$inferSelect)[] = await fetch(
    `/api/patients/${patientId}/diagnoses`
  ).then((r) => {
    if (r.ok) {
      return r.json();
    }
  });

  const patientTransfers: (typeof transfers_view.$inferSelect)[] = await fetch(
    `/api/patients/${patientId}/transfers`
  ).then((r) => {
    if (r.ok) {
      return r.json();
    }
  });

  const patientAdmissions: (typeof inPatient_view.$inferSelect)[] = await fetch(
    `/api/patients/${patientId}/admissions?person_id=${patientData.person_id}`
  ).then((r) => {
    if (r.ok) {
      return r.json();
    }
  });

  return {
    title: patientData.full_name,
    patient: patientData,
    diagnoses: patientDiagnoses,
    transfers: patientTransfers,
    other_admissions: patientAdmissions,
  };
}
