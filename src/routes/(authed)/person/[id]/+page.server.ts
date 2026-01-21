import { id_doc_type_list } from '$lib/server/db/menus';
import { failWithFormFieldsAndMessageArrayBuilder } from '$lib/utils/form-actions';
import { verifyEgyptianNationalId } from '$lib/utils/id-number-validation/egyptian-national-id';
import {
  createIdDocNumber,
  isUniqueIdDocNumber,
  updateIdDocNumberOfPerson,
  updatePerson,
} from '$server/db/operations/people.js';
import type { people_view } from '$server/db/schema/entities/people';
import { error } from '@sveltejs/kit';

export async function load({ params, fetch }) {
  const personId = params.id;

  if (!/^\d+$/.test(personId)) return error(404, 'الرقم الطبي الموحد للمريض غير صحيح');

  const person: typeof people_view.$inferSelect = await fetch(
    `/api/person?id=${personId}`,
  ).then((r) => {
    if (r.ok) {
      return r.json();
    } else return null;
  });

  if (!person) error(404, 'لا يوجد مريض بالرقم الطبي الموحد المذكور');

  return {
    title: person.full_name,
    person,
    id_doc_type_list: id_doc_type_list,
  };
}

export const actions = {
  default: async ({ params, request, fetch }) => {
    let personId = params.id as unknown as number;

    const person: typeof people_view.$inferSelect = await fetch(
      `/api/person?id=${personId}`,
    ).then((r) => {
      if (r.ok) {
        return r.json();
      } else return null;
    });

    const formData = await request.formData();

    const firstName = formData.get('first_name') as unknown as string;
    const fatherName = formData.get('father_name') as unknown as string;
    const grandfatherName = formData.get('grandfather_name') as unknown as string;
    const familyName = formData.get('family_name') as unknown as string;
    let idDocType = formData.get('id_doc_type') as unknown as number;
    const idDocNumber = formData.get('id_doc_num') as unknown as string;
    let gender = formData.get('gender') as unknown as boolean;
    let birthdate = formData.get('birthdate');

    const failMessages = [];

    const failWithMessages = failWithFormFieldsAndMessageArrayBuilder({
      firstName,
      fatherName,
      grandfatherName,
      familyName,
      idDocType,
      idDocNumber,
      gender,
      birthdate,
    });

    if (!firstName) failMessages.push(' اسم المريض مطلوب');
    if (!fatherName) failMessages.push(' اسم المريض مطلوب');
    if (!grandfatherName) failMessages.push(' اسم المريض مطلوب');
    if (!idDocType) failMessages.push('نوع الهوية مطلوبة');
    if (!idDocNumber && idDocType != 6) failMessages.push('رقم الهوية مطلوب');
    if (idDocType == 1 && !verifyEgyptianNationalId(idDocNumber as string))
      failMessages.push('صيغة رقم الهوية غير صحيحة');
    if (!gender) failMessages.push('الجنس/النوع مطلوب');
    if (!birthdate) failMessages.push('تاريخ الميلاد مطلوب');

    if (failMessages.length) return failWithMessages(failMessages);

    try {
      personId = Number(personId);

      idDocType = Number(idDocType);

      gender = Boolean(gender);
    } catch (e) {
      console.error(JSON.stringify(formData, null, 4));
      console.error(e);
      failWithMessages([
        { message: 'خطأ في طبيعة البيانات المدخلة (أرقام أو تواريخ).', type: 'error' },
      ]);
    }

    if (
      firstName !== person.first_name ||
      fatherName !== person.father_name ||
      grandfatherName !== person.grandfather_name ||
      familyName !== person.family_name ||
      gender !== person.gender ||
      birthdate !== person.birthdate
    ) {
      const result = await updatePerson(personId, {
        first_name: firstName,
        father_name: fatherName,
        grandfather_name: grandfatherName,
        family_name: familyName,
        gender,
        birthdate: new Date(birthdate as string),
      });

      if (!result.success) {
        console.error(result.error);
        return failWithMessages([
          { message: 'حدث خطأ أثناء تسجيل بيانات المريض', type: 'error' },
        ]);
      }
    }

    if (idDocNumber && idDocType === 1 && idDocNumber !== person.id_doc_number) {
      const result = verifyEgyptianNationalId(idDocNumber);

      if (result === false)
        return failWithMessages([{ message: 'الرقم القومي غير صحيح', type: 'error' }]);
    }

    if (
      person.id_doc_number &&
      (idDocNumber !== person.id_doc_number || idDocType !== person.id_doc_type_id)
    ) {
      const result = await updateIdDocNumberOfPerson(personId, idDocType, idDocNumber);

      if (!result.success) {
        console.error(result.error);
        return failWithMessages([
          { message: 'حدث خطأ أثناء تغيير رقم الهوية', type: 'error' },
        ]);
      }
    } else if (person.id_doc_number === null && idDocNumber !== null) {
      const isUnique = await isUniqueIdDocNumber(idDocType, idDocNumber);

      if (!isUnique)
        return failWithMessages([{ message: 'الرقم القومي يخص شخص آخر', type: 'error' }]);

      const result = await createIdDocNumber(personId, idDocType, idDocNumber);
      if (!result.success) {
        console.error(result.error);
        return failWithMessages([
          { message: 'حدث خطأ أثناء إثبات رقم الهوية', type: 'error' },
        ]);
      }
    }

    return {
      success: true,
      message: `تم تعديل بيانات "${person.full_name}"`,
    };
  },
};
