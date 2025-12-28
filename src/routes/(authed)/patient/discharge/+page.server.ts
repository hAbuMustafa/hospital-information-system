import { discharge_reason_list } from '$lib/server/db/menus';
import { dischargePatient } from '$lib/server/db/operations/patients.js';
import { failWithFormFieldsAndMessageArrayBuilder } from '$lib/utils/form-actions';

export async function load({ url, fetch }) {
  const pageProps = {
    title: 'تسجيل خروج مريض',
    discharge_reasons: discharge_reason_list.filter((r) => r.id !== 8),
  };
  const patientId = url.searchParams.get('patientId');

  if (!patientId) return pageProps;

  if (!/\d{2}\/\d+/.test(patientId)) {
    return { ...pageProps, message: 'رقم القيد غير صحيح' };
  }

  const patientData = await fetch(`/api/patients/patient?id=${patientId}`).then((r) => {
    if (r.ok) {
      return r.json();
    }
  });

  if (!patientData)
    return {
      ...pageProps,
      title: `لا يوجد مريض بالرقم ${patientId}`,
    };

  return {
    ...pageProps,

    patient: patientData,
  };
}

export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();

    const patientId = data.get('patient_id') as unknown as string;
    const patientName = data.get('patient_name') as unknown as string;
    let dischargeDate = data.get('discharge_date') as unknown as Date;
    let dischargeReason = data.get('discharge_reason') as unknown as number;
    const dischargeNotes = data.get('discharge_notes') as unknown as string;

    const failMessages = [];

    const failWithMessages = failWithFormFieldsAndMessageArrayBuilder({
      patientId,
      patientName,
      dischargeDate,
      dischargeReason,
      dischargeNotes,
    });

    if (!patientId) failMessages.push('لم يتم العثور على المريض');
    if (!dischargeDate) failMessages.push('وقت الخروج مطلوب');
    if (!dischargeReason) failMessages.push('سبب الخروج مطلوب');
    if (!dischargeNotes && (dischargeReason == 3 || dischargeReason == 9))
      failMessages.push(
        'يلزم كتابة ملاحظات حال كان سبب الخروج خارج الاختيارات المذكورة، أو في حال تم تحويل المريض لمستشفى آخر؛ يلزم ذكر المستشفى في الملاحظات'
      );

    if (failMessages.length) return failWithMessages(failMessages);

    try {
      dischargeDate = new Date(dischargeDate);
      dischargeReason = Number(dischargeReason);
    } catch (error) {
      return failWithMessages([{ message: 'البيانات المدخلة غير صحيحة', type: 'error' }]);
    }

    const result = await dischargePatient({
      id: patientId,
      discharge_date: dischargeDate,
      discharge_reason: dischargeReason,
      discharge_notes: dischargeNotes,
    });

    if (!result.success) {
      console.error(result.error);
      return failWithMessages([
        { message: 'حدث خطأ غير متوقع. برجاء المحاولة مرة أخرى', type: 'error' },
      ]);
    }

    return {
      success: true,
      message: `تم تسجيل خروج المريض "${result.data.name}" (قيد ${result.data.id})`,
    };
  },
};
