import { discharge_reason_list } from '$lib/server/db/menus';
import {
  checkIfHospitalized,
  dischargePatient,
} from '$lib/server/db/operations/patients';
import { failWithFormFieldsAndMessageArrayBuilder } from '$lib/utils/form-actions';
import type { inPatient_view } from '$server/db/schema/entities/patients';

export async function load({ url, fetch }) {
  const pageProps = {
    title: 'تسجيل خروج مريض',
    discharge_reasons: discharge_reason_list.filter((r) => r.id !== 8),
  };
  const patientId = url.searchParams.get('patient_id');

  if (!patientId) return pageProps;

  if (patientId && !/^\d+$/.test(patientId)) {
    return { ...pageProps, message: 'رقم المريض غير صحيح' };
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
      ...pageProps,
      message: `لا يوجد مريض بالرقم ${patientId}`,
    };

  return {
    ...pageProps,

    patient: patientData,
  };
}

export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();

    let patientId = data.get('patient_id') as unknown as number;
    const patientName = data.get('patient_name') as unknown as string;
    let dischargeTime = data.get('discharge_date') as unknown as Date;
    let dischargeReason = data.get('discharge_reason') as unknown as number;
    const dischargeNotes = data.get('discharge_notes') as unknown as string;

    const failMessages = [];

    const failWithMessages = failWithFormFieldsAndMessageArrayBuilder({
      patientId,
      patientName,
      dischargeTime,
      dischargeReason,
      dischargeNotes,
    });

    if (!patientId) failMessages.push('لم يتم العثور على المريض');
    if (!dischargeTime) failMessages.push('وقت الخروج مطلوب');
    if (!dischargeReason) failMessages.push('سبب الخروج مطلوب');
    if (!dischargeNotes && (dischargeReason == 3 || dischargeReason == 9))
      failMessages.push(
        'يلزم كتابة ملاحظات حال كان سبب الخروج خارج الاختيارات المذكورة، أو في حال تم تحويل المريض لمستشفى آخر؛ يلزم ذكر المستشفى في الملاحظات'
      );

    if (failMessages.length) return failWithMessages(failMessages);

    try {
      patientId = Number(patientId);
      dischargeTime = new Date(dischargeTime);
      dischargeReason = Number(dischargeReason);
    } catch (error) {
      return failWithMessages([{ message: 'البيانات المدخلة غير صحيحة', type: 'error' }]);
    }

    const isHospitalized = await checkIfHospitalized(patientId);

    if (!isHospitalized)
      return failWithMessages([
        {
          message: 'لا يمكن تسجيل خروج لمريض غير مقيم بالمستشفى',
          type: 'error',
        },
      ]);

    const result = await dischargePatient({
      patient_id: patientId,
      timestamp: dischargeTime,
      discharge_reason: dischargeReason,
      notes: dischargeNotes,
    });

    if (!result.success) {
      console.error(result.error);
      return failWithMessages([
        { message: 'حدث خطأ غير متوقع. برجاء المحاولة مرة أخرى', type: 'error' },
      ]);
    }

    return {
      success: true,
      message: `تم تسجيل خروج المريض "${patientName}"`,
    };
  },
};
