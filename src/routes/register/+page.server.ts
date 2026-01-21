import {
  createUser,
  isUniqueUsername,
  isUniqueContactString,
  isUniqueNationalId,
} from '$lib/server/db/operations/users';
import {
  arabicNamePattern,
  egyptianMobileNumberPattern,
  emailPattern,
  nationalIdPattern,
  passwordPattern,
  usernamePattern,
} from '$lib/stores/patterns';
import { redirect, type Actions } from '@sveltejs/kit';
import { failWithFormFieldsAndMessageArrayBuilder } from '$lib/utils/form-actions';
import { verifyEgyptianNationalId } from '$lib/utils/id-number-validation/egyptian-national-id';

export function load() {
  return {
    title: 'إنشاء حساب',
  };
}

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();

    let first_name = formData.get('first_name') as string;
    let father_name = formData.get('father_name') as string;
    let grandfather_name = formData.get('grandfather_name') as string;
    let family_name = formData.get('family_name') as string | null;
    let national_id = formData.get('national-id') as string;
    let username = formData.get('username') as string;
    let phone_number = formData.get('phone-number') as string;
    let email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirm-password') as string;

    first_name = first_name?.trim();
    father_name = father_name?.trim();
    grandfather_name = grandfather_name?.trim();
    if (family_name) family_name = family_name?.trim();
    national_id = national_id?.trim();
    username = username?.trim();
    phone_number = phone_number?.trim();
    email = email?.trim();

    const failWithMessages = failWithFormFieldsAndMessageArrayBuilder({
      first_name,
      father_name,
      grandfather_name,
      family_name,
      national_id,
      username,
      phone_number,
      email,
    });

    if (
      !username ||
      !password ||
      !confirmPassword ||
      !first_name ||
      !father_name ||
      !grandfather_name ||
      !national_id ||
      !phone_number ||
      !email
    ) {
      return failWithMessages(['برجاء إدخال جميع البيانات المطلوبة']);
    }

    const failMessages = [];

    if (!usernamePattern.test(username as string)) {
      failMessages.push(
        'اسم المستخدم بصيغة غير صحيحة. يمكنك استخدام الأحرف والشرطات (-) فقط. ويجب أن يكون من 4 أحرف على الأقل أو 16 حرفا بحد أقصى'
      );
    }

    if (!passwordPattern.test(password as string)) {
      failMessages.push(
        'كلمة المرور بصيغة غير صحيحة. أحرف وأرقام ورموز (@$!%*?&) فقط. ومن 7 أحرف على الأقل.'
      );
    }

    if (password !== confirmPassword) {
      failMessages.push('كلمة السر وتأكيدها غير متطابقان');
    }

    if (!arabicNamePattern.test(first_name)) {
      failMessages.push('اسم الموظف الأول بصيغة غير صحيحة. يجب أن يكون بحروف عربية فقط');
    }

    if (!arabicNamePattern.test(father_name)) {
      failMessages.push('اسم الأب بصيغة غير صحيحة. يجب أن يكون بحروف عربية فقط');
    }

    if (!arabicNamePattern.test(grandfather_name)) {
      failMessages.push('اسم الجد بصيغة غير صحيحة. يجب أن يكون بحروف عربية فقط');
    }

    if (family_name && !arabicNamePattern.test(family_name)) {
      failMessages.push('اسم العائلة بصيغة غير صحيحة. يجب أن يكون بحروف عربية فقط');
    }

    if (!egyptianMobileNumberPattern.test(phone_number)) {
      failMessages.push('رقم الموبايل بصيغة غير صحيحة');
    }

    if (!emailPattern.test(email)) {
      failMessages.push('البريد الإلكتروني بصيغة غير صحيحة');
    }

    if (!nationalIdPattern.test(national_id) || !verifyEgyptianNationalId(national_id)) {
      failMessages.push('الرقم القومي غير صحيح');
    }

    // username used before?
    const isUniqueUser = await isUniqueUsername(username);
    if (!isUniqueUser) failMessages.push('اسم المستخدم مسجل مسبقا.');

    // email registered before?
    const isUniqueEmail = await isUniqueContactString('email', email);
    if (!isUniqueEmail.users)
      failMessages.push('البريد الإلكتروني مسجل مسبقا لأحد المستخدمين.');
    if (isUniqueEmail.users && !isUniqueEmail.people)
      failMessages.push(
        'البريد الإلكتروني مسجل مسبقا لأحد الأشخاص. يرجى الرجوع لمدير النظام لإنشاء حسابك.'
      );

    // phone-number registered before?
    const isUniquePhone_number = await isUniqueContactString(
      'phone_number',
      phone_number
    );
    if (!isUniquePhone_number.users)
      failMessages.push('رقم الهاتف مسجل مسبقا لأحد المستخدمين.');
    if (isUniquePhone_number.users && !isUniquePhone_number.people)
      failMessages.push(
        'رقم الهاتف مسجل مسبقا لأحد الأشخاص. يرجى الرجوع لمدير النظام لإنشاء حسابك.'
      );

    // national id registered before?
    const isUniqueNationalIdNumber = await isUniqueNationalId(national_id);
    if (!isUniqueNationalIdNumber.users)
      failMessages.push('الرقم القومي مسجل مسبقا لأحد المستخدمين.');
    if (isUniqueNationalIdNumber.users && !isUniqueNationalIdNumber.people)
      failMessages.push(
        'الرقم القومي مسجل مسبقا لأحد الأشخاص. يرجى الرجوع لمدير النظام لإنشاء حسابك.'
      );

    if (failMessages.length) return failWithMessages(failMessages);

    // EXECUTE Registration
    const registrationResult = await createUser({
      username,
      password: password as string,
      first_name,
      father_name,
      grandfather_name,
      family_name,
      national_id,
      email,
      phone_number,
    });

    if (!registrationResult.success) {
      console.error(registrationResult.error);
      return failWithMessages(['حدث خطأ غير متوقع']);
    }

    return {
      messages: [
        { message: `تم إنشاء حسابك ${username} بنجاح`, type: 'success' },
        { message: 'يلزم التواصل مع مدير النظام لتفعيل حسابك!', type: 'info' },
      ],
      redirect: redirect(303, '/'),
    };
  },
};
