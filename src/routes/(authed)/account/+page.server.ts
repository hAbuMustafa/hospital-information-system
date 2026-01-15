import {
  updateContactInfo,
  updateIdDocNumber,
  updatePerson,
} from '$lib/server/db/operations/people.js';
import {
  isUniqueUsername,
  isUniqueContactString,
  isUniqueNationalId,
  updateUser,
} from '$lib/server/db/operations/users';
import {
  arabicNamePattern,
  egyptianMobileNumberPattern,
  emailPattern,
  nationalIdPattern,
  usernamePattern,
} from '$lib/stores/patterns';
import { verifyEgyptianNationalId } from '$lib/utils/id-number-validation/egyptian-national-id.js';
import { fail, type Action } from '@sveltejs/kit';

export function load() {
  return {
    title: 'تعديل بيانات الحساب',
  };
}

const changeableFields = [
  'first_name',
  'father_name',
  'grandfather_name',
  'family_name',
  'username',
  'phone_number',
  'email',
  'id_doc_number',
] as const;

export const actions = {
  username: createAction(
    'username',
    'اسم المستخدم',
    usernamePattern,
    'ينبغي أن يكون من حروف إنجليزية فقط أو شرطات "-"',
    true
  ),
  first_name: createAction(
    'first_name',
    'اسم الموظف',
    arabicNamePattern,
    'يجب أن يكون اسما عربيا'
  ),
  father_name: createAction(
    'father_name',
    'اسم الأب',
    arabicNamePattern,
    'يجب أن يكون اسما عربيا'
  ),
  grandfather_name: createAction(
    'grandfather_name',
    'اسم الجد',
    arabicNamePattern,
    'يجب أن يكون اسما عربيا'
  ),
  family_name: createAction(
    'family_name',
    'اسم العائلة',
    arabicNamePattern,
    'يجب أن يكون اسما عربيا'
  ),
  phone_number: createAction('phone_number', 'رقم الموبايل', egyptianMobileNumberPattern),
  email: createAction('email', 'البريد الإلكتروني', emailPattern),
  id_doc_number: createAction(
    'id_doc_number',
    'الرقم القومي',
    nationalIdPattern,
    'صيغة الرقم القومي غير صحيحة',
    true
  ),
};

function createAction(
  fieldName: (typeof changeableFields)[number],
  fieldLabel: string,
  pattern: RegExp,
  patternErrorMessage?: string,
  mustBeUnique?: boolean
): Action {
  return async ({ request, locals }) => {
    const data = await request.formData();

    let fieldValue = data.get(fieldName) as unknown as string;

    if (!fieldValue) return fail(401, { message: `${fieldLabel} لا يمكن أن يكون فارغا` });

    fieldValue = fieldValue.trim().replace(/\s+/g, ' ');

    if (!pattern.test(fieldValue))
      return fail(401, {
        message: `صيغة ${fieldLabel} غير صحيحة. ${patternErrorMessage ?? ''}`,
      });

    if (fieldValue === locals.user?.[fieldName])
      return fail(401, { message: 'غيرت إيه انت كدة؟ 🤷🏻‍♂️' });

    if (mustBeUnique) {
      let isUnique = false;

      switch (fieldName) {
        case 'id_doc_number':
          let isValidNatId;
          try {
            isValidNatId = verifyEgyptianNationalId(fieldValue);
          } catch (err) {
            console.error(err);
          }

          if (!isValidNatId) return fail(400, { message: 'رقم قومي غير صحيح' });

          const natIdCheckResult = await isUniqueNationalId(fieldValue);
          isUnique = natIdCheckResult.people;
          break;
        case 'username':
          isUnique = await isUniqueUsername(fieldValue);
          break;

        default:
          await isUniqueContactString(fieldName as 'email' | 'phone_number', fieldValue);
      }

      if (!isUnique)
        return fail(401, {
          message: `${fieldLabel} '${fieldValue}' يخص مستخدم آخر.`,
        });
    }

    const newFields: Partial<{ [K in (typeof changeableFields)[number]]: string }> = {};
    newFields[fieldName] = fieldValue;

    const oldValue = locals.user?.[fieldName]!;

    let result: { success?: boolean; data?: any; error?: any };

    switch (fieldName) {
      case 'email':
      case 'phone_number':
        result = await updateContactInfo(oldValue, fieldValue);
        break;

      case 'id_doc_number':
        result = await updateIdDocNumber(oldValue, fieldValue);
        break;

      case 'username':
        result = await updateUser(locals.user?.user_id!, { username: fieldValue });
        break;

      default:
        result = await updatePerson(locals.user?.person_id!, newFields);
        break;
    }

    if (!result.success) {
      console.error(result.error);
      return fail(401, { message: 'حدث خطأ غير متوقع.' });
    }

    locals.user![fieldName] = fieldValue;

    return {
      success: true,
      message: oldValue
        ? `تم تغيير ${fieldLabel} من '${oldValue}' إلى '${fieldValue}'`
        : `تم حفظ ${fieldLabel} '${fieldValue}'`,
    };
  };
}
