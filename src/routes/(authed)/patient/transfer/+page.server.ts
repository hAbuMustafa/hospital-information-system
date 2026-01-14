import { ward_list } from '$lib/server/db/menus';
import { transferPatient } from '$lib/server/db/operations/patients';
import { failWithFormFieldsAndMessageArrayBuilder } from '$lib/utils/form-actions';

export async function load({ fetch, url }) {
  const pageProps = {
    title: 'تحويل مريض إلى قسم',
    wards: ward_list,
  };
  const patientFileId = url.searchParams.get('patient_file_id');
  const patientId = url.searchParams.get('patient_id');

  if (!patientFileId && !patientId) return pageProps;

  if (patientFileId && !/\d{2}\/\d+/.test(patientFileId)) {
    return { ...pageProps, message: 'رقم ملف المريض غير صحيح' };
  }

  if (patientId && !/\d{2}\/\d+/.test(patientId)) {
    return { ...pageProps, message: 'رقم المريض غير صحيح' };
  }

  const patientData = await fetch(`/api/patients/patient?id=${patientFileId}`).then(
    (r) => {
      if (r.ok) {
        return r.json();
      }
    }
  );

  if (!patientData)
    return {
      ...pageProps,
      message: `لا يوجد مريض بالرقم ${patientFileId || patientId}`,
    };

  return {
    ...pageProps,

    patient: patientData,
  };
}

export const actions = {
  default: async ({ request }) => {
    const formData = await request.formData();

    const patientId = formData.get('patient_id') as unknown as string;
    let selectedPatientRecentWardId = formData.get(
      'patient_recent_ward'
    ) as unknown as number;
    const patientName = formData.get('patient_name') as unknown as string;
    let transferTime = formData.get('transfer_date') as unknown as Date;
    let transferTo = formData.get('ward') as unknown as number;
    const transferNotes = formData.get('transfer_notes') as unknown as string;

    const failMessages = [];

    const failWithMessages = failWithFormFieldsAndMessageArrayBuilder({
      patientId,
      patientName,
      selectedPatientRecentWardId,
      transferTime,
      transferTo,
      transferNotes,
    });

    if (!patientId) failMessages.push('لم يتم العثور على المريض');
    if (!transferTime) failMessages.push('يجب إدخال تاريخ ووقت التحويل');
    if (!transferTo) failMessages.push('يجب تحديد القسم المحول إليه');

    if (failMessages.length) return failWithMessages(failMessages);

    try {
      transferTime = new Date(transferTime);
      transferTo = Number(transferTo);
      selectedPatientRecentWardId = Number(selectedPatientRecentWardId);
    } catch (error) {
      return failWithMessages([{ message: 'البيانات المدخلة غير صحيحة', type: 'error' }]);
    }

    const result = await transferPatient({
      patient_id: patientId,
      ward: transferTo,
      timestamp: transferTime,
      notes: transferNotes,
    });

    if (!result.success) {
      console.error(result.error);
      return failWithMessages([
        { message: 'حدث خطأ غير متوقع. برجاء المحاولة مرة أخرى', type: 'error' },
      ]);
    }

    return {
      success: true,
      message: `تم تحويل المريض "${patientName}" من "${
        ward_list.find((w) => w.id === selectedPatientRecentWardId)?.name
      }" إلى "${ward_list.find((w) => w.id === transferTo)?.name}"`,
    };
  },
};
