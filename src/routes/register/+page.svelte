<script lang="ts">
  import { enhance } from '$app/forms';
  import {
    arabicNamePattern,
    egyptianMobileNumberPattern,
    nationalIdPattern,
    passwordPattern,
    usernamePattern,
  } from '$lib/stores/patterns';

  let { form } = $props();

  let userPassword = $state('');
  let userConfirmPassword = $state('');
</script>

<form method="post" use:enhance>
  <fieldset class="flex-form">
    <legend>البيانات الشخصية</legend>

    <div class="input-pair">
      <label for="first_name">الاسم الأول</label>
      <!-- svelte-ignore a11y_autofocus -->
      <input
        id="first_name"
        name="first_name"
        type="text"
        style:direction="rtl"
        required
        autofocus
        pattern={arabicNamePattern.source}
        autocomplete="off"
        autocorrect="off"
        spellcheck="false"
        value={form?.first_name ?? ''}
      />
    </div>

    <div class="input-pair">
      <label for="father_name">اسم الأب</label>
      <input
        id="father_name"
        name="father_name"
        type="text"
        style:direction="rtl"
        required
        pattern={arabicNamePattern.source}
        autocomplete="off"
        autocorrect="off"
        spellcheck="false"
        value={form?.father_name ?? ''}
      />
    </div>

    <div class="input-pair">
      <label for="grandfather_name">اسم الجد</label>
      <input
        id="grandfather_name"
        name="grandfather_name"
        type="text"
        style:direction="rtl"
        required
        pattern={arabicNamePattern.source}
        autocomplete="off"
        autocorrect="off"
        spellcheck="false"
        value={form?.grandfather_name ?? ''}
      />
    </div>

    <div class="input-pair">
      <label for="family_name">اسم العائلة</label>
      <input
        id="family_name"
        name="family_name"
        type="text"
        style:direction="rtl"
        pattern={arabicNamePattern.source}
        autocomplete="off"
        autocorrect="off"
        spellcheck="false"
        value={form?.family_name ?? ''}
      />
    </div>

    <div class="input-pair">
      <label for="national-id">الرقم القومي</label>
      <input
        id="national-id"
        name="national-id"
        type="text"
        required
        pattern={nationalIdPattern.source}
        autocomplete="off"
        autocorrect="off"
        spellcheck="false"
        value={form?.national_id ?? ''}
      />
    </div>
  </fieldset>

  <fieldset class="flex-form">
    <legend>بيانات المستخدم</legend>

    <div class="input-pair">
      <label for="username">اسم المستخدم</label>
      <input
        id="username"
        name="username"
        type="text"
        required
        pattern={usernamePattern.source}
        autocomplete="off"
        autocorrect="off"
        spellcheck="false"
        value={form?.username ?? ''}
      />
    </div>

    <div class="input-pair">
      <label for="phone-number">رقم الموبايل</label>
      <input
        id="phone-number"
        name="phone-number"
        type="text"
        required
        pattern={egyptianMobileNumberPattern.source}
        autocomplete="off"
        autocorrect="off"
        spellcheck="false"
        value={form?.phone_number ?? ''}
      />
    </div>

    <div class="input-pair">
      <label for="email">البريد الإلكتروني</label>
      <input
        id="email"
        name="email"
        type="email"
        required
        autocomplete="off"
        autocorrect="off"
        spellcheck="false"
        value={form?.email ?? ''}
      />
    </div>

    <div class="input-pair">
      <label for="password">كلمة السر</label>
      <input
        id="password"
        name="password"
        type="password"
        required
        bind:value={userPassword}
        pattern={passwordPattern.source}
        autocomplete="off"
      />
    </div>

    <div class="input-pair">
      <label for="confirm-password">تأكيد كلمة السر</label>
      <input
        id="confirm-password"
        name="confirm-password"
        type="password"
        required
        bind:value={userConfirmPassword}
        autocomplete="off"
        class:unequal={userPassword &&
          userConfirmPassword &&
          userPassword !== userConfirmPassword}
        class:equal={userPassword &&
          userConfirmPassword &&
          userPassword === userConfirmPassword}
      />
    </div>
  </fieldset>

  <input type="submit" value="أنشئ الحساب" />
</form>

<style>
  form {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 6fr 1fr;
    gap: 1rem;
    width: 100%;

    @media (max-width: 400px) {
      display: flex;
      flex-direction: column;
    }
  }

  input[type='submit'] {
    grid-column: 1/-1;
  }
</style>
