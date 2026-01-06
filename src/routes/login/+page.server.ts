import { validateLogin } from '$lib/server/db/operations/auth';
import { getEndOfSessionTime } from '$lib/utils/auth/session';
import {
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  COOKIE_OPTIONS,
  ACCESS_TOKEN_MAX_AGE,
} from '$lib/utils/auth/jwt';
import { createTokens } from '$lib/server/db/operations/auth';
import { usernamePattern } from '$lib/stores/patterns';
import { getGravatarLinkFromEmail } from '$lib/utils/gravatar';
import { fail, redirect, type Actions } from '@sveltejs/kit';

export function load({ locals }) {
  if (locals.user) return redirect(303, '/');

  return {
    title: 'تسجيل الدخول',
  };
}

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const formData = await request.formData();
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    const redirectTo = formData.get('redirectTo');

    if (!username || !password) {
      return fail(400, {
        message: 'برجاء إدخال اسم المستخدم وكلمة المرور',
      });
    }

    if (
      !usernamePattern.test(username) ||
      !(password.length > 6 || password.length < 33)
    ) {
      return fail(401, {
        message: 'اسم المستخدم أو كلمة المرور غير صحيحة',
      });
    }

    const userData = await validateLogin(username, password);

    if (!userData) {
      return fail(401, {
        message: 'اسم المستخدم أو كلمة المرور غير صحيحة',
      });
    }

    if (!userData.role) {
      return fail(401, {
        message: 'حسابك لم يتم تفعيله بعد',
      });
    }

    if (userData.role === -1) {
      return fail(401, {
        message: 'لقد تم تعطيل حسابك. إذا كنت تظن هذا خطأ، برجاء الرجوع لمدير النظام.',
      });
    }

    const sessionMaxAge = getEndOfSessionTime();

    const result = await createTokens(
      {
        ...userData,
        gravatar: getGravatarLinkFromEmail(userData),
      },
      sessionMaxAge
    );

    if (!result.success)
      return fail(401, { message: 'حدث خطأ غير متوقع أثناء إثبات الجلسة' });

    cookies.set(ACCESS_COOKIE_NAME, result.accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });

    cookies.set(REFRESH_COOKIE_NAME, result.refreshToken, {
      ...COOKIE_OPTIONS,
      expires: sessionMaxAge,
    });

    if (!redirectTo) {
      return redirect(303, '/');
    } else {
      return redirect(303, redirectTo as string);
    }
  },
};
