import { id_doc_type_list } from '$lib/server/db/menus';
import { isAdmitted } from '$lib/server/db/operations/utils';
import { createPerson } from '$server/db/operations/people.js';
import { failWithFormFieldsAndMessageArrayBuilder } from '$lib/utils/form-actions';
import { verifyEgyptianNationalId } from '$lib/utils/id-number-validation/egyptian-national-id';
import { redirect } from '@sveltejs/kit';

export async function load() {
  return {
    title: 'تسجيل دخول مريض',
    id_doc_type_list,
  };
}

export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();

    let personId = data.get('person_id') as unknown as number;
    const firstName = data.get('first_name') as unknown as string;
    const fatherName = data.get('father_name') as unknown as string;
    const grandfatherName = data.get('grandfather_name') as unknown as string;
    const familyName = data.get('family_name') as unknown as string | null;
    let idDocType = data.get('id_doc_type') as unknown as number;
    const idDocNum = data.get('id_doc_num') as unknown as string;
    let gender = data.get('gender') as unknown as boolean;
    let birthdate = data.get('birthdate') as unknown as Date;

    const failWithMessages = failWithFormFieldsAndMessageArrayBuilder({
      personId,
      idDocType,
      idDocNum,
      gender,
      birthdate,
      firstName,
      fatherName,
      grandfatherName,
      familyName,
    });

    const failMessages = [];

    if (!firstName) failMessages.push(' اسم المريض مطلوب');
    if (!fatherName) failMessages.push(' اسم المريض مطلوب');
    if (!grandfatherName) failMessages.push(' اسم المريض مطلوب');
    if (!idDocType) failMessages.push('نوع الهوية مطلوبة');
    if (!idDocNum && idDocType != 6) failMessages.push('رقم الهوية مطلوب');
    if (idDocType == 1 && !verifyEgyptianNationalId(idDocNum))
      failMessages.push('صيغة رقم الهوية غير صحيحة');
    if (!gender) failMessages.push('الجنس/النوع مطلوب');
    if (!birthdate) failMessages.push('تاريخ الميلاد مطلوب');

    if (failMessages.length) return failWithMessages(failMessages);

    try {
      personId = Number(personId);
      idDocType = Number(idDocType);

      gender = Boolean(gender);

      birthdate = new Date(birthdate);
    } catch (e) {
      console.error(JSON.stringify(data, null, 4));
      console.error(e);
      failWithMessages([
        { message: 'خطأ في طبيعة البيانات المدخلة (أرقام أو تواريخ).', type: 'error' },
      ]);
    }

    const foundAdmitted = personId
      ? await isAdmitted(personId)
      : idDocType !== 6
      ? await isAdmitted(idDocType, idDocNum)
      : undefined;

    if (foundAdmitted) {
      return failWithMessages([
        {
          message: `المريض "${foundAdmitted.patient_name}" محجوز بالفعل في "${foundAdmitted.ward_name}"`,
          type: 'error',
        },
      ]);
    }

    if (personId) {
      return redirect(303, `/patient/admission/${personId}`);
    }

    const result = await createPerson({
      first_name: firstName.trim(),
      father_name: fatherName.trim(),
      grandfather_name: grandfatherName.trim(),
      family_name: familyName?.trim(),
      id_doc_type: idDocType,
      id_doc_num: idDocNum.trim(),
      gender,
      birthdate,
    });

    if (!result.success) {
      console.error(result.error);
      return failWithMessages([
        { message: 'حدث خطأ أثناء تسجيل بيانات المريض', type: 'error' },
      ]);
    }

    return redirect(303, `/patient/admission/${result.data.person_id}`);
  },
};
