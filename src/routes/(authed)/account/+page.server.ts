import { isUniqueValue, updateUser } from '$lib/server/db/operations/users';
import {
  arabicTriadicNamesPattern,
  egyptianMobileNumberPattern,
  emailPattern,
  nationalIdPattern,
  usernamePattern,
} from '$lib/stores/patterns';
import { fail, type Action } from '@sveltejs/kit';

export function load() {
  return {
    title: 'تعديل بيانات الحساب',
  };
}

const changeableFields = [
  'name',
  'username',
  'phone_number',
  'email',
  'national_id',
] as const;

export const actions = {
  username: createAction(
    'username',
    'اسم المستخدم',
    usernamePattern,
    'ينبغي أن يكون من حروف إنجليزية فقط أو شرطات "-"',
    true
  ),
  name: createAction(
    'name',
    'اسم الموظف',
    arabicTriadicNamesPattern,
    'يجب أن يكون اسما عربيا ثلاثيا على الأقل'
  ),
  phone_number: createAction('phone_number', 'رقم الموبايل', egyptianMobileNumberPattern),
  email: createAction('email', 'البريد الإلكتروني', emailPattern),
  national_id: createAction('national_id', 'الرقم القومي', nationalIdPattern),
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
      const isUnique = await isUniqueValue(fieldName, fieldValue);

      if (!isUnique)
        return fail(401, {
          message: `${fieldLabel} '${fieldValue}' يخص مستخدم آخر.`,
        });
    }

    const newFields: Partial<{ [K in (typeof changeableFields)[number]]: string }> = {};
    newFields[fieldName] = fieldValue;

    const result = await updateUser(locals.user!.id, newFields);

    if (!result.success) return fail(401, { message: 'حدث خطأ غير متوقع.' });

    const oldValue = locals.user?.[fieldName];

    locals.user![fieldName] = fieldValue;

    return {
      success: true,
      message: oldValue
        ? `تم تغيير ${fieldLabel} من '${oldValue}' إلى '${fieldValue}'`
        : `تم حفظ ${fieldLabel} '${fieldValue}'`,
    };
  };
}
